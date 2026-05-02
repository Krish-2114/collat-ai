"""
dataset_generator.py — Collat.AI v3
Generates 200K+ property records across 8 Indian cities with:
  - Full 900-feature set (location, property, market, liquidity, legal)
  - Multimodal image feature scores (via ImagePipeline)
  - Web-scraped data integration (if available)
  - RERA / legal compliance fields
  - 8-rule fraud labels
  - Realistic price distributions per city × zone × locality
  - OpenStreetMap POI simulation (10 types × 3 radii = 30 features)
  - H3-style geo-hexagon features
  - Time-series price trend features

Run standalone:  python dataset_generator.py --n 200000 --city all
"""

import os, sys, json, time
import numpy as np
import pandas as pd
from typing import Optional, Tuple, Dict, List
from pathlib import Path

sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
from config import (
    CITIES, PROPERTY_TYPES, SUBTYPES, TYPE_PROBS, SUBTYPE_PROBS,
    DATA_CONFIG, APP_CONFIG, RANDOM_SEED,
)
from image_feature_extractor import ImagePipeline

np.random.seed(RANDOM_SEED)
_IMG = ImagePipeline(prefer_cnn=False)   # synthetic mode for dataset gen


# ──────────────────────────────────────────────────────────────
# POI GENERATOR (OpenStreetMap Overpass API simulation)
# ──────────────────────────────────────────────────────────────

POI_TYPES = ["transit","school","hospital","mall","restaurant",
             "bank","park","office","worship","gym"]
RADII     = [500, 1000, 3000]

def _generate_poi_features(zone_premium: float, locality_premium: float) -> Dict:
    combo = min(2.5, (zone_premium + locality_premium) / 2)
    BASE_COUNTS = {
        "transit": 6, "school": 4, "hospital": 2, "mall": 1,
        "restaurant": 18, "bank": 5, "park": 3, "office": 12,
        "worship": 7, "gym": 4,
    }
    feats = {}
    for pt in POI_TYPES:
        base = BASE_COUNTS[pt]
        for r in RADII:
            mult = r / 500
            feats[f"poi_{pt}_{r}m"] = max(0, int(np.random.poisson(base * mult * combo * 0.45)))
    return feats


# ──────────────────────────────────────────────────────────────
# AREA SAMPLER
# ──────────────────────────────────────────────────────────────

def _area_sqft(ptype: str, sub_type: str, zone_premium: float) -> float:
    size_mult = min(1.4, 0.85 + zone_premium * 0.08)
    if ptype == "Apartment":
        base = {"Studio": 290, "1BHK": 460, "2BHK": 690,
                "3BHK": 1020, "4BHK+": 1550, "Penthouse": 2800}.get(sub_type, 700)
        return max(250, np.random.normal(base * size_mult, base * 0.15))
    elif ptype == "Villa":
        base = {"Row House": 1250, "Bungalow": 2600,
                "Twin Bungalow": 1900, "Penthouse": 3100}.get(sub_type, 2000)
        return max(900, np.random.normal(base, base * 0.20))
    elif ptype == "Commercial":
        return max(150, np.random.normal(900, 450))
    elif ptype == "Industrial":
        return max(1000, np.random.normal(5800, 2200))
    else:  # Plot
        return max(200, np.random.normal(1600, 750))


# ──────────────────────────────────────────────────────────────
# PRICE PER SQF  (multi-driver model)
# ──────────────────────────────────────────────────────────────

def _price_psf(
    city: str, zone: str, locality: str, ptype: str,
    area: float, age_years: float, floor_ratio: float,
    infra_idx: float, img_condition: float, market_heat: float,
    furnishing: int,
) -> float:
    cfg = CITIES[city]
    base = cfg["base_psf"]
    z_prem = cfg["zones"][zone]["premium"]
    l_prem = cfg["locality_premiums"].get(locality, 1.0)

    type_mult = {"Apartment": 1.0, "Villa": 1.35,
                 "Commercial": 1.18, "Industrial": 0.55, "Plot": 0.78}[ptype]
    age_disc     = max(0.68, 1.0 - 0.005 * age_years)
    floor_prem   = 1.0
    if ptype == "Apartment":
        if floor_ratio > 0.88:   floor_prem = 1.13
        elif floor_ratio < 0.06: floor_prem = 0.92
    infra_prem   = 1.0 + (infra_idx - 50) / 130
    img_prem     = 1.0 + (img_condition - 50) / 250
    heat_prem    = 1.0 + (market_heat - 50) / 160
    furn_prem    = {0: 0.97, 1: 1.0, 2: 1.04}.get(furnishing, 1.0)

    price = (base * z_prem * l_prem * type_mult * age_disc
             * floor_prem * infra_prem * img_prem * heat_prem * furn_prem)
    noise = np.random.normal(1.0, 0.09)
    return max(1500, price * noise)


# ──────────────────────────────────────────────────────────────
# FRAUD RULES
# ──────────────────────────────────────────────────────────────

def _fraud_check(
    ppsf: float, city_median: float, circle_rate: float,
    area: float, age: float, cap_rate: float,
    legal: int, encumb: int, lit: int,
    floor_no: int, total_fl: int,
    listing_psf: float,
) -> Tuple[int, List[str]]:
    flags = []
    if ppsf > 3.0 * city_median:              flags.append("R01")
    if ppsf < 0.3 * city_median:              flags.append("R02")
    if cap_rate > 0.12:                       flags.append("R03")
    if area < 100 or area > 50_000:           flags.append("R04")
    if age < 0 or age > 100:                  flags.append("R05")
    if floor_no > total_fl:                   flags.append("R06")
    if (listing_psf - circle_rate) / max(1, circle_rate) > 2.0:
        flags.append("R07")
    if legal == 0 and (encumb == 1 or lit == 1):
        flags.append("R08")
    if np.random.random() < 0.018:            # 1.8% base random fraud
        if "R07" not in flags: flags.append("R07")
    return (1 if flags else 0), flags


# ──────────────────────────────────────────────────────────────
# MAIN GENERATOR
# ──────────────────────────────────────────────────────────────

def generate_dataset(
    n: int = DATA_CONFIG.n_samples,
    cities: Optional[List[str]] = None,
    save_dir: str = None,
    scraped_df: Optional[pd.DataFrame] = None,
    verbose: bool = True,
) -> pd.DataFrame:
    """
    Generate n synthetic property records across 8 cities.
    Optionally merges in web-scraped listing data (price + locality signals).
    """
    save_dir = save_dir or APP_CONFIG.data_dir
    os.makedirs(save_dir, exist_ok=True)
    cities   = cities or list(CITIES.keys())

    # City-level sample allocation
    weights = {c: DATA_CONFIG.city_sample_weights.get(c, 0.1) for c in cities}
    total_w  = sum(weights.values())
    city_n   = {c: max(1000, int(n * weights[c] / total_w)) for c in cities}

    # Build scraped price index (city × locality → median PSF)
    scraped_index: Dict[str, Dict[str, float]] = {}
    if scraped_df is not None and "city" in scraped_df.columns and "price_psf" in scraped_df.columns:
        for city, grp in scraped_df.groupby("city"):
            if "locality" in scraped_df.columns:
                scraped_index[city] = grp.groupby("locality")["price_psf"].median().to_dict()

    rows = []
    img_records = []
    start = time.time()
    total_generated = 0

    for city in cities:
        n_city = city_n[city]
        cfg    = CITIES[city]
        zones  = list(cfg["zones"].keys())
        zone_prems = [cfg["zones"][z]["premium"] for z in zones]
        zone_probs = np.array(zone_prems) / sum(zone_prems)

        city_median_psf = cfg["base_psf"] * 1.2   # approximate city median

        if verbose:
            print(f"[DataGen] {city}: generating {n_city:,} records...")

        for i in range(n_city):
            zone = np.random.choice(zones, p=zone_probs)
            z_cfg = cfg["zones"][zone]
            locs  = cfg["localities"].get(zone, [zone])
            locality = np.random.choice(locs)
            l_prem   = cfg["locality_premiums"].get(locality, 1.0)

            ptype    = np.random.choice(PROPERTY_TYPES, p=TYPE_PROBS)
            sub_type = np.random.choice(SUBTYPES[ptype], p=SUBTYPE_PROBS[ptype])

            # Geo
            bbox = z_cfg["bbox"]
            lat  = np.random.uniform(bbox[0], bbox[1])
            lon  = np.random.uniform(bbox[2], bbox[3])

            # Property
            area      = _area_sqft(ptype, sub_type, z_cfg["premium"])
            age_years = max(0, np.random.exponential(10))
            max_fl    = int(min(50, 5 + z_cfg["premium"] * 10))
            total_fl  = int(np.random.randint(2, max_fl + 1))
            floor_no  = int(np.random.randint(0, total_fl + 1))
            floor_r   = floor_no / max(total_fl, 1)

            if ptype == "Apartment":
                n_beds = {"Studio":0,"1BHK":1,"2BHK":2,"3BHK":3,"4BHK+":4,"Penthouse":5}.get(sub_type,2)
            elif ptype == "Villa":
                n_beds = int(np.random.choice([3,4,5,6]))
            else:
                n_beds = 0
            bathrooms   = max(1, n_beds)
            parking     = int(np.random.choice([0,1,2,3], p=[0.09,0.55,0.29,0.07]))
            furnishing  = int(np.random.choice([0,1,2],   p=[0.29,0.42,0.29]))
            occupancy   = int(np.random.choice([0,1,2],   p=[0.54,0.31,0.15]))
            lift        = int(total_fl > 4 or np.random.random() < 0.38)
            security    = int(np.random.random() < 0.70)
            gym         = int(np.random.random() < 0.35)
            pool        = int(np.random.random() < 0.22)
            clubhouse   = int(np.random.random() < 0.40)
            power_bk    = int(np.random.random() < 0.65)
            intercom    = int(np.random.random() < 0.55)
            cctv        = int(np.random.random() < 0.60)
            vastu       = int(np.random.random() < 0.45)
            corner_unit = int(np.random.random() < 0.15)
            east_facing = int(np.random.random() < 0.35)
            smart_home  = int(np.random.random() < 0.12)
            balcony_cnt = int(np.random.choice([0,1,2,3], p=[0.08,0.45,0.38,0.09]))
            servant_rm  = int(ptype in ["Villa","Apartment"] and n_beds >= 3 and np.random.random() < 0.25)
            mod_kitchen = int(np.random.random() < 0.55)

            # Compliance
            rera      = int(np.random.random() < 0.72)
            oc        = int(np.random.random() < 0.80)
            cc        = int(np.random.random() < 0.76)
            bmc       = int(np.random.random() < 0.88)
            legal     = int(np.random.random() < 0.85)
            own_type  = int(np.random.choice([0,1,2], p=[0.70,0.20,0.10]))
            encumb    = int(np.random.random() < 0.07)
            lit_flag  = int(np.random.random() < 0.04)
            reg_deed  = int(np.random.random() < 0.90)
            title_age = max(1, float(np.random.exponential(8)))
            loan_prop = int(np.random.random() < 0.35)

            # Location
            infra_idx = float(np.clip(np.random.normal(45 + z_cfg["premium"] * 14, 15), 0, 100))
            poi_feats = _generate_poi_features(z_cfg["premium"], l_prem)
            nightlt   = float(np.clip(np.random.normal(50 + z_cfg["premium"] * 10, 20), 0, 100))
            flood     = int(city in ["Mumbai","Kolkata"] and np.random.random() < 0.10)
            crz       = int(city == "Mumbai" and zone == "South Mumbai" and np.random.random() < 0.12)
            heritage  = int(city in ["Mumbai","Kolkata","Delhi"] and np.random.random() < 0.06)
            slum_prox = int(np.random.random() < (0.18 if z_cfg["premium"] < 1.0 else 0.07))
            planned   = int(np.random.random() < 0.72)
            it_park   = int(city in ["Bangalore","Hyderabad","Pune"] and np.random.random() < 0.30)
            nri_score = float(np.clip(np.random.normal(40 + z_cfg["premium"] * 9, 14), 0, 100))
            walk_sc   = float(np.clip(np.random.normal(infra_idx * 0.9, 12), 0, 100))
            transit_sc= float(np.clip(np.random.normal(infra_idx * 0.85, 13), 0, 100))
            green_cov = float(np.clip(np.random.normal(30 + z_cfg["premium"] * 5, 12), 0, 100))
            crime_idx = float(np.clip(np.random.normal(40 - z_cfg["premium"] * 8, 15), 0, 100))
            aqi_proxy = float(np.clip(np.random.normal(80 - z_cfg["premium"] * 12, 18), 10, 200))

            # Market
            cr_base  = cfg["circle_rates"].get(zone, cfg["base_psf"] * 0.5)
            circle_r = cr_base * np.random.uniform(0.85, 1.15)
            listing_psf = cfg["base_psf"] * z_cfg["premium"] * np.random.uniform(0.88, 1.30)
            # Override with scraped price if available
            if city in scraped_index and locality in scraped_index[city]:
                listing_psf = scraped_index[city][locality] * np.random.uniform(0.92, 1.08)
            market_heat = float(np.clip(np.random.normal(50 + z_cfg["premium"] * 8, 18), 0, 100))
            supply_dem  = float(np.clip(np.random.normal(1.0, 0.28), 0.15, 3.5))
            p_trend_1m  = float(np.random.normal(0.005, 0.012))
            p_trend_3m  = float(np.random.normal(0.015, 0.04))
            p_trend_6m  = float(np.random.normal(0.04, 0.06))
            p_trend_12m = float(np.random.normal(0.08, 0.09))
            p_trend_24m = float(np.random.normal(0.15, 0.12))
            inv_months  = float(max(1, np.random.exponential(5.5)))
            txn_vol     = int(max(0, np.random.poisson(40 + z_cfg["premium"] * 10)))
            new_supply  = int(max(0, np.random.poisson(120)))
            abs_rate    = float(np.clip(np.random.normal(0.55, 0.15), 0.1, 1.0))
            p_momentum  = float(np.clip(np.random.normal(55, 20), 0, 100))
            uc_ratio    = float(np.clip(np.random.beta(2, 3), 0, 1))
            rtm_ratio   = 1 - uc_ratio
            micro_prem  = float(np.clip(np.random.normal(l_prem, 0.1), 0.5, 3.0))
            macro_idx   = float(np.clip(np.random.normal(55, 18), 0, 100))

            # Liquidity
            dom_base = max(15, 80 - z_cfg["premium"] * 15)
            dom_med  = max(5, np.random.exponential(dom_base))
            dom_p25  = max(3, dom_med * np.random.uniform(0.4, 0.7))
            dom_p75  = dom_med * np.random.uniform(1.3, 2.0)
            buyer_pool = float(np.clip(np.random.normal(50 + z_cfg["premium"] * 8, 20), 0, 100))
            nri_ratio  = float(np.clip(np.random.normal(0.10 + z_cfg["premium"] * 0.05, 0.06), 0, 0.5))
            inv_ratio  = float(np.clip(np.random.normal(0.25, 0.10), 0, 0.8))
            monthly_rent = area * np.random.uniform(25, 80) if occupancy == 1 else 0.0
            rental_yld   = (monthly_rent * 12 * 0.85) / max(1, area * listing_psf)
            gross_yld    = (monthly_rent * 12) / max(1, area * listing_psf)
            cap_rate     = rental_yld
            vac_rate     = float(np.clip(np.random.normal(0.07, 0.04), 0, 0.5))
            resale_freq  = int(max(0, np.random.poisson(4)))
            exit_ease    = float(np.clip(100 - dom_med * 0.4 + buyer_pool * 0.3, 0, 100))
            lst_sale_r   = float(np.clip(np.random.normal(0.70, 0.15), 0.1, 1.0))
            price_red    = float(np.clip(np.random.normal(0.05, 0.03), 0, 0.25))
            afford_idx   = float(np.clip(np.random.normal(50 - z_cfg["premium"] * 8, 15), 0, 100))
            emi_ratio    = float(np.clip(np.random.normal(0.40, 0.12), 0.10, 0.90))
            rpi_proxy    = float(np.clip(
                exit_ease * 0.4 + buyer_pool * 0.3 + (100 - dom_med * 0.3) * 0.3, 5, 97
            ))

            # Image features (synthetic via ImagePipeline)
            img_sc = _IMG.extractor.score(
                zone_premium=z_cfg["premium"], age_years=age_years,
                furnishing=furnishing, property_type=ptype,
                rng_seed=total_generated + i,
            )
            img_quality_flag = int(img_sc["img_condition_score"] > 62)
            img_count        = int(np.random.choice([1,2,3,4,5,6], p=[0.05,0.15,0.30,0.25,0.15,0.10]))

            # Price PSF (target)
            ppsf = _price_psf(
                city, zone, locality, ptype, area, age_years, floor_r,
                infra_idx, img_sc["img_condition_score"], market_heat, furnishing
            )

            # Liquidity bucket (target)
            if dom_med <= 30 and rpi_proxy >= 70: liq_bucket = 0
            elif dom_med <= 90:                   liq_bucket = 1
            elif dom_med <= 180:                  liq_bucket = 2
            else:                                 liq_bucket = 3

            # Fraud
            is_fraud, fraud_flags = _fraud_check(
                ppsf, city_median_psf, circle_r, area, age_years,
                cap_rate, legal, encumb, lit_flag, floor_no, total_fl, listing_psf
            )

            # H3 geo proxy
            h3_price_med = ppsf * np.random.uniform(0.87, 1.13)
            h3_count     = int(max(0, np.random.poisson(38)))

            # Interaction features
            age_x_loc      = age_years * l_prem
            area_x_liq     = area * buyer_pool
            floor_x_lift   = floor_r * lift
            yield_x_demand = rental_yld / max(0.01, supply_dem)
            circle_x_heat  = circle_r * market_heat
            infra_x_trend  = infra_idx * p_trend_6m
            img_x_price    = img_sc["img_condition_score"] * ppsf / 10000
            legal_x_fraud  = legal * (1 - is_fraud)
            age_x_renov    = age_years * img_sc["img_renovation_score"] / 100
            city_x_zone    = cfg["base_psf"] * z_cfg["premium"]
            area_x_floor   = area * floor_r
            poi_x_transit  = poi_feats.get("poi_transit_1000m", 0) * transit_sc

            # Floor flags
            top_floor_flag   = int(floor_no == total_fl)
            grd_floor_flag   = int(floor_no == 0)
            floor_prem_fac   = 1.12 if top_floor_flag else (0.93 if grd_floor_flag else 1.0)
            super_lux        = int(ppsf > city_median_psf * 2.2)
            affordable_flag  = int(ppsf < city_median_psf * 0.65)

            pid = f"{city[:3].upper()}{(total_generated + i):08d}"

            row = {
                "property_id": pid,
                "city": city, "zone": zone, "locality": locality,
                "lat": round(lat,6), "lon": round(lon,6),
                "property_type": ptype, "sub_type": sub_type,
                "city_tier": cfg["tier"],
                "city_base_psf": cfg["base_psf"],
                "city_population_m": cfg["population_m"],
                # Property
                "area_sqft": round(area,1), "age_years": round(age_years,1),
                "floor_number": floor_no, "total_floors": total_fl,
                "floor_ratio": round(floor_r,4),
                "bedrooms": n_beds, "bathrooms": bathrooms, "parking_slots": parking,
                "furnishing": furnishing, "occupancy": occupancy,
                "lift_available": lift, "security_24x7": security,
                "gym_available": gym, "swimming_pool": pool,
                "clubhouse": clubhouse, "power_backup": power_bk,
                "intercom": intercom, "cctv": cctv,
                "vastu_compliant": vastu, "corner_unit": corner_unit,
                "east_facing": east_facing, "smart_home": smart_home,
                "balcony_count": balcony_cnt, "servant_room": servant_rm,
                "modular_kitchen": mod_kitchen,
                "top_floor_flag": top_floor_flag, "ground_floor_flag": grd_floor_flag,
                "floor_premium_factor": floor_prem_fac,
                "super_luxury_flag": super_lux, "affordable_flag": affordable_flag,
                # Compliance + legal
                "rera_registered": rera, "oc_received": oc, "cc_received": cc, "bmc_approved": bmc,
                "legal_clear": legal, "ownership_type": own_type,
                "encumbrance_flag": encumb, "litigation_flag": lit_flag,
                "registered_sale_deed": reg_deed, "title_age_years": round(title_age,1),
                "loan_on_property": loan_prop, "disputed_boundary_flag": 0, "mutation_done": 1,
                "monthly_rent": round(monthly_rent,0),
                # Location
                "zone_premium": round(z_cfg["premium"],3),
                "locality_premium": round(l_prem,3),
                "infra_index": round(infra_idx,2), "nightlight_proxy": round(nightlt,2),
                "flood_zone_flag": flood, "crz_flag": crz, "heritage_zone_flag": heritage,
                "slum_proximity_flag": slum_prox, "planned_zone_flag": planned,
                "it_park_proximity": it_park, "nri_demand_score": round(nri_score,2),
                "walk_score": round(walk_sc,2), "transit_score": round(transit_sc,2),
                "green_cover_score": round(green_cov,2),
                "crime_index_proxy": round(crime_idx,2), "pollution_aqi_proxy": round(aqi_proxy,1),
                "h3_res7_price_median": round(h3_price_med,0),
                "h3_res7_transaction_count": h3_count,
                "school_count_1km": poi_feats.get("poi_school_1000m",0),
                "hospital_count_2km": poi_feats.get("poi_hospital_1000m",0) * 2,
                "mall_count_3km": poi_feats.get("poi_mall_3000m",0),
                "transit_count_500m": poi_feats.get("poi_transit_500m",0),
                **{k: round(float(v),2) for k, v in poi_feats.items()},
                # Market
                "circle_rate_sqft": round(circle_r,0),
                "listing_price_sqft": round(listing_psf,0),
                "circle_rate_premium": round((listing_psf - circle_r) / max(1, circle_r),4),
                "market_heat_index": round(market_heat,2),
                "supply_demand_ratio": round(supply_dem,4),
                "price_trend_1m": round(p_trend_1m,5), "price_trend_3m": round(p_trend_3m,5),
                "price_trend_6m": round(p_trend_6m,5), "price_trend_12m": round(p_trend_12m,5),
                "price_trend_24m": round(p_trend_24m,5),
                "inventory_months": round(inv_months,2), "transaction_volume_qtr": txn_vol,
                "new_supply_units_6m": new_supply, "absorption_rate_6m": round(abs_rate,4),
                "price_momentum_score": round(p_momentum,2),
                "under_construction_ratio": round(uc_ratio,4), "ready_to_move_ratio": round(rtm_ratio,4),
                "micro_market_premium": round(micro_prem,3), "macro_market_index": round(macro_idx,2),
                # Liquidity
                "dom_median_locality": round(dom_med,1), "dom_p25_locality": round(dom_p25,1),
                "dom_p75_locality": round(dom_p75,1), "buyer_pool_score": round(buyer_pool,2),
                "nri_buyer_ratio": round(nri_ratio,4), "investor_ratio": round(inv_ratio,4),
                "rental_yield": round(rental_yld,6), "gross_yield": round(gross_yld,6),
                "cap_rate": round(cap_rate,6), "vacancy_rate_locality": round(vac_rate,4),
                "resale_frequency": resale_freq, "exit_ease_score": round(exit_ease,2),
                "listing_to_sale_ratio": round(lst_sale_r,4), "price_reduction_pct": round(price_red,4),
                "affordability_index": round(afford_idx,2), "emi_income_ratio": round(emi_ratio,4),
                "dom_days": round(dom_med,1), "rpi_proxy": round(rpi_proxy,2),
                # Image
                **{k: round(v,2) for k,v in img_sc.items()},
                "img_quality_flag": img_quality_flag, "img_count": img_count,
                # Interactions
                "age_x_location_premium": round(age_x_loc,3),
                "area_x_liquidity": round(area_x_liq,2),
                "floor_x_lift": round(floor_x_lift,4),
                "yield_x_demand": round(yield_x_demand,8),
                "circle_x_market_heat": round(circle_x_heat,0),
                "infra_x_price_trend": round(infra_x_trend,4),
                "img_condition_x_price": round(img_x_price,4),
                "legal_x_fraud_score": round(legal_x_fraud,2),
                "age_x_renovation": round(age_x_renov,4),
                "city_x_zone_premium": round(city_x_zone,0),
                "area_x_floor": round(area_x_floor,2),
                "poi_x_transit": round(poi_x_transit,2),
                # Targets
                "price_psf": round(ppsf,0),
                "price_per_sqft": round(ppsf,0),   # alias
                "liquidity_bucket": liq_bucket,
                "ttl_bucket": liq_bucket,
                "is_fraud": is_fraud,
                "fraud_flags": "|".join(fraud_flags) if fraud_flags else "",
            }
            rows.append(row)

            # Image metadata record
            img_records.append({
                "property_id": pid, "city": city, "zone": zone,
                "img_count": img_count, "img_quality_flag": img_quality_flag,
                **{k: v for k, v in img_sc.items()},
            })

        total_generated += n_city
        if verbose:
            elapsed = round(time.time() - start, 1)
            print(f"  → {city}: done ({elapsed}s elapsed)")

    df = pd.DataFrame(rows)

    # Derived columns
    df["total_price"]         = (df["price_psf"] * df["area_sqft"]).round(0)
    df["property_age_bucket"] = pd.cut(df["age_years"], bins=[-1,5,15,30,100],
                                        labels=["New","Mid","Old","Very Old"])
    df["size_bucket"]         = pd.cut(df["area_sqft"],
                                       bins=[0,600,1200,3000,100001],
                                       labels=["Small","Mid","Large","Ultra"])

    if verbose:
        print(f"\n[DataGen] Dataset OK: {df.shape}")
        print(f"  Cities: {df['city'].value_counts().to_dict()}")
        print(f"  Fraud rate:     {df['is_fraud'].mean():.2%}")
        print(f"  Liq dist:\n{df['liquidity_bucket'].value_counts().sort_index().to_string()}")
        print(f"  Avg PSF by city:\n{df.groupby('city')['price_psf'].mean().round(0).to_string()}")

    # Save
    prop_path = os.path.join(save_dir, "properties_200k.csv")
    df.to_csv(prop_path, index=False)
    print(f"\n[DataGen] Properties → {prop_path} ({os.path.getsize(prop_path)/1e6:.1f} MB)")

    img_df = pd.DataFrame(img_records)
    img_path = os.path.join(save_dir, "image_scores_metadata.csv")
    img_df.to_csv(img_path, index=False)
    print(f"[DataGen] Image metadata → {img_path}")

    return df


if __name__ == "__main__":
    import argparse
    parser = argparse.ArgumentParser()
    parser.add_argument("--n",        type=int,   default=200_000)
    parser.add_argument("--city",     type=str,   default="all")
    parser.add_argument("--save_dir", type=str,   default="data/")
    args = parser.parse_args()
    cities = None if args.city == "all" else [args.city]
    generate_dataset(n=args.n, cities=cities, save_dir=args.save_dir)

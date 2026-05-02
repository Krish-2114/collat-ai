"""
config.py — Collat.AI v3
Extended to 8 Indian cities (not just Mumbai), 200K dataset,
image pipeline config, scraper config, and full 900-feature registry.
"""

from dataclasses import dataclass, field
from typing import List, Dict, Tuple
import os

# Repository root (parent of `src/`) — paths must not depend on shell cwd.
_SRC_DIR = os.path.dirname(os.path.abspath(__file__))
_REPO_ROOT = os.path.normpath(os.path.join(_SRC_DIR, ".."))


def _default_model_dir() -> str:
    """Artefacts directory. Override with env COLLAT_AI_MODEL_DIR (absolute or relative to cwd)."""
    raw = (os.environ.get("COLLAT_AI_MODEL_DIR") or "").strip()
    if raw:
        return os.path.normpath(os.path.expanduser(raw))
    return os.path.join(_REPO_ROOT, "models")


# ──────────────────────────────────────────────────────────────
# CITY CONFIGURATIONS  (8 cities, realistic market data)
# ──────────────────────────────────────────────────────────────

CITIES = {
    "Mumbai": {
        "base_psf": 18500, "tier": 1, "population_m": 20.7,
        "zones": {
            "South Mumbai":    {"premium": 2.4, "bbox": (18.89, 19.02, 72.80, 72.88)},
            "Western Suburbs": {"premium": 1.6, "bbox": (19.02, 19.27, 72.80, 72.98)},
            "Eastern Suburbs": {"premium": 0.85,"bbox": (19.02, 19.20, 72.88, 73.02)},
            "Central Mumbai":  {"premium": 1.2, "bbox": (19.00, 19.10, 72.83, 72.92)},
            "Thane":           {"premium": 0.80,"bbox": (19.18, 19.30, 72.96, 73.10)},
            "Navi Mumbai":     {"premium": 0.75,"bbox": (18.98, 19.18, 73.00, 73.18)},
            "Mira Bhayandar":  {"premium": 0.65,"bbox": (19.27, 19.38, 72.84, 72.95)},
        },
        "circle_rates": {
            "South Mumbai": 22000, "Western Suburbs": 14000,
            "Central Mumbai": 16000, "Eastern Suburbs": 9000,
            "Thane": 8000, "Navi Mumbai": 9500, "Mira Bhayandar": 6000,
        },
        "localities": {
            "South Mumbai":    ["Colaba","Nariman Point","Fort","Churchgate","Malabar Hill",
                                "Breach Candy","Cuffe Parade","Worli","Lower Parel","Prabhadevi",
                                "Dadar","Mahim","Parel","Walkeshwar","Marine Lines"],
            "Western Suburbs": ["Bandra","Khar","Santacruz","Vile Parle","Andheri",
                                "Jogeshwari","Goregaon","Malad","Kandivali","Borivali",
                                "Dahisar","Juhu","Versova","Powai","Lokhandwala"],
            "Eastern Suburbs": ["Kurla","Govandi","Mankhurd","Chembur","Ghatkopar",
                                "Vikhroli","Bhandup","Mulund","Kanjurmarg","Nahur"],
            "Central Mumbai":  ["Grant Road","Mumbai Central","Byculla","Matunga",
                                "Curry Road","Elphinstone Road","Mazgaon"],
            "Thane":           ["Thane West","Thane East","Ghodbunder Road","Hiranandani Estate",
                                "Majiwada","Pokhran","Wagle Estate","Kapurbawdi"],
            "Navi Mumbai":     ["Vashi","Kopar Khairane","Nerul","Belapur","Kharghar",
                                "Panvel","Ulwe","Airoli","Seawoods","Sanpada"],
            "Mira Bhayandar":  ["Mira Road","Bhayandar East","Bhayandar West","Kashimira"],
        },
        "locality_premiums": {
            "Nariman Point":2.9,"Malabar Hill":2.8,"Cuffe Parade":2.7,"Colaba":2.5,
            "Breach Candy":2.6,"Walkeshwar":2.7,"Churchgate":2.4,"Fort":2.2,
            "Marine Lines":2.1,"Worli":2.2,"Lower Parel":1.9,"Prabhadevi":2.0,
            "Dadar":1.7,"Mahim":1.6,"Parel":1.8,"Bandra":2.0,"Juhu":1.9,
            "Khar":1.8,"Santacruz":1.5,"Vile Parle":1.4,"Andheri":1.3,
            "Goregaon":1.1,"Malad":1.0,"Kandivali":0.95,"Borivali":0.9,
            "Powai":1.4,"Lokhandwala":1.5,"Versova":1.6,"Chembur":1.0,
            "Ghatkopar":1.05,"Vikhroli":0.9,"Kurla":0.85,"Govandi":0.65,
            "Thane West":0.85,"Hiranandani Estate":1.1,"Ghodbunder Road":0.78,
            "Vashi":0.88,"Nerul":0.82,"Kharghar":0.75,"Belapur":0.80,
            "Panvel":0.65,"Ulwe":0.60,"Mira Road":0.68,
        },
    },
    "Delhi": {
        "base_psf": 9500, "tier": 1, "population_m": 32.9,
        "zones": {
            "Central Delhi":  {"premium": 2.0, "bbox": (28.60, 28.68, 77.18, 77.28)},
            "South Delhi":    {"premium": 1.8, "bbox": (28.48, 28.60, 77.15, 77.30)},
            "West Delhi":     {"premium": 1.0, "bbox": (28.60, 28.75, 77.00, 77.18)},
            "North Delhi":    {"premium": 0.9, "bbox": (28.68, 28.88, 77.15, 77.28)},
            "East Delhi":     {"premium": 0.85,"bbox": (28.60, 28.72, 77.28, 77.40)},
            "NCR Gurgaon":    {"premium": 1.5, "bbox": (28.40, 28.58, 76.95, 77.15)},
            "NCR Noida":      {"premium": 1.2, "bbox": (28.50, 28.65, 77.30, 77.50)},
        },
        "circle_rates": {
            "Central Delhi": 5000,"South Delhi": 4500,"West Delhi": 3000,
            "North Delhi": 2800,"East Delhi": 2600,"NCR Gurgaon": 4000,"NCR Noida": 3200,
        },
        "localities": {
            "Central Delhi":  ["Connaught Place","Karol Bagh","Paharganj","Sadar Bazaar"],
            "South Delhi":    ["Saket","Vasant Kunj","Hauz Khas","Greater Kailash","Defence Colony","Lajpat Nagar","Green Park"],
            "West Delhi":     ["Dwarka","Janakpuri","Uttam Nagar","Punjabi Bagh","Rajouri Garden"],
            "North Delhi":    ["Rohini","Pitampura","Model Town","Ashok Vihar","Shalimar Bagh"],
            "East Delhi":     ["Preet Vihar","Mayur Vihar","IP Extension","Laxmi Nagar","Shahdara"],
            "NCR Gurgaon":    ["DLF City","Golf Course Road","Sohna Road","MG Road","Cyber City","Sector 57"],
            "NCR Noida":      ["Sector 18","Sector 62","Expressway","Greater Noida","Noida Ext"],
        },
        "locality_premiums": {
            "Connaught Place":2.5,"Hauz Khas":2.0,"Defence Colony":2.0,"Vasant Kunj":1.7,
            "Saket":1.6,"Greater Kailash":1.8,"Lajpat Nagar":1.4,"DLF City":1.8,
            "Golf Course Road":1.9,"Cyber City":1.6,"Sector 62":1.3,"Dwarka":1.0,
            "Rohini":0.9,"Mayur Vihar":1.0,"Sector 18":1.2,
        },
    },
    "Bangalore": {
        "base_psf": 7500, "tier": 1, "population_m": 13.2,
        "zones": {
            "North Bangalore":  {"premium": 1.3, "bbox": (13.05, 13.14, 77.55, 77.68)},
            "South Bangalore":  {"premium": 1.1, "bbox": (12.83, 12.97, 77.55, 77.70)},
            "East Bangalore":   {"premium": 1.5, "bbox": (12.95, 13.05, 77.65, 77.78)},
            "West Bangalore":   {"premium": 0.85,"bbox": (12.95, 13.05, 77.46, 77.58)},
            "Central Bangalore":{"premium": 1.8, "bbox": (12.97, 13.03, 77.58, 77.68)},
            "Whitefield":       {"premium": 1.4, "bbox": (12.96, 13.02, 77.73, 77.79)},
            "Electronic City":  {"premium": 1.0, "bbox": (12.83, 12.89, 77.65, 77.73)},
        },
        "circle_rates": {
            "North Bangalore":3500,"South Bangalore":3000,"East Bangalore":4500,
            "West Bangalore":2500,"Central Bangalore":5000,"Whitefield":4000,"Electronic City":2800,
        },
        "localities": {
            "North Bangalore":  ["Hebbal","Yelahanka","Devanahalli","Thanisandra"],
            "South Bangalore":  ["JP Nagar","Jayanagar","Banashankari","BTM Layout","Electronic City"],
            "East Bangalore":   ["Indiranagar","Koramangala","HSR Layout","Sarjapur"],
            "West Bangalore":   ["Rajajinagar","Vijayanagar","Basaveshwara Nagar"],
            "Central Bangalore":["MG Road","Brigade Road","Richmond Town","Lavelle Road"],
            "Whitefield":       ["Whitefield","ITPL","Kadugodi","Hoodi"],
            "Electronic City":  ["Electronic City","Hosa Road","Singasandra"],
        },
        "locality_premiums": {
            "MG Road":2.2,"Lavelle Road":2.1,"Koramangala":1.8,"Indiranagar":1.8,
            "HSR Layout":1.6,"Whitefield":1.5,"ITPL":1.4,"Hebbal":1.3,
            "JP Nagar":1.2,"Sarjapur":1.3,"Electronic City":1.0,"BTM Layout":1.2,
        },
    },
    "Hyderabad": {
        "base_psf": 6200, "tier": 2, "population_m": 10.5,
        "zones": {
            "Hitech City":  {"premium": 1.8, "bbox": (17.43, 17.50, 78.36, 78.43)},
            "Jubilee Hills": {"premium": 1.7,"bbox": (17.40, 17.46, 78.38, 78.44)},
            "Gachibowli":   {"premium": 1.5, "bbox": (17.42, 17.47, 78.33, 78.39)},
            "Secunderabad": {"premium": 1.2, "bbox": (17.44, 17.50, 78.49, 78.56)},
            "Old City":     {"premium": 0.7, "bbox": (17.34, 17.42, 78.46, 78.54)},
            "Kukatpally":   {"premium": 1.1, "bbox": (17.48, 17.55, 78.38, 78.44)},
            "LB Nagar":     {"premium": 0.85,"bbox": (17.34, 17.42, 78.54, 78.62)},
        },
        "circle_rates": {
            "Hitech City":5000,"Jubilee Hills":5500,"Gachibowli":4500,
            "Secunderabad":3500,"Old City":2000,"Kukatpally":3000,"LB Nagar":2500,
        },
        "localities": {
            "Hitech City":  ["Hitech City","Madhapur","Kondapur","Raidurgam"],
            "Jubilee Hills": ["Jubilee Hills","Banjara Hills","Film Nagar"],
            "Gachibowli":   ["Gachibowli","Nanakramguda","Serilingampally","Tellapur"],
            "Secunderabad": ["Secunderabad","Trimulgherry","Bowenpally","Marredpally"],
            "Old City":     ["Charminar","Tolichowki","Attapur","Mehdipatnam"],
            "Kukatpally":   ["Kukatpally","KPHB","Miyapur","Bachupally"],
            "LB Nagar":     ["LB Nagar","Vanasthalipuram","Dilsukhnagar","Nacharam"],
        },
        "locality_premiums": {
            "Jubilee Hills":1.9,"Banjara Hills":1.8,"Madhapur":1.6,"Kondapur":1.5,
            "Gachibowli":1.5,"Hitech City":1.7,"KPHB":1.1,"Kukatpally":1.1,
            "Secunderabad":1.2,"LB Nagar":0.85,"Old City":0.7,
        },
    },
    "Pune": {
        "base_psf": 6800, "tier": 2, "population_m": 7.4,
        "zones": {
            "Kothrud":    {"premium": 1.4, "bbox": (18.49, 18.55, 73.80, 73.87)},
            "Hinjewadi":  {"premium": 1.3, "bbox": (18.56, 18.64, 73.70, 73.79)},
            "Baner":      {"premium": 1.5, "bbox": (18.55, 18.61, 73.77, 73.84)},
            "Kharadi":    {"premium": 1.4, "bbox": (18.54, 18.60, 73.93, 74.00)},
            "Hadapsar":   {"premium": 1.1, "bbox": (18.49, 18.54, 73.92, 73.99)},
            "Wakad":      {"premium": 1.2, "bbox": (18.59, 18.65, 73.74, 73.82)},
            "Pimpri":     {"premium": 0.9, "bbox": (18.61, 18.66, 73.80, 73.89)},
        },
        "circle_rates": {
            "Kothrud":3500,"Hinjewadi":2800,"Baner":3800,"Kharadi":3500,
            "Hadapsar":2500,"Wakad":3000,"Pimpri":2200,
        },
        "localities": {
            "Kothrud":  ["Kothrud","Karve Nagar","Warje","Bavdhan"],
            "Hinjewadi":["Hinjewadi","Wakad","Pimple Saudagar","Pimple Nilakh"],
            "Baner":    ["Baner","Balewadi","Aundh","Pashan"],
            "Kharadi":  ["Kharadi","Viman Nagar","Magarpatta","Hadapsar"],
            "Hadapsar": ["Hadapsar","NIBM","Kondhwa","Undri"],
            "Wakad":    ["Wakad","Chinchwad","Pimpri"],
            "Pimpri":   ["Pimpri","Bhosari","Moshi","Chakan"],
        },
        "locality_premiums": {
            "Baner":1.6,"Aundh":1.5,"Kothrud":1.5,"Viman Nagar":1.5,"Kharadi":1.4,
            "Hinjewadi":1.3,"Magarpatta":1.4,"Wakad":1.2,"Hadapsar":1.1,"Pimpri":0.9,
        },
    },
    "Chennai": {
        "base_psf": 5800, "tier": 2, "population_m": 10.9,
        "zones": {
            "Anna Nagar":  {"premium": 1.6, "bbox": (13.08, 13.13, 80.20, 80.25)},
            "Adyar":       {"premium": 1.7, "bbox": (13.00, 13.04, 80.25, 80.27)},
            "OMR":         {"premium": 1.3, "bbox": (12.85, 13.02, 80.22, 80.28)},
            "Anna Salai":  {"premium": 1.4, "bbox": (13.04, 13.08, 80.25, 80.28)},
            "Tambaram":    {"premium": 0.85,"bbox": (12.90, 12.97, 80.10, 80.15)},
            "Porur":       {"premium": 1.1, "bbox": (13.02, 13.07, 80.15, 80.20)},
            "Avadi":       {"premium": 0.75,"bbox": (13.10, 13.18, 80.08, 80.15)},
        },
        "circle_rates": {
            "Anna Nagar":4500,"Adyar":5000,"OMR":3500,"Anna Salai":4000,
            "Tambaram":2200,"Porur":3000,"Avadi":2000,
        },
        "localities": {
            "Anna Nagar":  ["Anna Nagar","Kilpauk","Chetpet","Aminjikarai"],
            "Adyar":       ["Adyar","Besant Nagar","Thiruvanmiyur","Velachery"],
            "OMR":         ["OMR","Perungudi","Sholinganallur","Siruseri","Padur"],
            "Anna Salai":  ["T Nagar","Nungambakkam","Mylapore","Alwarpet"],
            "Tambaram":    ["Tambaram","Pallavaram","Chromepet","Guduvanchery"],
            "Porur":       ["Porur","Valasaravakkam","Ramapuram","Maduravoyal"],
            "Avadi":       ["Avadi","Ambattur","Thiruvallur","Redhills"],
        },
        "locality_premiums": {
            "Adyar":1.8,"Besant Nagar":1.7,"Nungambakkam":1.6,"T Nagar":1.5,
            "Anna Nagar":1.6,"Velachery":1.4,"OMR":1.3,"Sholinganallur":1.2,
            "Tambaram":0.85,"Porur":1.1,"Avadi":0.75,
        },
    },
    "Kolkata": {
        "base_psf": 4200, "tier": 2, "population_m": 14.9,
        "zones": {
            "Salt Lake":    {"premium": 1.5, "bbox": (22.57, 22.62, 88.39, 88.44)},
            "New Town":     {"premium": 1.4, "bbox": (22.59, 22.66, 88.44, 88.52)},
            "South Kolkata":{"premium": 1.3, "bbox": (22.49, 22.56, 88.34, 88.40)},
            "Central":      {"premium": 1.1, "bbox": (22.56, 22.60, 88.34, 88.39)},
            "North Kolkata":{"premium": 0.8, "bbox": (22.60, 22.65, 88.34, 88.41)},
            "Howrah":       {"premium": 0.75,"bbox": (22.58, 22.62, 88.26, 88.33)},
            "Rajarhat":     {"premium": 1.2, "bbox": (22.61, 22.66, 88.44, 88.50)},
        },
        "circle_rates": {
            "Salt Lake":3200,"New Town":2800,"South Kolkata":3000,"Central":2500,
            "North Kolkata":1800,"Howrah":1600,"Rajarhat":2200,
        },
        "localities": {
            "Salt Lake":    ["Salt Lake Sector I","Sector II","Sector III","Sector V"],
            "New Town":     ["New Town Action Area I","Action Area II","Action Area III"],
            "South Kolkata":["Ballygunge","Park Street","Alipore","Bhowanipore","Kalighat"],
            "Central":      ["Shyambazar","Girish Park","Maniktala","Ultadanga"],
            "North Kolkata":["Dum Dum","Belgharia","Baranagar","Khardah"],
            "Howrah":       ["Howrah","Shibpur","Liluah","Bally"],
            "Rajarhat":     ["Rajarhat","Eco Park","Newtown"],
        },
        "locality_premiums": {
            "Ballygunge":1.6,"Park Street":1.5,"Alipore":1.8,"Salt Lake Sector V":1.5,
            "New Town Action Area I":1.4,"Rajarhat":1.2,"Dum Dum":0.9,
            "Howrah":0.75,"North Kolkata":0.8,
        },
    },
    "Ahmedabad": {
        "base_psf": 4800, "tier": 2, "population_m": 8.4,
        "zones": {
            "SG Road":     {"premium": 1.6, "bbox": (23.02, 23.08, 72.50, 72.58)},
            "Satellite":   {"premium": 1.5, "bbox": (23.01, 23.06, 72.52, 72.57)},
            "Bopal":       {"premium": 1.3, "bbox": (22.98, 23.04, 72.44, 72.51)},
            "Naranpura":   {"premium": 1.2, "bbox": (23.06, 23.11, 72.55, 72.60)},
            "Navrangpura": {"premium": 1.4, "bbox": (23.03, 23.07, 72.55, 72.59)},
            "Chandkheda":  {"premium": 1.0, "bbox": (23.09, 23.14, 72.57, 72.63)},
            "Nikol":       {"premium": 0.85,"bbox": (23.03, 23.08, 72.65, 72.70)},
        },
        "circle_rates": {
            "SG Road":3800,"Satellite":3500,"Bopal":2800,"Naranpura":3000,
            "Navrangpura":3500,"Chandkheda":2500,"Nikol":2000,
        },
        "localities": {
            "SG Road":    ["SG Road","Bodakdev","Thaltej","Sola"],
            "Satellite":  ["Satellite","Prahlad Nagar","Vastrapur","Jodhpur"],
            "Bopal":      ["Bopal","South Bopal","Ghuma","Ambli"],
            "Naranpura":  ["Naranpura","Sabarmati","Memnagar"],
            "Navrangpura":["Navrangpura","Ellisbridge","Paldi","Maninagar"],
            "Chandkheda": ["Chandkheda","Motera","Gota","Ranip"],
            "Nikol":      ["Nikol","Vastral","Hathijan","Odhav"],
        },
        "locality_premiums": {
            "Bodakdev":1.7,"Prahlad Nagar":1.6,"Satellite":1.5,"Vastrapur":1.4,
            "SG Road":1.6,"Bopal":1.3,"Naranpura":1.2,"Navrangpura":1.4,"Nikol":0.85,
        },
    },
}

# ──────────────────────────────────────────────────────────────
# PROPERTY TYPES + SUBTYPES
# ──────────────────────────────────────────────────────────────

PROPERTY_TYPES   = ["Apartment","Villa","Commercial","Industrial","Plot"]
TYPE_PROBS       = [0.60, 0.12, 0.15, 0.07, 0.06]

SUBTYPES = {
    "Apartment":  ["Studio","1BHK","2BHK","3BHK","4BHK+","Penthouse"],
    "Villa":      ["Row House","Bungalow","Twin Bungalow","Penthouse"],
    "Commercial": ["Shop","Office","Showroom","Co-working Space","Restaurant"],
    "Industrial": ["Warehouse","Factory","Godown","MIDC Unit","Cold Storage"],
    "Plot":       ["Residential Plot","Commercial Plot","Industrial Plot","Agricultural"],
}
SUBTYPE_PROBS = {
    "Apartment":  [0.05, 0.14, 0.36, 0.28, 0.13, 0.04],
    "Villa":      [0.28, 0.38, 0.22, 0.12],
    "Commercial": [0.28, 0.38, 0.18, 0.10, 0.06],
    "Industrial": [0.32, 0.22, 0.26, 0.14, 0.06],
    "Plot":       [0.48, 0.32, 0.12, 0.08],
}

# ──────────────────────────────────────────────────────────────
# MODEL HYPERPARAMETERS (tuned for 200K dataset)
# ──────────────────────────────────────────────────────────────

XGBOOST_PARAMS = {
    "n_estimators": 1500,
    "max_depth": 8,
    "learning_rate": 0.03,
    "subsample": 0.8,
    "colsample_bytree": 0.75,
    "min_child_weight": 5,
    "reg_alpha": 0.1,
    "reg_lambda": 1.5,
    "random_state": 42,
    "n_jobs": -1,
    "tree_method": "hist",
    "early_stopping_rounds": 60,
}

LIGHTGBM_PARAMS = {
    "n_estimators": 1200,
    "max_depth": 8,
    "learning_rate": 0.03,
    "num_leaves": 63,
    "subsample": 0.8,
    "colsample_bytree": 0.75,
    "min_child_samples": 20,
    "reg_alpha": 0.05,
    "reg_lambda": 1.0,
    "random_state": 42,
    "n_jobs": -1,
    "verbose": -1,
}

CONFORMAL_ALPHA = 0.20   # 80% statistical coverage guarantee
RANDOM_SEED     = 42

# ──────────────────────────────────────────────────────────────
# IMAGE PIPELINE CONFIG
# ──────────────────────────────────────────────────────────────

IMAGE_CONFIG = {
    "backbone":         "efficientnet_b0",   # timm model name
    "img_size":         224,
    "batch_size":       32,
    "embedding_dim":    1280,                # EfficientNet-B0 output
    "n_features":       8,                   # reduced image feature set
    "cache_dir":        "data/image_cache/",
    "max_images_per_property": 5,
    "quality_threshold": 20.0,              # BRISQUE-like score
}

# ──────────────────────────────────────────────────────────────
# WEB SCRAPER CONFIG
# ──────────────────────────────────────────────────────────────

SCRAPER_CONFIG = {
    "sources": ["magicbricks", "housing", "99acres", "nobroker"],
    "delay_range_s": (2, 5),
    "max_retries": 3,
    "timeout_s": 15,
    "cache_dir": "data/scraper_cache/",
    "headers": {
        "Accept-Language": "en-IN,en;q=0.9",
        "Accept-Encoding": "gzip, deflate, br",
        "Connection": "keep-alive",
    },
    "max_listings_per_city": 5000,
    "use_proxy": False,
}

# ──────────────────────────────────────────────────────────────
# DISTRESS + LTV TABLES
# ──────────────────────────────────────────────────────────────

DISTRESS_DISCOUNT = {
    "Apartment":  (0.05, 0.24),
    "Villa":      (0.08, 0.28),
    "Commercial": (0.13, 0.40),
    "Industrial": (0.20, 0.53),
    "Plot":       (0.10, 0.35),
}

LTV_MATRIX = {
    "Residential_Freehold":  [0.725, 0.650, 0.580, 0.540],
    "Residential_Leasehold": [0.650, 0.580, 0.500, 0.450],
    "Commercial_Freehold":   [0.600, 0.540, 0.480, 0.420],
    "Industrial":            [0.525, 0.470, 0.420, 0.350],
}

# ──────────────────────────────────────────────────────────────
# FEATURE GROUPS
# ──────────────────────────────────────────────────────────────

LOCATION_FEATURES = [
    "lat","lon","zone_premium","locality_premium","city_tier",
    "city_base_psf","city_population_m",
    *[f"poi_{pt}_{r}m" for pt in
      ["transit","school","hospital","mall","restaurant","bank","park","office","worship","gym"]
      for r in [500,1000,3000]],
    "metro_distance_km","railway_distance_km","airport_distance_km",
    "highway_distance_km","sea_distance_km","cbd_distance_km",
    "infra_index","nightlight_proxy",
    "flood_zone_flag","crz_flag","heritage_zone_flag",
    "slum_proximity_flag","planned_zone_flag","it_park_proximity",
    "nri_demand_score","walk_score","transit_score",
    "h3_res7_price_median","h3_res7_transaction_count",
    "school_count_1km","hospital_count_2km","mall_count_3km",
    "transit_count_500m","green_cover_score",
    "crime_index_proxy","pollution_aqi_proxy",
    "zone_encoded","locality_encoded","city_encoded",
]

PROPERTY_FEATURES = [
    "area_sqft","age_years","floor_number","total_floors","floor_ratio",
    "bedrooms","bathrooms","parking_slots",
    "lift_available","security_24x7","gym_available","swimming_pool",
    "clubhouse","power_backup","intercom","cctv",
    "rera_registered","oc_received","cc_received","bmc_approved",
    "legal_clear","ownership_type","encumbrance_flag","litigation_flag",
    "monthly_rent","furnishing","occupancy",
    "property_type_encoded","sub_type_encoded",
    "property_age_bucket_encoded","size_bucket_encoded",
    "vastu_compliant","corner_unit","east_facing",
    "balcony_count","servant_room","modular_kitchen",
    "smart_home","top_floor_flag","ground_floor_flag",
    "super_luxury_flag","affordable_flag","floor_premium_factor",
]

MARKET_FEATURES = [
    "circle_rate_sqft","listing_price_sqft","circle_rate_premium",
    "market_heat_index","supply_demand_ratio",
    "price_trend_1m","price_trend_3m","price_trend_6m","price_trend_12m","price_trend_24m",
    "inventory_months","transaction_volume_qtr","new_supply_units_6m",
    "absorption_rate_6m","price_momentum_score",
    "under_construction_ratio","ready_to_move_ratio",
    "micro_market_premium","macro_market_index",
]

LIQUIDITY_FEATURES = [
    "dom_median_locality","dom_p25_locality","dom_p75_locality",
    "buyer_pool_score","nri_buyer_ratio","investor_ratio",
    "rental_yield","gross_yield","cap_rate",
    "vacancy_rate_locality","resale_frequency",
    "exit_ease_score","listing_to_sale_ratio",
    "price_reduction_pct","affordability_index","emi_income_ratio",
]

LEGAL_FEATURES = [
    "legal_clear","ownership_type","encumbrance_flag","litigation_flag",
    "title_age_years","registered_sale_deed",
    "loan_on_property","disputed_boundary_flag","mutation_done",
]

IMAGE_FEATURES = [
    "img_condition_score","img_natural_light_score","img_renovation_score",
    "img_view_score","img_facade_score","img_cleanliness_score",
    "img_space_feel_score","img_amenity_score",
    "img_quality_flag",   # 1 = high-quality listing photos present
    "img_count",          # number of listing images
]

INTERACTION_FEATURES = [
    "age_x_location_premium","area_x_liquidity","floor_x_lift",
    "yield_x_demand","circle_x_market_heat","infra_x_price_trend",
    "img_condition_x_price","legal_x_fraud_score","age_x_renovation",
    "city_x_zone_premium","area_x_floor","poi_x_transit",
]

VALUE_ENGINE_FEATURES    = LOCATION_FEATURES + PROPERTY_FEATURES + MARKET_FEATURES + INTERACTION_FEATURES + IMAGE_FEATURES
LIQUIDITY_ENGINE_FEATURES = LOCATION_FEATURES + LIQUIDITY_FEATURES + MARKET_FEATURES + INTERACTION_FEATURES
FRAUD_ENGINE_FEATURES    = PROPERTY_FEATURES + MARKET_FEATURES + LEGAL_FEATURES + IMAGE_FEATURES

# ──────────────────────────────────────────────────────────────
# APP CONFIG
# ──────────────────────────────────────────────────────────────

@dataclass
class AppConfig:
    model_dir:   str = field(default_factory=_default_model_dir)
    data_dir:    str = field(
        default_factory=lambda: os.path.join(_REPO_ROOT, "data"),
    )
    image_dir:   str = field(
        default_factory=lambda: os.path.join(_REPO_ROOT, "data", "images"),
    )
    cache_dir:   str = field(
        default_factory=lambda: os.path.join(_REPO_ROOT, "data", "scraper_cache"),
    )
    log_dir:     str = field(
        default_factory=lambda: os.path.join(_REPO_ROOT, "logs"),
    )
    log_level:   str = "INFO"
    api_host:    str = "0.0.0.0"
    api_port:    int = 8000
    version:     str = "3.0.0"
    title:       str = "Collat.AI v3 — Multi-City Real Estate Intelligence Platform"

@dataclass
class DataConfig:
    n_samples:               int   = 200_000
    n_images_per_property:   int   = 3
    test_size:               float = 0.15
    val_size:                float = 0.10
    random_state:            int   = 42
    city_sample_weights: Dict = field(default_factory=lambda: {
        "Mumbai":    0.22,
        "Delhi":     0.18,
        "Bangalore": 0.15,
        "Hyderabad": 0.12,
        "Pune":      0.12,
        "Chennai":   0.10,
        "Kolkata":   0.06,
        "Ahmedabad": 0.05,
    })

APP_CONFIG  = AppConfig()
DATA_CONFIG = DataConfig()

for d in [APP_CONFIG.model_dir, APP_CONFIG.data_dir,
          APP_CONFIG.image_dir, APP_CONFIG.cache_dir, APP_CONFIG.log_dir]:
    os.makedirs(d, exist_ok=True)

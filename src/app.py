"""
app.py — Collat.AI v3 Streamlit Dashboard
Multi-city Indian Real Estate Collateral Intelligence Platform
"""

import streamlit as st
import requests
import json
import pandas as pd
import numpy as np
import os, sys

sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))

st.set_page_config(
    page_title="Collat.AI v3 — Multi-City Property Intelligence",
    page_icon="🏙️",
    layout="wide",
    initial_sidebar_state="expanded",
)

API_URL = os.getenv("API_URL", "http://localhost:8000")

CITIES_DATA = {
    "Mumbai": {
        "zones": ["South Mumbai","Western Suburbs","Central Mumbai",
                  "Eastern Suburbs","Thane","Navi Mumbai","Mira Bhayandar"],
        "localities": {
            "South Mumbai":    ["Colaba","Nariman Point","Malabar Hill","Worli","Lower Parel","Dadar"],
            "Western Suburbs": ["Bandra","Khar","Juhu","Andheri","Powai","Versova","Goregaon","Borivali"],
            "Central Mumbai":  ["Grant Road","Byculla","Matunga","Parel"],
            "Eastern Suburbs": ["Chembur","Ghatkopar","Kurla","Vikhroli","Mulund"],
            "Thane":           ["Thane West","Ghodbunder Road","Hiranandani Estate"],
            "Navi Mumbai":     ["Vashi","Nerul","Kharghar","Belapur","Panvel","Seawoods"],
            "Mira Bhayandar":  ["Mira Road","Bhayandar East","Bhayandar West"],
        }
    },
    "Delhi": {
        "zones": ["Central Delhi","South Delhi","West Delhi","North Delhi","East Delhi","NCR Gurgaon","NCR Noida"],
        "localities": {
            "Central Delhi":  ["Connaught Place","Karol Bagh","Paharganj"],
            "South Delhi":    ["Saket","Vasant Kunj","Hauz Khas","Greater Kailash","Defence Colony"],
            "West Delhi":     ["Dwarka","Janakpuri","Punjabi Bagh","Rajouri Garden"],
            "North Delhi":    ["Rohini","Pitampura","Model Town","Shalimar Bagh"],
            "East Delhi":     ["Preet Vihar","Mayur Vihar","Laxmi Nagar"],
            "NCR Gurgaon":    ["DLF City","Golf Course Road","Sohna Road","Cyber City","MG Road"],
            "NCR Noida":      ["Sector 18","Sector 62","Expressway","Greater Noida"],
        }
    },
    "Bangalore": {
        "zones": ["North Bangalore","South Bangalore","East Bangalore","West Bangalore","Central Bangalore","Whitefield","Electronic City"],
        "localities": {
            "North Bangalore":  ["Hebbal","Yelahanka","Thanisandra","Devanahalli"],
            "South Bangalore":  ["JP Nagar","Jayanagar","Banashankari","BTM Layout"],
            "East Bangalore":   ["Indiranagar","Koramangala","HSR Layout","Sarjapur"],
            "West Bangalore":   ["Rajajinagar","Vijayanagar","Basaveshwara Nagar"],
            "Central Bangalore":["MG Road","Brigade Road","Richmond Town","Lavelle Road"],
            "Whitefield":       ["Whitefield","ITPL","Kadugodi","Hoodi"],
            "Electronic City":  ["Electronic City","Hosa Road","Singasandra"],
        }
    },
    "Hyderabad": {
        "zones": ["Hitech City","Jubilee Hills","Gachibowli","Secunderabad","Old City","Kukatpally","LB Nagar"],
        "localities": {
            "Hitech City":  ["Hitech City","Madhapur","Kondapur","Raidurgam"],
            "Jubilee Hills": ["Jubilee Hills","Banjara Hills","Film Nagar"],
            "Gachibowli":   ["Gachibowli","Nanakramguda","Serilingampally"],
            "Secunderabad": ["Secunderabad","Trimulgherry","Marredpally"],
            "Old City":     ["Charminar","Tolichowki","Mehdipatnam"],
            "Kukatpally":   ["Kukatpally","KPHB","Miyapur","Bachupally"],
            "LB Nagar":     ["LB Nagar","Dilsukhnagar","Vanasthalipuram"],
        }
    },
    "Pune": {
        "zones": ["Kothrud","Hinjewadi","Baner","Kharadi","Hadapsar","Wakad","Pimpri"],
        "localities": {
            "Kothrud":  ["Kothrud","Karve Nagar","Warje","Bavdhan"],
            "Hinjewadi":["Hinjewadi","Pimple Saudagar","Pimple Nilakh"],
            "Baner":    ["Baner","Balewadi","Aundh","Pashan"],
            "Kharadi":  ["Kharadi","Viman Nagar","Magarpatta"],
            "Hadapsar": ["Hadapsar","NIBM","Kondhwa","Undri"],
            "Wakad":    ["Wakad","Chinchwad","Pimpri"],
            "Pimpri":   ["Pimpri","Bhosari","Moshi"],
        }
    },
    "Chennai": {
        "zones": ["Anna Nagar","Adyar","OMR","Anna Salai","Tambaram","Porur","Avadi"],
        "localities": {
            "Anna Nagar":  ["Anna Nagar","Kilpauk","Chetpet"],
            "Adyar":       ["Adyar","Besant Nagar","Thiruvanmiyur","Velachery"],
            "OMR":         ["OMR","Perungudi","Sholinganallur","Siruseri"],
            "Anna Salai":  ["T Nagar","Nungambakkam","Mylapore","Alwarpet"],
            "Tambaram":    ["Tambaram","Pallavaram","Chromepet"],
            "Porur":       ["Porur","Valasaravakkam","Ramapuram"],
            "Avadi":       ["Avadi","Ambattur","Thiruvallur"],
        }
    },
    "Kolkata": {
        "zones": ["Salt Lake","New Town","South Kolkata","Central","North Kolkata","Howrah","Rajarhat"],
        "localities": {
            "Salt Lake":    ["Salt Lake Sector I","Sector II","Sector III","Sector V"],
            "New Town":     ["New Town Action Area I","Action Area II","Action Area III"],
            "South Kolkata":["Ballygunge","Park Street","Alipore","Bhowanipore"],
            "Central":      ["Shyambazar","Maniktala","Ultadanga"],
            "North Kolkata":["Dum Dum","Belgharia","Baranagar"],
            "Howrah":       ["Howrah","Shibpur","Liluah"],
            "Rajarhat":     ["Rajarhat","Eco Park","Newtown"],
        }
    },
    "Ahmedabad": {
        "zones": ["SG Road","Satellite","Bopal","Naranpura","Navrangpura","Chandkheda","Nikol"],
        "localities": {
            "SG Road":    ["SG Road","Bodakdev","Thaltej","Sola"],
            "Satellite":  ["Satellite","Prahlad Nagar","Vastrapur","Jodhpur"],
            "Bopal":      ["Bopal","South Bopal","Ghuma","Ambli"],
            "Naranpura":  ["Naranpura","Memnagar","Sabarmati"],
            "Navrangpura":["Navrangpura","Ellisbridge","Paldi"],
            "Chandkheda": ["Chandkheda","Motera","Gota"],
            "Nikol":      ["Nikol","Vastral","Odhav"],
        }
    },
}

# ── CSS ───────────────────────────────────────────────────────
st.markdown("""
<style>
    .main {background: #FAFAF8;}
    .stMetric {border-left: 4px solid #E05C1A; padding-left: 12px;}
    .metric-card {background: white; border-radius: 10px; padding: 16px;
                  box-shadow: 0 2px 8px rgba(0,0,0,0.08); margin: 4px;}
    .grade-A {color: #22863a; font-size: 2em; font-weight: bold;}
    .grade-B {color: #E05C1A; font-size: 2em; font-weight: bold;}
    .grade-C {color: #f6a623; font-size: 2em; font-weight: bold;}
    .grade-D {color: #cb2431; font-size: 2em; font-weight: bold;}
    .flag-box {background: #fff3cd; border: 1px solid #ffc107;
               border-radius: 6px; padding: 8px 12px; margin: 4px 0; font-size: 0.9em;}
    .header-bar {background: linear-gradient(135deg, #E05C1A, #c84a08);
                 color: white; padding: 20px 30px; border-radius: 12px; margin-bottom: 20px;}
    .city-badge {background: #1a73e8; color: white; border-radius: 20px;
                 padding: 2px 12px; font-size: 0.85em; font-weight: 600; margin-left: 8px;}
</style>
""", unsafe_allow_html=True)

# ── Header ────────────────────────────────────────────────────
st.markdown("""
<div class="header-bar">
  <h1 style='margin:0; font-size:2em;'>🏙️ Collat.AI v3</h1>
  <p style='margin:4px 0 0; opacity:0.9;'>
    Multi-City Indian Real Estate Collateral Intelligence — 8 Cities · 200K+ Records · CNN Image Pipeline
  </p>
</div>
""", unsafe_allow_html=True)

# ── Sidebar ───────────────────────────────────────────────────
with st.sidebar:
    st.image("https://img.shields.io/badge/Collat.AI-v3.0-E05C1A?style=for-the-badge", width=200)
    st.markdown("### 🏙️ City & Location")

    city = st.selectbox("City", list(CITIES_DATA.keys()), index=0)
    city_data = CITIES_DATA[city]
    zone = st.selectbox("Zone", city_data["zones"], index=1 if len(city_data["zones"]) > 1 else 0)
    loc_list = city_data["localities"].get(zone, ["N/A"])
    locality = st.selectbox("Locality", loc_list)

    st.markdown("---")
    st.markdown("### 🏠 Property")
    ptype = st.selectbox("Property Type", ["Apartment","Villa","Commercial","Industrial","Plot"])
    subtype_map = {
        "Apartment":  ["Studio","1BHK","2BHK","3BHK","4BHK+","Penthouse"],
        "Villa":      ["Row House","Bungalow","Twin Bungalow"],
        "Commercial": ["Shop","Office","Showroom","Co-working Space"],
        "Industrial": ["Warehouse","Factory","Godown","MIDC Unit"],
        "Plot":       ["Residential Plot","Commercial Plot","Industrial Plot"],
    }
    sub_type = st.selectbox("Sub-Type", subtype_map.get(ptype, ["N/A"]))

    st.markdown("---")
    st.markdown("### 📐 Size & Layout")
    area_sqft   = st.slider("Area (sqft)", 200, 10000, 1100, step=50)
    age_years   = st.slider("Building Age (years)", 0, 60, 5)
    col1, col2  = st.columns(2)
    floor_number= col1.number_input("Floor No.", 0, 200, 8)
    total_floors= col2.number_input("Total Floors", 1, 200, 20)

    if ptype == "Apartment":
        bedrooms  = st.select_slider("Bedrooms", [0,1,2,3,4,5], value=3)
        bathrooms = bedrooms
    else:
        bedrooms = bathrooms = 0

    parking = st.selectbox("Parking Slots", [0,1,2,3], index=1)

    st.markdown("---")
    st.markdown("### 🏗️ Amenities & Compliance")
    col3, col4 = st.columns(2)
    furnishing = col3.selectbox("Furnishing", ["Unfurnished","Semi","Fully"], index=1)
    furn_map   = {"Unfurnished": 0, "Semi": 1, "Fully": 2}
    occupancy  = col4.selectbox("Occupancy", ["Self","Rented","Vacant"])
    occ_map    = {"Self": 0, "Rented": 1, "Vacant": 2}

    lift     = st.checkbox("Lift", value=total_floors > 4)
    security = st.checkbox("24x7 Security", value=True)
    gym      = st.checkbox("Gym", value=False)
    pool     = st.checkbox("Swimming Pool", value=False)
    rera     = st.checkbox("RERA Registered", value=True)

    st.markdown("---")
    st.markdown("### ⚖️ Legal")
    legal = st.checkbox("Legal Title Clear", value=True)
    enc   = st.checkbox("Encumbrance Flag", value=False)
    lit   = st.checkbox("Litigation Flag", value=False)

    st.markdown("---")
    st.markdown("### 🚨 Risk Flags")
    flood   = st.checkbox("Flood Zone", value=False)
    crz     = st.checkbox("CRZ Zone", value=False)
    heritage= st.checkbox("Heritage Zone", value=False)

    monthly_rent = 0
    if occupancy == "Rented":
        monthly_rent = st.number_input("Monthly Rent (₹)", 0, 1000000, 35000, step=5000)

    analyze = st.button("🔍 Analyse Property", use_container_width=True, type="primary")

# ── Landing ───────────────────────────────────────────────────
if not analyze:
    c1, c2, c3, c4 = st.columns(4)
    c1.metric("Cities Covered", "8", "Pan-India")
    c2.metric("Training Records", "200K+", "↑ 2× vs v2")
    c3.metric("Feature Layers", "7", "Incl. CNN Images")
    c4.metric("Fraud Rules", "10", "↑ vs 8 in v2")

    st.info("👈 Select a city, fill in property details, and click **Analyse Property**")

    st.markdown("""
    ### 🆕 What's New in v3

    | Capability | v2 | v3 |
    |---|---|---|
    | Cities | Mumbai only | **8 cities** (Mumbai, Delhi, Bangalore, Hyderabad, Pune, Chennai, Kolkata, Ahmedabad) |
    | Dataset | 100K records | **200K+ records** |
    | Image Pipeline | Simulated scores | **EfficientNet-B0 CNN** feature extraction |
    | Web Scraping | None | **MagicBricks/99acres/Housing** scraper module |
    | Fraud Rules | 8 rules | **10 rules** + per-city medians |
    | Enrichment | Mumbai circle rates | **Per-city circle rates** + OSM POI |
    """)
    st.stop()

# ── API Call ──────────────────────────────────────────────────
payload = {
    "city": city, "zone": zone, "locality": locality,
    "property_type": ptype, "sub_type": sub_type,
    "area_sqft": area_sqft, "age_years": age_years,
    "floor_number": int(floor_number), "total_floors": int(total_floors),
    "bedrooms": int(bedrooms), "bathrooms": int(bathrooms),
    "parking_slots": int(parking),
    "furnishing": furn_map[furnishing],
    "occupancy": occ_map[occupancy],
    "monthly_rent": float(monthly_rent),
    "lift_available": bool(lift), "security_available": bool(security),
    "gym_available": bool(gym), "swimming_pool": bool(pool),
    "rera_registered": bool(rera), "legal_clear": bool(legal),
    "encumbrance_flag": bool(enc), "litigation_flag": bool(lit),
    "flood_zone_flag": bool(flood), "crz_flag": bool(crz),
    "heritage_zone_flag": bool(heritage),
}

with st.spinner(f"🔮 Running 4-model inference for {city} property..."):
    try:
        resp = requests.post(f"{API_URL}/valuate", json=payload, timeout=60)
        if resp.status_code == 200:
            r = resp.json()
        else:
            st.error(f"API Error {resp.status_code}: {resp.text}")
            st.stop()
    except requests.exceptions.ConnectionError:
        st.error("❌ Cannot connect to API. Is the FastAPI server running? (`python src/api.py`)")
        st.stop()

# ── Results ───────────────────────────────────────────────────
mv = r["market_value"]
dv = r["distress_value"]
lq = r["liquidity"]
fr = r["fraud_risk"]
cf = r["confidence"]
uw = r["underwriting"]

def fmt_crore(v):
    if v >= 1e7: return f"₹{v/1e7:.2f} Cr"
    return f"₹{v/1e5:.1f}L"

grade_color = {"A":"#22863a","B":"#E05C1A","C":"#f6a623","D":"#cb2431"}.get(cf["grade"],"#666")
st.markdown(f"""
<div style='background:white;border-radius:12px;padding:16px;
            box-shadow:0 2px 8px rgba(0,0,0,0.08);margin-bottom:16px;'>
  <h3 style='margin:0;color:#E05C1A;'>📋 Collateral Report</h3>
  <p style='margin:4px 0;color:#666;'>
    {city} <span class="city-badge">{city}</span> · {zone} · {locality} · {ptype} ({sub_type}) · {area_sqft:,} sqft
  </p>
  <span style='background:{grade_color};color:white;border-radius:20px;padding:4px 14px;font-weight:bold;'>
    Grade {cf["grade"]}
  </span>
  <span style='margin-left:10px;color:#666;'>Confidence: {cf["score"]*100:.0f}%</span>
</div>
""", unsafe_allow_html=True)

c1, c2, c3, c4, c5, c6 = st.columns(6)
c1.metric("Market Value (P50)", fmt_crore(mv["p50_total"]),
          f"Range: {fmt_crore(mv['p10_total'])}–{fmt_crore(mv['p90_total'])}")
c2.metric("Price/sqft", f"₹{mv['p50_sqft']:,.0f}",
          f"P10: ₹{mv['p10_sqft']:,.0f} | P90: ₹{mv['p90_sqft']:,.0f}")
c3.metric("Distress Value", fmt_crore(dv["low_total"]),
          f"Up to {fmt_crore(dv['high_total'])}")
c4.metric("Resale Potential", f"{lq['rpi_score']:.1f}/100", lq["rpi_label"])
c5.metric("Time to Liquidate", f"{lq['ttl_days_low']}–{lq['ttl_days_high']} days",
          lq["liquidity_band"])
c6.metric("Max Safe Loan", fmt_crore(uw["max_safe_loan_inr"]),
          f"LTV: {uw['eligible_ltv_pct']}%")

st.markdown("---")

tab1, tab2, tab3, tab4, tab5 = st.tabs([
    "📊 Value Analysis", "💧 Liquidity", "🚨 Fraud Risk", "🔑 Underwriting", "🧠 SHAP Drivers"
])

with tab1:
    col_l, col_r = st.columns([1.2, 1])
    with col_l:
        st.markdown("#### Market Value Range (P10–P90)")
        bar_data = pd.DataFrame({
            "Scenario": ["Bear (P10)", "Base (P50)", "Bull (P90)"],
            "₹ Crore":  [mv["p10_total"]/1e7, mv["p50_total"]/1e7, mv["p90_total"]/1e7]
        })
        st.bar_chart(bar_data.set_index("Scenario"), color="#E05C1A")
    with col_r:
        st.markdown("#### Price/sqft Breakdown")
        st.metric("P10 (Bearish)", f"₹{mv['p10_sqft']:,.0f}/sqft")
        st.metric("P50 (Base)",    f"₹{mv['p50_sqft']:,.0f}/sqft", delta="Median Estimate")
        st.metric("P90 (Bullish)", f"₹{mv['p90_sqft']:,.0f}/sqft")
        interval_w = (mv["p90_sqft"] - mv["p10_sqft"]) / mv["p50_sqft"] * 100
        st.caption(f"Interval width: {interval_w:.1f}% of P50")

with tab2:
    col_l, col_r = st.columns(2)
    rpi = lq["rpi_score"]
    color = "#22863a" if rpi >= 70 else ("#E05C1A" if rpi >= 45 else "#cb2431")
    with col_l:
        st.markdown("#### Resale Potential Index")
        st.markdown(f"""
        <div style='text-align:center;background:{color}15;border-radius:12px;padding:24px;'>
          <div style='font-size:4em;font-weight:bold;color:{color};'>{rpi:.1f}</div>
          <div style='font-size:1.2em;color:#666;'>/ 100</div>
          <div style='font-size:1em;margin-top:8px;color:{color};font-weight:600;'>{lq['rpi_label']}</div>
        </div>
        """, unsafe_allow_html=True)
    with col_r:
        st.markdown("#### Liquidity Signals")
        st.metric("Est. Days on Market", f"{lq['ttl_days_estimate']} days")
        st.metric("Exit Certainty (90d)", f"{lq.get('exit_certainty_90d', 0):.1f}%")
        st.metric("TTL Range", f"{lq['ttl_days_low']}–{lq['ttl_days_high']} days")
        st.metric("Liquidity Grade", lq["liquidity_grade"])

with tab3:
    col_l, col_r = st.columns(2)
    prob = fr["fraud_probability"]
    sev  = fr["severity"]
    sev_color = {"Low":"#22863a","Medium":"#f6a623","High":"#cb2431"}.get(sev,"#666")
    with col_l:
        st.markdown(f"""
        <div style='background:{sev_color}15;border-radius:12px;padding:20px;'>
          <div style='font-size:2.5em;font-weight:bold;color:{sev_color};'>{prob:.1f}%</div>
          <div>Fraud Probability</div>
          <div style='font-size:1.2em;color:{sev_color};font-weight:600;margin-top:8px;'>{sev} Risk</div>
          <div style='margin-top:8px;color:#666;font-size:0.9em;'>
            Statistical Anomaly: {"⚠️ YES" if fr["is_statistical_anomaly"] else "✅ No"}
          </div>
        </div>
        """, unsafe_allow_html=True)
    with col_r:
        st.markdown("#### Risk Flags")
        if fr["flags_raised"] == 0:
            st.success("✅ No fraud flags raised — clean profile")
        else:
            for fc in fr["flag_commentary"]:
                st.markdown(f"""<div class="flag-box"><strong>{fc['flag_id']}</strong>: {fc['commentary']}</div>""",
                            unsafe_allow_html=True)

with tab4:
    col_l, col_r = st.columns(2)
    with col_l:
        st.markdown(f"""
        <div class="metric-card">
          <div style='font-size:0.85em;color:#666;'>MAX SAFE LOAN</div>
          <div style='font-size:2.5em;font-weight:bold;color:#E05C1A;'>{fmt_crore(uw['max_safe_loan_inr'])}</div>
          <div style='color:#666;margin-top:4px;font-size:0.9em;'>{uw['note']}</div>
        </div>
        """, unsafe_allow_html=True)
        st.markdown(f"""
        <div class="metric-card" style='margin-top:12px;'>
          <div style='font-size:0.85em;color:#666;'>ELIGIBLE LTV</div>
          <div style='font-size:2em;font-weight:bold;color:#333;'>{uw['eligible_ltv_pct']}%</div>
          <div style='color:#666;font-size:0.9em;'>Ownership: {uw['ownership_type']}</div>
        </div>
        """, unsafe_allow_html=True)
    with col_r:
        st.markdown("**Underwriting Equation:**")
        st.code(
            f"Distress Value = {fmt_crore(uw['distress_value_inr'])}\n"
            f"Eligible LTV   = {uw['eligible_ltv_pct']}%\n"
            f"Max Safe Loan  = {fmt_crore(uw['max_safe_loan_inr'])}\n\n"
            f"Confidence Grade: {cf['grade']}\n"
            f"Manual Review: {'REQUIRED' if cf['manual_review'] else 'Not required'}"
        )
        if cf["manual_review"]:
            st.warning(f"⚠️ {cf.get('review_reason','Manual review required')}")

with tab5:
    vd = r.get("shap_value_drivers", [])
    ld = r.get("shap_liquidity_drivers", [])
    if vd:
        st.markdown("#### Value Engine — SHAP Feature Drivers")
        for d in vd:
            color = "#22863a" if d["direction"] == "positive" else "#cb2431"
            arrow = "▲" if d["direction"] == "positive" else "▼"
            st.markdown(f"""
            <div style='display:flex;align-items:center;margin:4px 0;'>
              <span style='color:{color};font-size:1.2em;margin-right:8px;'>{arrow}</span>
              <span style='font-weight:600;width:220px;'>{d['display_name']}</span>
              <span style='color:#666;font-size:0.9em;'>{d['commentary']}</span>
            </div>
            """, unsafe_allow_html=True)
    else:
        st.info("SHAP drivers require trained explainer (run training with --shap flag)")

# ── Footer ────────────────────────────────────────────────────
meta = r.get("meta", {})
st.markdown("---")
st.caption(
    f"Collat.AI v{meta.get('model_version','3.0.0')} · "
    f"City: {meta.get('city','—')} · "
    f"Inference: {meta.get('inference_ms','?')}ms · "
    f"Cost: ₹{meta.get('api_call_cost_inr',3)} per API call · "
    f"TenzorX Hackathon 2026"
)
st.download_button("⬇️ Download Full Report (JSON)",
                   data=json.dumps(r, indent=2),
                   file_name=f"collat_v3_{city}_{locality}_{area_sqft}sqft.json",
                   mime="application/json")

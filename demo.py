"""
demo.py — Collat.AI v3 Quick Demo
Run: python demo.py
Tests inference pipeline with sample properties from 3 cities.
"""

import sys, os
sys.path.insert(0, os.path.join(os.path.dirname(__file__), "src"))

from inference_pipeline import _load_artefacts, valuate_property

DEMOS = [
    {
        "label": "Mumbai — Bandra 3BHK",
        "city": "Mumbai", "zone": "Western Suburbs", "locality": "Bandra",
        "property_type": "Apartment", "sub_type": "3BHK",
        "area_sqft": 1200, "age_years": 4,
        "floor_number": 15, "total_floors": 28,
        "bedrooms": 3, "bathrooms": 3, "parking_slots": 2,
        "lift_available": True, "rera_registered": True, "legal_clear": True,
    },
    {
        "label": "Bangalore — Koramangala Office",
        "city": "Bangalore", "zone": "East Bangalore", "locality": "Koramangala",
        "property_type": "Commercial", "sub_type": "Office",
        "area_sqft": 2500, "age_years": 8,
        "floor_number": 4, "total_floors": 10,
        "bedrooms": 0, "bathrooms": 2, "parking_slots": 5,
        "lift_available": True, "rera_registered": True,
    },
    {
        "label": "Hyderabad — Jubilee Hills Villa",
        "city": "Hyderabad", "zone": "Jubilee Hills", "locality": "Jubilee Hills",
        "property_type": "Villa", "sub_type": "Bungalow",
        "area_sqft": 4000, "age_years": 10,
        "floor_number": 0, "total_floors": 2,
        "bedrooms": 5, "bathrooms": 5, "parking_slots": 3,
        "swimming_pool": True, "gym_available": True,
        "rera_registered": True, "legal_clear": True,
    },
]


def fmt_crore(v):
    if v >= 1e7: return f"₹{v/1e7:.2f} Cr"
    return f"₹{v/1e5:.1f}L"


def run_demo():
    print("\n" + "="*60)
    print("  🏙️  Collat.AI v3 — Quick Demo")
    print("="*60)

    try:
        print("\n📂 Loading models...")
        _load_artefacts()
        print("✅ Models loaded\n")
    except Exception as e:
        print(f"❌ Models not found: {e}")
        print("   Run: ./run.sh train   first to generate models.")
        return

    for demo in DEMOS:
        label = demo.pop("label")
        print(f"\n{'─'*50}")
        print(f"  📍 {label}")
        print(f"{'─'*50}")

        result = valuate_property(demo)
        mv = result["market_value"]
        lq = result["liquidity"]
        fr = result["fraud_risk"]
        cf = result["confidence"]
        uw = result["underwriting"]

        print(f"  Market Value:   {fmt_crore(mv['p50_total'])} "
              f"[{fmt_crore(mv['p10_total'])} – {fmt_crore(mv['p90_total'])}]")
        print(f"  Price/sqft:     ₹{mv['p50_sqft']:,.0f}")
        print(f"  Distress Value: {fmt_crore(result['distress_value']['low_total'])}")
        print(f"  RPI Score:      {lq['rpi_score']:.1f}/100  ({lq['rpi_label']})")
        print(f"  TTL:            {lq['ttl_days_low']}–{lq['ttl_days_high']} days")
        print(f"  Fraud Risk:     {fr['fraud_probability']:.1f}%  [{fr['severity']}]")
        if fr["flag_ids"]:
            print(f"  Flags:          {', '.join(fr['flag_ids'])}")
        print(f"  Grade:          {cf['grade']}  (confidence: {cf['score']*100:.0f}%)")
        print(f"  Max Safe Loan:  {fmt_crore(uw['max_safe_loan_inr'])}  (LTV {uw['eligible_ltv_pct']}%)")
        print(f"  Inference:      {result['meta']['inference_ms']} ms")

    print(f"\n{'='*60}")
    print("  ✅ Demo complete. Start API:  ./run.sh api")
    print("  ✅ Start UI:                  ./run.sh ui")
    print(f"{'='*60}\n")


if __name__ == "__main__":
    run_demo()

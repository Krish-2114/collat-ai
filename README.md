<div align="center">

<img src="https://img.shields.io/badge/TenzorX%202026-National%20AI%20Hackathon-E8470A?style=for-the-badge" />
&nbsp;
<img src="https://img.shields.io/badge/Problem%20Statement-4A%20%7C%20Collateral%20Valuation-c0392b?style=for-the-badge" />
&nbsp;
<img src="https://img.shields.io/badge/Team-The%20Triads%20%7C%20SPIT%20Mumbai-1a1a2e?style=for-the-badge" />

<br/><br/>

# Collat.AI &nbsp;`v3`

### AI-Powered Collateral Valuation & Resale Liquidity Engine

*Multi-City Indian Real Estate Intelligence — 8 Cities · 200K+ Records · CNN Image Pipeline*

<br/>

[![Python](https://img.shields.io/badge/Python-3.11+-3776AB?style=flat-square&logo=python&logoColor=white)](https://python.org)
[![FastAPI](https://img.shields.io/badge/FastAPI-0.115-009688?style=flat-square&logo=fastapi)](https://fastapi.tiangolo.com)
[![React](https://img.shields.io/badge/React-18-61DAFB?style=flat-square&logo=react&logoColor=black)](https://reactjs.org)
[![Vite](https://img.shields.io/badge/Vite-5-646CFF?style=flat-square&logo=vite)](https://vitejs.dev)
[![XGBoost](https://img.shields.io/badge/XGBoost-2.0-FF6600?style=flat-square)](https://xgboost.ai)
[![LightGBM](https://img.shields.io/badge/LightGBM-Liquidity%20Engine-02569B?style=flat-square)](https://lightgbm.readthedocs.io)
[![SHAP](https://img.shields.io/badge/SHAP-Explainability-8B4513?style=flat-square)](https://shap.readthedocs.io)
[![EfficientNet](https://img.shields.io/badge/EfficientNet--B0-CNN%20Vision-FF6F00?style=flat-square)](https://timm.fast.ai)

<br/>

| 📊 200K+ Records | 🏙️ 8 Indian Metro Cities | ⚡ Response in <30 Seconds | 🎯 91% Avg Confidence | 💰 ₹2–5 Per API Call |
|:---:|:---:|:---:|:---:|:---:|

<br/>

> *"We don't just predict price. We predict whether your collateral can actually save you."*
>
> *Think of Collat.AI as a Bloomberg Terminal for real estate collateral — where lenders see **Price, Risk, and Liquidity** together, not in silos.*

</div>

---

## Table of Contents

1. [The Problem Being Solved — TenzorX Problem Statement 4A](#1-the-problem-being-solved--tenzorx-problem-statement-4a)
2. [How Collat.AI Solves It — Our Answer](#2-how-collat-ai-solves-it--our-answer)
3. [Quick Start — Run the Full Stack](#3-quick-start--run-the-full-stack)
4. [Platform Walkthrough — Every Page Explained](#4-platform-walkthrough--every-page-explained)
5. [AI/ML Models — Deep Technical Dive](#5-aiml-models--deep-technical-dive)
6. [Feature Engineering — 850-Feature Intelligence System](#6-feature-engineering--850-feature-intelligence-system)
7. [Collateral Output Reference](#7-collateral-output-reference)
8. [API Reference](#8-api-reference)
9. [Multi-City Market Coverage](#9-multi-city-market-coverage)
10. [Tech Stack](#10-tech-stack)
11. [Project Structure](#11-project-structure)
12. [Phase Roadmap — Hackathon to Market Leader](#12-phase-roadmap--hackathon-to-market-leader)
13. [Evaluation Criteria Mapping](#13-evaluation-criteria-mapping)
14. [Team — The Triads](#14-team--the-triads)

---

## 1. The Problem Being Solved — TenzorX Problem Statement 4A

### Official Problem Statement

**Problem Statement 4 — AI Powered Estimation Portal/Chatbot | Option A — AI-Powered Collateral Valuation & Resale Liquidity Engine**

#### Context: Why This Is a Real Problem

For NBFCs and secured lenders, property-backed lending hinges on two fundamental questions that must be answered before any loan is sanctioned: what is the asset worth today, and how easily can it be liquidated if the borrower defaults? Most current valuation approaches rely on manual site inspections by certified valuers, broker inputs that are subjective and inconsistent, and circle rates that often lag actual market conditions by two to five years. This leads to large valuation variance, mispriced risk and conservative lending, and slower credit decisioning turnaround times.

The total LAP book outstanding in India is **₹87 Lakh Crore** (FY24), growing at an **18% CAGR** over five years, with **₹45,000 Crore+ in new LAP disbursals annually**. The current valuation TAT is 3–7 business days, creating an enormous bottleneck in the credit pipeline. Two valuers assessing the same property routinely differ by **30–40%**, and no NBFC today has a structured exit certainty score at the point of underwriting.

The result: **₹12,000+ Crore in mispriced collateral risk on NBFC books every year.** Good borrowers are rationed. Bad assets slip through.

#### Core Problem Statement (Verbatim from Problem Sheet)

> Design a **data-led valuation and liquidity engine** that can consistently estimate both **asset value and resale risk** for property-backed lending.

#### Required Target Outputs

The problem statement specifies six mandatory outputs that any valid solution must produce:

| # | Output | Description | Format Required |
|---|---|---|---|
| 1 | **Estimated Market Value** | Fair market value at current conditions | ₹ range — not a point estimate |
| 2 | **Distress Sale Value** | Forced liquidation floor for SARFAESI enforcement | ₹ range with liquidity discount applied |
| 3 | **Resale Potential Index** | Consolidated liquidity signal — exit certainty score | Continuous 0–100 |
| 4 | **Estimated Time to Liquidate** | Time-to-sell bucket with a day range | Day range (e.g., 31–90 days) |
| 5 | **Confidence Score** | Statistical reliability of the entire valuation | Continuous 0.0–1.0 |
| 6 | **Key Risk Flags & Value Drivers** | Explainable positive and negative signals | Named flag list with attribution |

#### What the Problem Is Actually Asking For

The problem statement explicitly states: *"This is not just a pricing model."* The objective is to build a **market-aware collateral intelligence layer** that combines intrinsic value (what the asset should sell for based on its physical, legal, and locational attributes) with liquidity (how fast and how reliably it can be sold in the open market). In practice, lenders care as much about exit certainty as they do about valuation. A ₹1 Crore apartment in a dead micro-market is far riskier collateral than a ₹80 Lakh apartment in a prime locality — yet traditional valuation captures only the first number and ignores the second entirely.

#### Feature Engineering Framework Required

The problem statement specifies five feature engineering pillars that a strong solution must address:

**Pillar 1 — Location Intelligence (Primary Driver)**

Location is described as the dominant price driver. The problem demands derived signals including Circle Rate Benchmark (statutory floor value), Market Activity Proxies (nearby listings, broker density, transaction indicators), Infrastructure Proximity Index (distance to metro/rail, highways, commercial hubs, schools, hospitals), and Neighbourhood Quality Score (residential vs mixed-use, planned vs unplanned zones).

**Pillar 2 — Property Characteristics**

Property type (Residential / Commercial / Industrial), sub-type (Apartment, villa, plot, shop, warehouse), size in carpet or built-up area, vintage (New <5 years / Mid-age 5–15 years / Old >15 years), and floor level with accessibility. These factors directly influence depreciation, buyer demand, and usable life.

**Pillar 3 — Legal & Ownership Attributes**

Freehold vs leasehold ownership, clear title vs legal complexity, encumbrance status, and litigation flags. These directly affect resale liquidity and drive conservative LTV limits in underwriting.

**Pillar 4 — Income & Usage Signals**

Occupancy status (self-occupied / rented / vacant) and rental yield proxy. Properties with healthy rental yields attract investors, improving resale certainty.

**Pillar 5 — Market Dynamics Layer**

Supply–demand balance (listing density vs absorption indicators), local price momentum, and asset fungibility. Standard configurations such as 2BHK apartments carry higher liquidity. Custom or niche assets carry lower liquidity.

#### Valuation and Liquidity Modeling Requirements

**Market Value Estimation** must produce a value range, not a point estimate, as a function of circle rate benchmark, location premium, property type and size, age and depreciation, infrastructure score, and rental yield where applicable.

**Distress Sale Value** is specified as: `Distress Value = Market Value × Liquidity Discount`, where the discount depends on asset type, location demand, and legal clarity.

**Resale Potential Index (0–100)** is a consolidated liquidity signal where prime location, standard configuration, and high-demand micromarket push scores up, while older construction, legal complexity, and niche asset profiles push scores down. The interpretation per the problem statement is 80–100 Highly Liquid, 50–80 Moderate Liquidity, and below 50 Illiquid / Specialised.

**Time to Liquidate** is expressed as a time range (not a single number) computed as a function of Resale Index, Property Type, and Market Activity Indicators.

#### Fraud and Risk Safeguards Required

The problem specifically asks for detection of overstated property size, incorrect location tagging, and property type misclassification, with expected safeguards including size sanity checks against locality norms, location–property mismatch flags, and configuration plausibility checks.

#### Evaluation Criteria (Official Weights)

| Dimension | Weight |
|---|---|
| Valuation logic | 25% |
| Liquidity modeling | 25% |
| Feature depth | 20% |
| Practical deployability | 15% |
| Explainability | 15% |

#### What a Strong Solution Looks Like (Official Guidance)

The problem statement explicitly distinguishes a weak submission from a strong one:

Not acceptable: *"We trained a regression model to predict price."*

Expected: *"We designed a structured valuation and liquidity framework where location sets the base, property attributes adjust value, market forces define exit risk, and outputs are transparent and range-based."*

The final framing from the official problem sheet: *"You are building a 'Bloomberg Terminal for Real Estate Collateral' — where lenders see price, risk, and liquidity together, not in silos."*

---

## 2. How Collat.AI Solves It — Our Answer

Collat.AI is a full-stack, production-grade AI platform built to answer every dimension of Problem Statement 4A. We produce a complete collateral intelligence dossier in under 30 seconds, with full SHAP explainability, covering all six required outputs — plus LTV matrix computation, max safe loan calculation, and a natural-language underwriting recommendation.

### Live Collateral Report Outputs — From the Running Prototype

**Case 1 — Mumbai · Bandra · Apartment (Studio) · 1,100 sqft — Clean Profile**

This is a RERA-registered property with clear legal title, no risk flags active, and a prime Bandra Western Suburbs location. Grade A with 94% confidence.

| Metric | Value | Interpretation |
|---|---|---|
| Market Value (P50) | ₹5.03 Cr | Fair market price |
| Market Value Range | ₹4.42 Cr – ₹5.77 Cr | Calibrated P10–P90 band |
| Price / sqft (P50) | ₹45,682 | P10: ₹40,200 · P90: ₹52,400 |
| Distress Value | ₹3.82 Cr (up to ₹4.77 Cr) | SARFAESI liquidation floor |
| Resale Potential Index | 96.8 / 100 | Excellent Liquidity |
| Time to Liquidate | 31–90 days | Exit certainty: high |
| Max Safe Loan | ₹2.77 Cr | LTV: 72.5% |
| Confidence Score | 94% | Grade A |

**Case 2 — Mumbai · Bandra · Commercial (Office) · 5,950 sqft — All Risk Flags Active**

Same micro-market but a commercial asset with all five risk flags enabled (Flood Zone, CRZ Zone, Heritage Zone, Encumbrance, Litigation). The system correctly applies a lower LTV for commercial class and reflects legal risk in the confidence haircut.

| Metric | Value | Interpretation |
|---|---|---|
| Market Value (P50) | ₹26.91 Cr | P10: ₹23.69 Cr |
| Price / sqft | ₹45,235 | P10: ₹39,807 |
| Distress Value | ₹16.15 Cr (up to ₹23.42 Cr) | Higher discount for legal complexity |
| Resale Potential Index | 96.8 / 100 | Location premium preserved |
| Time to Liquidate | 31–90 days | |
| Max Safe Loan | ₹9.69 Cr | LTV: 60.0% (Commercial class) |

These two cases from the live prototype demonstrate that the system correctly differentiates residential from commercial LTV, applies asset-class-appropriate liquidity discounts, and preserves the location premium even when legal risk flags are active.

### How We Beat Every Evaluation Criterion

**Valuation Logic (25%)** — XGBoost Quantile Regression produces three output bands (P10/P50/P90). Each band has a distinct underwriting interpretation: P10 is the distress floor used for SARFAESI enforcement, P50 is the fair market value used as the headline collateral figure, and P90 is the ceiling used for portfolio stress testing. Circle rate benchmarking is integrated as a feature input and cross-validation signal.

**Liquidity Modeling (25%)** — Liquidity is treated as an entirely separate ML problem with a dedicated LightGBM Ordinal Regression engine trained on time-to-sell data from public listing portals. The Resale Potential Index and Time-to-Liquidate are first-class outputs — not derived from the price model. The TTL output is calibrated against the 120–195 day SARFAESI enforcement window.

**Feature Depth (20%)** — 850 features across six interpretable layers, including 81 POI-density features at three radii, five composite master scores, and 130 non-linear interaction terms that individual variables cannot capture alone.

**Practical Deployability (15%)** — Single-command `npm start` launches the full stack. Interactive Swagger API at `/docs`. React frontend built for NBFC loan officer workflows — no data science background required to run an analysis.

**Explainability (15%)** — SHAP feature attribution on every valuation, named value drivers and risk flags in the response payload, natural-language commentary per SHAP contribution, and a transparent Confidence Calibrator formula that shows exactly what raised or lowered the score.

---

## 3. Quick Start — Run the Full Stack

### Prerequisites

| Tool | Minimum Version | Verify |
|---|---|---|
| **Node.js** | v18.0.0 | `node -v` |
| **Python** | 3.11.0 (64-bit) | `python --version` |

Both must be available on your system `PATH`. Download from [nodejs.org](https://nodejs.org) and [python.org](https://python.org) if needed.

### Windows — PowerShell

```powershell
cd C:\path\to\collat-ai-main

npm start
```

`npm start` is a fully automated bootstrap. It runs `scripts/bootstrap-dev.mjs` which handles the entire setup sequence — creating the Python virtual environment, installing Python dependencies from `requirements-api.txt`, running `npm install` across all workspaces, and then launching the FastAPI server and Vite frontend concurrently with colour-coded terminal output.

### macOS / Linux / Git Bash

```bash
cd /path/to/collat-ai-main

npm start
# alternatively:
chmod +x run.sh && ./run.sh
```

### Access the Running Application

| Interface | URL |
|---|---|
| Collat.AI Frontend (React + Vite) | http://localhost:5173 |
| FastAPI Swagger UI (Interactive API docs) | http://localhost:8000/docs |
| API Health Check | http://localhost:8000/health |
| OpenAPI 3.1 Schema | http://localhost:8000/openapi.json |

### Development Mode

```powershell
npm run dev          # Both servers with shared terminal output
npm run dev:api      # FastAPI backend only
npm run dev:web      # Vite frontend only
npm run build:web    # Production build of the frontend
```

### Environment Override

To use a specific Python executable instead of the auto-detected venv:

```powershell
$env:COLLAT_PYTHON = "C:\Python311\python.exe"
npm start
```

---

## 4. Platform Walkthrough — Every Page Explained

Collat.AI is a fully-featured, multi-page React SPA with six distinct pages, real-time market intelligence, user authentication, portfolio management, and three independent AI engine interfaces. Every page in the live prototype is documented below.

### 4.1 Home — Market Intelligence Dashboard

**URL:** `http://localhost:5173/#/`

The home page opens with a hero statement — *"Smarter lending. Stronger decisions. Backed by intelligence."* — and three feature cards summarising the three core capabilities: Predict price (AI-driven market value estimation), Check liquidity (resale potential, exit timelines, and liquidity score), and Detect risk (fraud detection, legal checks, and risk flags). Each card links directly to the corresponding engine page.

The dominant right panel is a live **Market Overview Dashboard** that is filterable by city (all 8 cities in a dropdown) and time window (Last 6 months, Last 3 months, Last month). In the prototype it shows data for Mumbai over the last six months:

The four top-level KPIs are Total Analyses (13,349, +16.6% growth), Average Confidence across all analyses (87%, +7.1% improvement), High Risk Cases flagged by the fraud engine (240, −16.4% meaning fraud detection is catching fewer cases over time as data quality improves), and LTV Accuracy metric (95%, +3.2% trend).

Below the KPIs, four data visualisations provide portfolio-level intelligence. The Market Value Trend chart is a line chart plotting price-per-sqft from January through June, showing the upward trajectory of collateral values in the selected city. The Liquidity Score Distribution is a donut chart showing the proportion of analyses that came back High (29%), Medium (32%), and Low (39%) liquidity — giving lenders a portfolio-wide view of their exit certainty exposure. The Risk Cases Over Time bar chart plots fraud-flagged analyses month by month. The Top Risk Reasons horizontal bar list ranks the most common fraud flags: High circle rate deviation at 42%, Ownership mismatch at 24%, Incomplete documentation at 18%, and Litigation / legal issues at 17%.

At the bottom of the page, a National Footprint section renders a map of India with orange markers on all eight covered metros, plus a coverage stats panel showing 200K+ records, 8 cities, 91% confidence, and <30s response. Per-city price benchmarks and YoY growth rates are listed below the map.

Scrolling Live Market Signal cards auto-play with three ticker-style insights: Hyderabad +15.6% as the fastest-growing city with IT corridor commentary, Mumbai ₹18.5k/sqft as the highest-priced micro-market with bid-ask spread context, and Bangalore 8.4/10 as the liquidity pulse signal with TTL compression commentary.

### 4.2 Models — AI Engine Documentation

**URL:** `http://localhost:5173/#/models`

This page is designed for a credit manager or decision-maker who wants to understand what each model does before trusting it with an underwriting decision. It does not use technical jargon — it is written for loan officers.

The page opens with four principle cards that establish the platform's value proposition: Three engines (Value, Liquidity, and Risk — each explained in plain language), One workflow (the same property form powers every model on the right), Seconds to insight (run any engine immediately after filling basic details), and Built for decisions (ranges and scores you can brief a credit committee on).

Three deep model documentation cards follow. The **Value Engine** card explains that it tells you what a property is worth today, what it could sell for in a worst-case scenario, and how confident the estimate is. The What It Predicts section lists market value, distress value, price range, and confidence level. The What It Uses section lists city and locality, property type, size and age, floor and usage type, and local area quality signals. A "Try in Valuation" link takes users directly to the valuation engine.

The **Liquidity Engine** card explains that it tells you how quickly a property could actually be sold and how certain that exit timeline is. It surfaces the Resale Potential Index from 0 to 100 with the four interpretation bands. The **Fraud Engine** card explains the ten deterministic rules plus Isolation Forest anomaly scoring, and lists the categories of anomalies it catches.

A Download Report button on this page generates a PDF summary of all three model descriptions — useful for sharing with a credit committee that wants to understand the system before adopting it.

### 4.3 Valuation — Market Valuation Engine

**URL:** `http://localhost:5173/#/valuate`

This is the primary engine interface and the most feature-rich page in the application. The page is titled "Market valuation — Submit property attributes to run the value engine with full collateral intelligence." It is divided into a left input panel and a right intelligence panel that updates progressively.

**Left Panel — Property Input Form**

The form is organized into collapsible accordion sections. Location Details collects City (dropdown for all 8 cities), Zone (filtered based on city), Locality (filtered based on zone), and optional Latitude/Longitude coordinates for GPS-precision enrichment.

Property Basics collects Property Type (Apartment, Commercial, Industrial), Sub-type (2BHK, Studio, Office, Shop, Warehouse, and others based on type selection), Area in sqft, Age in years, Floor number, Total floors, Bedrooms, Bathrooms, Parking slots, and Ownership type (Freehold or Leasehold).

Amenities is a toggle section for Swimming Pool, RERA Registered, Gym, Lift, and other building-level attributes. Legal is a toggle section for Legal Title Clear, Encumbrance Flag, and Litigation Flag. Risk Flags is a toggle section for Flood Zone, CRZ Zone, and Heritage Zone. The Analyse Property button at the bottom is styled as the primary action — red-orange, full-width, with a pulsing dot animation.

**Right Panel — Pre-Analysis Market Intelligence**

Before any analysis is submitted, the right panel immediately shows real-time micro-market context for the selected city. This is a deliberate design decision: the lender should understand the macro environment before interpreting any individual property's score.

The Local Price Trend chart is a line chart spanning six months (January through June) showing price-per-sqft movement. For Mumbai in the prototype, it shows Jan → ₹16,200 rising to Jun → ₹17,850, annotated with +10.2% over six months. The Supply vs Demand chart is a horizontal bar chart comparing Available listings (approximately 420) against Buyer demand score (approximately 610), with the summary label "Demand exceeds supply by 45%" — a clearly bullish signal. The Micro-Market Liquidity gauge is a circular progress indicator showing 87 out of 100 with the label "High resale activity in this locality."

A Live Market Signals button in the top-right corner of this panel opens a side drawer with the three ticker-style market intelligence cards described in the Home section.

**Right Panel — Post-Analysis Collateral Report**

After clicking Analyse Property, the right panel replaces the pre-analysis content with the full Collateral Report. The report header shows the property summary (city, zone, locality, type, area), the Grade badge (A/B/C), and the Confidence percentage.

Six metric cards render the six required outputs: Market Value (P50) with the P10–P90 range below, Price/sqft with the P10 and P90 values, Distress Value with the max estimate, Resale Potential (score/100) with the liquidity label, Time to Liquidate with the day range, and Max Safe Loan with the LTV percentage.

Below the metric cards, five analysis tabs provide deeper intelligence. **Value Analysis** shows a grouped bar chart of the P10/P50/P90 market value range and a Price/sqft Breakdown table. **Liquidity** shows the RPI gauge visualization and the TTL distribution across Fast/Standard/Slow categories. **Fraud Risk** shows the rule-by-rule breakdown — which of the ten rules triggered, what the anomaly score is, and the confidence penalty applied. **Underwriting** shows the full LTV matrix with the property's current position highlighted, the Max Safe Loan computation with each formula component visible, and the final recommendation text. **SHAP Drivers** shows the top five feature contributions with magnitude, direction (positive or negative), and a natural-language explanation of what each feature means in the context of this property.

### 4.4 Liquidity — Liquidity Intelligence Engine

**URL:** `http://localhost:5173/#/liquidity`

The page is titled "Liquidity intelligence — Resale potential index, time-to-liquidate, and exit certainty using the same inference stack." The design principle is explicit in that subtitle: the same property form powers all three engines. A loan officer fills in property details once and can switch between Valuation, Liquidity, and Fraud without re-entering data.

The identical two-panel layout is used. The left panel has the complete property input form with all the same fields. The right panel shows the identical Pre-Analysis Market Intelligence (price trend, supply-demand, liquidity gauge) before analysis, and switches to the Liquidity Report after submission.

The Liquidity Report headlines with the Resale Potential Index as a large circular gauge — the number most meaningful for a lender's exit certainty assessment. Below it, the TTL day range is shown as a categorical visualization (Fast / Standard / Slow horizontal bands with the current property's range highlighted in orange). The report also breaks down which specific factors contributed positively and negatively to the RPI, so a lender understands whether a score of 72 means "large apartment in a good location with a legal complexity drag" vs "small apartment in a low-demand zone."

### 4.5 Fraud — Fraud Risk Assessment Engine

**URL:** `http://localhost:5173/#/fraud`

The page is titled "Fraud risk assessment — Ten deterministic rules plus isolation-forest anomaly scoring on engineered features." This page serves a dual purpose: it detects fraud on the submitted property, and it also surfaces the pre-analysis market intelligence that itself functions as a fraud signal. A property claiming to be priced at ₹45k/sqft in a micro-market where the six-month trend shows ₹16–18k/sqft is itself a red flag, visible on the right panel before any analysis runs.

The input form is identical to the Valuation page. The Risk Flags toggle section is particularly prominent on this page — Flood Zone, CRZ Zone, Heritage Zone, Encumbrance Flag, and Litigation Flag are all clearly visible with their on/off states, because each of these flags directly feeds into the fraud detection rules.

The Fraud Report shows the overall Fraud Severity rating (Low, Medium, or High) as a coloured badge, the Isolation Forest Anomaly Score as a continuous number from 0 to 1, and a numbered list of every rule that triggered — each with its rule ID, the specific signal that caused it to fire, and the confidence penalty it applied. A summary line at the bottom shows the total confidence reduction from fraud penalties.

### 4.6 Portfolio — Authenticated Analysis Workspace

**URL:** `http://localhost:5173/#/portfolio`

The portfolio page provides a personal workspace for loan officers to save, retrieve, and download their past analyses. Authentication is local to the browser in demo mode — no external server or cloud account is required for the prototype.

The login page at `localhost:5173/#/login` provides a clean sign-in form with Email and Password fields and a Register tab for creating new accounts. The description reads: "Use your workspace to save analyses to a personal portfolio (local demo — data stays in this browser)." This makes the demo safe for judges to explore without any data leaving their machine.

After authentication, the portfolio page shows the logged-in user's email (the prototype is logged into `bhavik.desai23@spit.ac.in`), a Download Report button for generating a PDF of all saved analyses, and a Sign Out option. Saved analyses are listed as cards showing the property summary (e.g., Mumbai — Matunga · 700 sqft), the headline P50 market value (₹2,40,35,200), the confidence score, and the timestamp. Each card has Open and Delete actions.

Below the saved analyses, three quick-launch engine cards (Valuation, Liquidity, Fraud) allow the user to immediately run a new analysis without returning to the home page.

---

## 5. AI/ML Models — Deep Technical Dive

### 5.1 Value Engine — XGBoost + Quantile Regression

The Value Engine answers: what is this asset worth today, at the optimistic, fair, and pessimistic price?

**Algorithm choice:** XGBoost with three independent Quantile Regression objectives trained at the 10th, 50th, and 90th percentiles. This is a deliberate design decision — not an ensemble for aggregate accuracy, but a structured output of three economically meaningful bands from a single inference call.

**Target variable:** Price per sqft (₹/sqft). Normalising to per-sqft representation allows circle rate benchmarking and cross-comparison across properties of different sizes. Final output is converted back to total value by multiplying by area.

**Training data:** 200,000+ synthetic records generated with city-stratified priors derived from public listing data, government circle rate APIs, and OpenStreetMap POI density measurements. The synthetic generator in `src/dataset_generator.py` follows the actual statistical distributions of each city, not a uniform random distribution, ensuring the model learns city-specific pricing dynamics.

**Feature count:** 440 features drawn from the Location Intelligence, Property Characteristics, and Market Dynamics layers of the 850-feature system.

**Output and underwriting interpretation:** P10 is the pessimistic floor — used to compute Distress Sale Value and the SARFAESI liquidation estimate, because a lender enforcing collateral under SARFAESI typically cannot achieve better than the P10 price in a forced sale. P50 is the fair market value — used as the headline collateral figure for standard LTV computation. P90 is the optimistic ceiling — used for upside LTV calculations and portfolio stress testing scenarios.

**Accuracy target:** MAPE below 12% on the holdout validation set.

**Why quantile regression matters in secured lending:** A single-point predictor tells a lender nothing about the range of possible outcomes. If property A is valued at ₹1 Cr with a P10–P90 spread of ₹85L–₹1.15Cr, that is a narrow, confident estimate that supports a full LTV. If property B is also valued at ₹1 Cr but has a P10–P90 spread of ₹60L–₹1.45Cr, that wide band is itself a risk signal that should tighten the LTV. Our Width Penalty in the Confidence Calibrator directly translates this spread into a lower confidence score, which automatically tightens the eligible LTV.

### 5.2 Liquidity Engine — LightGBM + Ordinal Regression

The Liquidity Engine answers: how quickly and reliably can this asset be sold, and with how much exit certainty?

**Algorithm choice:** LightGBM with Ordinal Regression. LightGBM was chosen over XGBoost for the liquidity task because it handles high-cardinality categorical features (property type, city, zone, locality) natively without one-hot encoding overhead, and trains approximately three times faster on the liquidity-specific feature subset. Ordinal Regression is used because the four time-to-sell buckets have a natural ordering that a standard classifier would not preserve.

**Target variable:** Time-to-sell bucket — 0–30 days, 31–90 days, 91–180 days, or 180+ days. Ordinal regression ensures that the model understands 31–90 days is strictly between 0–30 and 91–180, rather than treating them as four unrelated labels. This ordering is critical for calibrated uncertainty estimates.

**Training data:** Listing dwell-time data from public property portals (MagicBricks, 99acres, Housing.com) accessed via the web scraper in `src/web_scraper.py`, supplemented with synthetic records following locality-level absorption rate priors for cities where dwell-time data is sparse.

**Feature count:** 370 features from the Location Intelligence, Liquidity Signals, Market Dynamics, and Configuration layers.

**Output:** The Resale Potential Index (0–100) is derived from the ordinal probability distribution across the four buckets — properties with most probability mass in the 0–30 day bucket score near 100, while properties with most mass in the 180+ day bucket score near 0. The TTL day range label is the modal predicted bucket's range.

**Accuracy target:** Weighted F1 above 0.71 across all four time-to-sell classes.

**Why a separate liquidity model is essential:** The Value Engine and Liquidity Engine are trained on fundamentally different signals. A property can be accurately priced at ₹1 Cr but be effectively unsaleable in six months — an industrial warehouse in a city with no institutional buyer pool, a floor-to-ceiling heritage property in a legally complex zone, or a large niche commercial asset in a market where buyer appetite is thin. Separating intrinsic worth from exit certainty and solving them as two independent ML problems — then combining them through the underwriting equation — is what most competing approaches miss entirely.

### 5.3 Fraud Engine — Isolation Forest + 10 Deterministic Rules

The Fraud Engine answers: is anything about this property profile anomalous, inconsistent, or suspicious?

**Architecture:** A hybrid approach combining ten deterministic business rules (which catch known, named fraud patterns) with an unsupervised Isolation Forest (which catches novel anomalies that no specific rule covers).

**The 10 Deterministic Fraud Rules:**

| Rule ID | Signal Monitored | Trigger Condition |
|---|---|---|
| R01 | Area inflation | Property size more than 2.5 standard deviations above the locality median for this sub-type |
| R02 | Ownership mismatch | Freehold claim with encumbrance flag simultaneously active |
| R03 | Rental yield anomaly | Declared or derived yield above 12% — statistically implausible for the claimed micro-market |
| R04 | Documentation gaps | Incomplete legal documentation combined with an above-median asking price |
| R05 | Active litigation | Litigation flag is set — automatic severity escalation regardless of other signals |
| R06 | Regulatory zone without price discount | CRZ, Heritage Zone, or Flood Zone flag active but the claimed price does not reflect any discount |
| R07 | Flood zone without acknowledgment | Flood zone flag set with no corresponding risk acknowledgment or insurance mention in input |
| R08 | Age-price inconsistency | Property claims to be less than 5 years old but is priced below the area's established new construction floor |
| R09 | Unexplained encumbrance | Encumbrance flag set — flags for mandatory verification before LTV can be assigned |
| R10 | Micro-market price outlier | Price per sqft deviates more than 2 standard deviations from the city-adjusted per-zone median |

**Isolation Forest:** Trained in unsupervised mode on the full distribution of valid property profiles from the training dataset. Properties that fall in sparse, unusual regions of the 850-dimensional feature space — combinations that are rare in the legitimate distribution — receive high anomaly scores regardless of whether a specific named rule was triggered. This is the component that catches novel fraud patterns not explicitly anticipated in the rule set.

**Confidence Penalty System:** Each triggered rule reduces the overall Confidence Score by 0.05 to 0.12, depending on the severity of the signal. A property with three active flags might drop from a base confidence of 0.85 to 0.62, which shifts it into a lower LTV band and may trigger a mandatory manual review flag in the underwriting recommendation.

**False Positive Rate Target:** Below 5%, ensuring that the system does not unfairly penalise legitimate edge-case properties.

### 5.4 Confidence Calibrator — The Fusion Engine

The Confidence Engine is a structured fusion formula that aggregates signals from all three ML models into a single reliability score used directly in the LTV determination:

```
Confidence = Base(0.55)
           + Data_Bonus        (up to +0.12, rewarding completeness of optional inputs)
           + City_Bonus        (up to +0.08, for Tier-1 cities with denser training data)
           + Prime_Bonus       (up to +0.10, for sub-markets with a tight P10–P90 spread)
           − Fraud_Penalty     (−0.05 to −0.12 per triggered fraud rule)
           − Width_Penalty     (proportional to the P90−P10 spread as a percentage of P50)

Output Range: 0.30 to 0.92 continuous
```

A confidence score below 0.50 automatically triggers a mandatory manual review flag in the underwriting output. Conformal Prediction is applied to ensure that the P10–P90 band provides at least 80% statistical coverage — meaning the true market price falls within the declared band in at least 80% of validation cases.

### 5.5 Image Feature Extraction — EfficientNet-B0 CNN

When a property image is submitted (exterior or interior photograph), it passes through EfficientNet-B0 (loaded via the `timm` library, `src/image_feature_extractor.py`) to extract a 1,280-dimensional feature vector. This vector is dimensionality-reduced to a condition score and a visual anomaly signal, which then feed into the Feature Engineering layer as additional inputs to all three models.

The CNN component enables detection of visual fraud signals — borrower-staged photos that misrepresent interior quality, visible dilapidation on a property claiming "New" vintage, or mismatched construction quality vs the claimed sub-type. It also provides a measurable lift to confidence on properties where images are provided, because the additional modality reduces the uncertainty in the valuation bands.

---

## 6. Feature Engineering — 850-Feature Intelligence System

The 850-feature system is organised into six interpretable layers, each capturing a distinct dimension of collateral risk. The design principle underlying the entire system: location establishes base value, property attributes adjust intrinsic worth, market forces define the pricing envelope, liquidity signals determine exit certainty, legal attributes create risk haircuts, and derived interactions capture the non-linear combinations that none of the above can represent individually.

### Layer 1 — Location Intelligence (250 Features)

Location is the dominant price driver in Indian real estate, accounting for approximately 40% of property value. This layer generates 81 raw POI-density features computed at three radii (500m, 1km, 3km) for nine POI types — metro and rail stations, hospitals, schools and colleges, shopping malls, banks and ATMs, parks and green spaces, restaurants and food establishments, commercial office clusters, and bus and auto transit hubs. Additional signals include metro proximity in walking-time buckets (0–5 min, 5–10 min, 10–20 min, 20+ min), road quality index classifying the property as arterial road access vs internal lane vs slum-adjacent, nightlight intensity derived from satellite data as an economic activity proxy, slum proximity index, and a planned vs unplanned zone flag from municipal zoning records.

### Layer 2 — Property Characteristics (120 Features)

Physical attributes of the asset itself: property type encoding, sub-type encoding with hierarchical relationships, size normalisation and bucketing by local area norms, vintage category with age-depreciation curves, floor number and total floors ratio, a floor-to-lift availability interaction (top-floor premium only materialises when a reliable lift is confirmed), occupancy status encoding, parking slot count and normalised ratio, bedroom-bathroom ratio, and RERA registration flag.

### Layer 3 — Market Dynamics (150 Features)

Derived from public listing scraper outputs and city-level market data: supply-demand balance computed as listing density vs absorption rate per locality, local price momentum over one-month and three-month rolling windows, cap rate (annual NOI divided by market value, for rented properties), inventory turnover proxy derived from listing age distributions, and price-per-sqft deviation from the city-adjusted per-zone median with z-score normalisation.

### Layer 4 — Liquidity Signals (120 Features)

Exit-certainty features specific to the Liquidity Engine: buyer pool density for the sub-type in the locality, historical days-on-market by property configuration, asset fungibility score quantifying how interchangeable this property type is with alternatives in the micro-market, and demand elasticity proxy derived from the ratio of listing count to estimated inquiry rate.

### Layer 5 — Legal & Risk Signals (80 Features)

Binary and categorical signals from the input form combined with cross-feature consistency checks: legal title clear flag, encumbrance flag, litigation flag, freehold vs leasehold encoding, flood zone binary, CRZ zone binary, heritage zone binary, and derived flags that compare legal status claims against market data — for example, a freehold claim combined with an encumbrance flag triggers R02 in the fraud engine.

### Layer 6 — Derived Features & Interaction Terms (130 Features)

Non-linear combinations that capture relationships no individual feature can represent alone. The most predictively powerful interactions include Age × Location Premium (a 15-year-old building in Bandra carries its age very differently from a 15-year-old building in Vasai), Yield × Demand (rental income attractiveness in high-demand vs low-demand localities has opposite implications for collateral safety), Area × Liquidity (a 5,000 sqft commercial floor plate in an illiquid market is a very different risk from a 650 sqft apartment in a prime micro-market), and Floor × Lift Availability (top-floor value premium is real only when a lift is confirmed present and operational).

### Five Master Composite Scores

Each of these five scores summarises one entire feature layer into a single number that the ML models trust as a high-signal input:

| Score | Range | What It Summarises |
|---|---|---|
| Infrastructure Index | 0–100 | Weighted POI proximity across all nine types and three radii |
| Neighbourhood Score | 0–100 | Quality of surrounding environment including planned-zone premium |
| Market Heat Index | 0–100 | Supply-demand balance and price momentum combined |
| Liquidity Score | 0–100 | Composite resale ease from all four liquidity sub-signals |
| Risk Score | 0–100 | Consolidated legal, fraud, and regulatory risk |

---

## 7. Collateral Output Reference

### Core Underwriting Equation

```
Max Safe Loan  =  Distress Value  ×  Eligible LTV

Distress Value  =  Market Value (P10)  ×  (1 − Liquidity Discount)

Eligible LTV    =  Base LTV  ×  RPI Multiplier  ×  Ownership Factor  ×  Confidence Adjustment
```

### LTV Matrix — Direct Credit Policy Output

| Asset Type | RPI ≥ 80 | RPI 60–80 | RPI 40–60 | RPI < 40 |
|---|---|---|---|---|
| Residential — Freehold | **72.5%** | 65.0% | 58.0% | 54.0% |
| Residential — Leasehold | 65.0% | 58.0% | 50.0% | 45.0% |
| Commercial — Freehold | 60.0% | 54.0% | 48.0% | 42.0% |
| Industrial | 52.5% | 47.0% | 42.0% | 35.0% |

*These are maximum LTV ceilings. Borrower creditworthiness determines whether the ceiling is reached.*

### Liquidity Discount Table

| Asset Type | Discount Applied to P10 |
|---|---|
| Prime 2/3BHK Residential | 5%–24% |
| Mid-segment Apartment | 12%–33% |
| Commercial Shop / Office | 13%–40% |
| Industrial Warehouse | 20%–53% |

### Resale Potential Index Interpretation

| RPI Band | Liquidity Label | Typical TTL | LTV Implication |
|---|---|---|---|
| 80–100 | Highly Liquid — Prime asset | 0–30 days | Full base LTV applicable |
| 60–80 | Good Liquidity — Standard market | 31–90 days | 5% LTV reduction |
| 40–60 | Moderate — Selective buyer pool | 91–180 days | 12% LTV reduction |
| Below 40 | Illiquid — Niche or distressed asset | 180+ days | 18%+ LTV reduction |

### SARFAESI Calibration

The Time-to-Liquidate output is explicitly calibrated against the 120–195 day SARFAESI enforcement window. This means lenders can quantify enforcement risk at the point of origination — not after default has already occurred and the enforcement clock has started running.

### Cap Rate Integration

For rented properties, Collat.AI computes Cap Rate as Annual NOI divided by Market Value. A yield above the city-average signals strong investor demand and boosts the RPI. A yield above 12% triggers Fraud Rule R03 as statistically implausible for the declared micro-market.

---

## 8. API Reference

The FastAPI backend exposes a fully-documented REST API at `http://localhost:8000`, with interactive Swagger UI at `/docs` and an OpenAPI 3.1 schema at `/openapi.json`.

### Endpoints

| Method | Path | Description |
|---|---|---|
| `GET` | `/health` | Service health check — returns status and model load state |
| `POST` | `/valuate` | Full collateral intelligence — all three engines in one API call |
| `POST` | `/valuate/value` | Value engine only — P10/P50/P90 and distress value |
| `POST` | `/valuate/liquidity` | Liquidity engine only — RPI and time-to-liquidate |
| `POST` | `/valuate/fraud` | Fraud engine only — anomaly score and rule flag list |
| `GET` | `/docs` | Interactive Swagger API explorer |
| `GET` | `/openapi.json` | OpenAPI 3.1 machine-readable specification |

### Request Body — `/valuate` (POST)

```json
{
  "city": "Mumbai",
  "locality": "Bandra",
  "zone": "Western Suburbs",
  "latitude": 19.0596,
  "longitude": 72.8295,
  "property_type": "Apartment",
  "sub_type": "2BHK",
  "size_sqft": 700,
  "age_years": 8,
  "floor_number": 3,
  "total_floors": 12,
  "bedrooms": 2,
  "bathrooms": 2,
  "parking_slots": 1,
  "ownership": "Freehold",
  "occupancy": "Self-occupied",
  "legal_clear": 1,
  "circle_rate_per_sqft": 32000,
  "infrastructure_score": null,
  "amenities": {
    "swimming_pool": false,
    "rera_registered": true,
    "gym": true,
    "lift": true
  },
  "risk_flags": {
    "flood_zone": false,
    "crz_zone": false,
    "heritage_zone": false,
    "encumbrance": false,
    "litigation": false
  },
  "image": null
}
```

### Response Body

```json
{
  "grade": "A",
  "confidence": 0.94,
  "market_value": {
    "p10": 44200000,
    "p50": 50300000,
    "p90": 57700000,
    "currency": "INR"
  },
  "price_per_sqft": {
    "p10": 40200,
    "p50": 45682,
    "p90": 52400
  },
  "distress_value": {
    "estimate": 38200000,
    "range_max": 47700000,
    "liquidity_discount_applied": 0.24
  },
  "resale_potential_index": 96.8,
  "time_to_liquidate": {
    "bucket": "31-90",
    "min_days": 31,
    "max_days": 90,
    "label": "31–90 days",
    "exit_certainty": "Excellent Liquidity"
  },
  "max_safe_loan": 27700000,
  "eligible_ltv": 0.725,
  "fraud_assessment": {
    "severity": "Low",
    "anomaly_score": 0.12,
    "triggered_rules": [],
    "confidence_penalty": 0.0
  },
  "shap_drivers": [
    {
      "feature": "locality_premium_bandra",
      "impact_pct": 18.4,
      "direction": "positive",
      "label": "Prime Bandra micro-market commands significant premium"
    },
    {
      "feature": "infrastructure_score",
      "impact_pct": 12.1,
      "direction": "positive",
      "label": "High POI density — metro, hospitals, commercial within 1km"
    },
    {
      "feature": "age_years",
      "impact_pct": -6.3,
      "direction": "negative",
      "label": "8-year building — moderate depreciation applied"
    }
  ],
  "underwriting": {
    "recommendation": "APPROVE",
    "ltv_band": "RPI >= 80 — 72.5% maximum LTV",
    "notes": "Grade A collateral. Strong liquidity. Standard LTV ceiling applicable. No fraud flags."
  }
}
```

---

## 9. Multi-City Market Coverage

Collat.AI v3 covers eight major Indian metros with fully independent city-specific configurations — each city has its own circle rate calibration, POI density priors, per-city fraud threshold medians, and micro-market locality lists.

| City | Tier | Price Benchmark | YoY Growth | Coverage Detail |
|---|---|---|---|---|
| **Mumbai** | Tier 1 | ₹18.5k/sqft | +13.3% | All zones: Western Suburbs, Central, Harbour, Eastern |
| **Delhi NCR** | Tier 1 | ₹9.5k/sqft | +7.6% | Delhi + Gurgaon + Noida + Faridabad corridors |
| **Bangalore** | Tier 1 | ₹7.5k/sqft | +11.1% | IT corridors (Whitefield, HSR, Sarjapur) + residential |
| **Hyderabad** | Tier 2 | ₹6.2k/sqft | **+15.6%** | Fastest growing — HITEC City, Gachibowli, Financial District |
| **Pune** | Tier 2 | ₹6.8k/sqft | +14.8% | IT parks + residential suburbs (Hinjewadi, Baner, Kothrud) |
| **Chennai** | Tier 2 | ₹5.8k/sqft | +12.0% | OMR IT corridor + North and South residential zones |
| **Kolkata** | Tier 2 | ₹4.2k/sqft | +7.5% | North, South, East Kolkata + Salt Lake IT zone |
| **Ahmedabad** | Tier 2 | ₹4.8k/sqft | +4.9% | SG Highway + GIFT City corridor + residential |

---

## 10. Tech Stack

**Frontend:** React 18 with Vite 5 as the build tool. TailwindCSS for utility-first styling. Recharts for all data visualisations including line charts, bar charts, donut charts, and circular gauges. React Router with hash-based routing for the six-page SPA. Local browser storage for demo authentication and portfolio persistence.

**Backend:** FastAPI (Python 3.11+) as the REST API framework with Uvicorn as the ASGI server. Pydantic v2 for request and response schema validation. The inference pipeline in `src/inference_pipeline.py` orchestrates all three ML engines per API call and assembles the combined JSON response.

**Machine Learning:** XGBoost 2.0 for the value engine with quantile regression objectives at P10, P50, and P90. LightGBM 4.0 for the liquidity engine with ordinal regression on the four time-to-sell buckets. Scikit-learn Isolation Forest for the unsupervised anomaly detection component. SHAP for feature attribution and explainability across all three models. EfficientNet-B0 via the `timm` library for image feature extraction. All trained model artifacts are stored as `.joblib` files in the `models/` directory.

**Data & Enrichment:** OpenStreetMap via the Overpass API for POI density computation at three radii. Circle Rate APIs for Maharashtra, Karnataka, and Delhi price floor benchmarking. Custom web scrapers in `src/web_scraper.py` for MagicBricks, 99acres, and Housing.com listing data. Synthetic dataset generator in `src/dataset_generator.py` producing 200K+ records with city-stratified statistical priors.

**Production Infrastructure (Target):** PostgreSQL as the primary database. Redis for caching frequent city and zone queries. Docker for containerised microservice deployment. GitHub Actions for CI/CD pipeline. MLflow for model registry and versioning. Apache Airflow for scheduled retraining pipelines. AWS SageMaker for model retraining at scale. Prometheus for performance monitoring.

---

## 11. Project Structure

```
collat-ai-main/
│
├── package.json                       Root npm workspace definition
├── package-lock.json
├── run.sh                             macOS / Linux / Git Bash launcher
├── run-web.ps1                        Windows PowerShell launcher
├── demo.py                            Quick command-line inference demo
├── requirements-api.txt               Slim Python dependencies — inference only
├── requirements.txt                   Full dependencies including PyTorch and training
│
├── src/                               Python backend source
│   ├── api.py                         FastAPI application — all endpoints defined here
│   ├── schemas.py                     Pydantic v2 request and response models
│   ├── inference_pipeline.py          Orchestrates all three engines per API call
│   ├── config.py                      8-city config, feature registry, hyperparameters
│   ├── value_engine.py                XGBoost P10/P50/P90 valuation logic
│   ├── liquidity_engine.py            LightGBM RPI and TTL prediction
│   ├── fraud_engine.py                Isolation Forest plus 10 deterministic rules
│   ├── explainability.py              SHAP attribution and natural-language commentary
│   ├── preprocessor.py                Multi-city label encoding, scaling, imputation
│   ├── image_feature_extractor.py     EfficientNet-B0 CNN via timm
│   ├── dataset_generator.py           200K synthetic dataset generator
│   ├── web_scraper.py                 MagicBricks, 99acres, Housing.com scrapers
│   └── app.py                         Streamlit dashboard (alternative to React UI)
│
├── collat-ai-frontend/                React + Vite SPA
│   ├── src/
│   │   ├── pages/
│   │   │   ├── Home.jsx               Market overview dashboard with live KPIs
│   │   │   ├── Models.jsx             AI engine documentation page
│   │   │   ├── Portfolio.jsx          Authenticated analysis workspace
│   │   │   ├── Valuate.jsx            Market valuation engine interface
│   │   │   ├── Liquidity.jsx          Liquidity intelligence interface
│   │   │   ├── Fraud.jsx              Fraud risk assessment interface
│   │   │   └── Login.jsx              Authentication page
│   │   ├── components/                Reusable UI components
│   │   └── api/                       Frontend API client and TypeScript types
│   ├── package.json
│   └── vite.config.js
│
├── scripts/
│   ├── bootstrap-dev.mjs              npm start entry — full automated setup
│   └── start-api.mjs                  FastAPI launcher with venv detection
│
├── data/                              Generated datasets, scraper cache, image cache
├── models/                            Trained model artifacts (*.joblib)
└── logs/                              Training and API runtime logs
```

---

## 12. Phase Roadmap — Hackathon to Market Leader

A modular build strategy that generates revenue from Month 3 and reaches full national scale by Month 12.

### Phase 1 — Hackathon Week — Live Today

The following components are running in the current prototype submission:

Full Collat.AI v3 React frontend with all six pages operational. FastAPI backend with `/valuate`, `/valuate/value`, `/valuate/liquidity`, and `/valuate/fraud` endpoints live and documented. All six required target outputs from Problem Statement 4A responsive in under 30 seconds. XGBoost value engine with P10/P50/P90 quantile output. LightGBM liquidity engine with Resale Potential Index and TTL output. Isolation Forest plus 10-rule fraud engine with severity, flag list, and confidence penalty. SHAP explainability layer with named feature drivers and natural-language commentary. EfficientNet-B0 CNN image feature extraction pipeline. Multi-city coverage across all 8 metros with city-specific configurations. Pre-Analysis Market Intelligence panel with live price trend and liquidity charts populated before analysis runs. Portfolio system with local browser authentication for saving and downloading analyses. Complete JSON API output with full Pydantic v2 schema validation.

### Phase 2 — Months 1–3 (Pilot MVP)

Transition from synthetic training data to real market data and onboard the first paying NBFC clients. Specific deliverables: XGBoost and LightGBM models retrained on real listing data from the scraper modules. Circle Rate API integration for Maharashtra, Karnataka, and Delhi. PostgreSQL and Redis production infrastructure replacing in-memory state. 2–3 NBFC pilot partners onboarded under NDA with dedicated API keys and SLA agreements. 10,000 API calls per day capacity with rate limiting. MLflow model registry tracking all versions and experiments. Automated PDF valuation report generator in RBI-ready format. FastAPI production hardening with authentication middleware and request logging.

### Phase 3 — Months 4–6 (Full Product)

Scale to national coverage and integrate with NBFC loan origination systems. Deliverables: 100+ city coverage across all Indian states with state-specific circle rate feeds. Real-time Kafka listing feed integration with MagicBricks and 99acres. Kubernetes autoscaling deployment on AWS for variable API load. LOS/LMS integration kit for major NBFC platforms including Finflux, Nucleus, and Salesforce FSC. Isolation Forest Tier 2 retrained on actual confirmed fraud cases from pilot clients. Full compliance audit trail with every valuation cryptographically timestamped and stored. React Native mobile app for field agents submitting property images on-site. Apache Airflow scheduled retraining pipelines running weekly on new listing data.

### Phase 4 — Months 7–12 (Scale + New Verticals)

Expand beyond property collateral into adjacent lending verticals. Deliverables: Continuous learning pipeline with models retraining automatically as new market data arrives. Portfolio batch processing for 10,000 properties simultaneously for ARC and distressed asset buyers. Gold Loan Automation — extend the Collat.AI framework to gold jewellery collateral assessment. Kirana SME Cash-Flow Model — visual and geo intelligence for unbanked small business credit scoring. Healthcare Cost Benchmarking — medical equipment collateral valuation for NBFC healthcare verticals. Series A fundraise on demonstrated traction from Phase 3 clients. Target: 50+ NBFC clients, 1M+ API calls per day, three verticals live.

### Revenue Model

| Tier | Pricing | Target Customer |
|---|---|---|
| API Pay-as-you-go | ₹2–5 per call | Small NBFCs, Fintech startups |
| SaaS Subscription | ₹25,000–₹2,00,000 per month | Mid-size NBFCs |
| Enterprise License | ₹50 Lakh–₹2 Crore per year | Large HFCs and commercial banks |
| White-label | Custom | Banks building internal valuation tools |
| Portfolio Batch | ₹0.50 per property | ARC firms and distressed asset buyers |

Break-even is reached at three active NBFC SaaS subscriptions.

### Scaling Milestones

| Milestone | Target |
|---|---|
| Month 3 | 10,000 API calls/day · MAPE <15% · 2 pilot NBFCs · <2 second response |
| Month 6 | 100,000 API calls/day · MAPE <12% · 10 NBFC clients · 100+ cities |
| Month 12 | 1M+ API calls/day · 3 verticals live · Series A · 50+ NBFC clients |

---

## 13. Evaluation Criteria Mapping

**Valuation Logic — 25%**

XGBoost Quantile Regression produces calibrated P10/P50/P90 bands where each band has a distinct and documented underwriting interpretation. The distress value is computed as P10 × (1 − Liquidity Discount) using asset-class-specific discount tables. Output is explicitly a range — not a point estimate — as required. Circle rate benchmarking is integrated as a feature input and used as a cross-validation signal through the Width Penalty in the Confidence Calibrator.

**Liquidity Modeling — 25%**

A fully independent LightGBM Ordinal Regression engine trained on time-to-sell data produces the Resale Potential Index and Time-to-Liquidate as first-class outputs — not derived from the price model. The TTL output is calibrated against the SARFAESI enforcement window, demonstrating understanding of the legal enforcement timeline that determines actual exit risk for NBFCs. The LTV matrix applies RPI band-specific multipliers that directly reduce eligible loan amounts for low-liquidity collateral.

**Feature Depth — 20%**

850 features across six named and documented layers, with 81 POI-density features at three radii, five composite master scores, and 130 non-linear interaction terms. The EfficientNet-B0 CNN adds an optional image modality. The system goes well beyond what a basic regression model would use — it captures micro-market dynamics, legal risk, usage signals, and non-linear cross-feature relationships that are essential for accurate Indian real estate valuation.

**Practical Deployability — 15%**

Single-command `npm start` launches the complete stack. Interactive Swagger documentation at `/docs`. Pydantic v2 schema validation on all API inputs. React SPA designed explicitly for NBFC loan officer workflows with no data science background required. Authentication and portfolio system for multi-user NBFC deployment. PDF report export for credit committee presentations.

**Explainability — 15%**

SHAP feature attribution on every valuation with magnitude, direction, and natural-language commentary. The Confidence Calibrator formula is fully transparent — every additive and subtractive component is visible in the response and surfaced in the UI. The fraud engine shows each triggered rule individually with its specific reason. The underwriting tab shows the complete LTV computation with every formula component rendered.

---

## 14. Team — The Triads

**Institution:** Sardar Patel Institute of Technology (SPIT), Andheri West, Mumbai — 400058

**Hackathon:** TenzorX 2026 National AI Hackathon
**Problem Statement:** 4A — AI-Powered Collateral Valuation & Resale Liquidity Engine
**Submission Portal:** [unstop.com/competitions/1651867/submission/1426388](https://unstop.com/competitions/1651867/submission/1426388)

---

### Bhavik Desai — ML Engineering & Backend

**Email:** bhavik.desai23@spit.ac.in

Bhavik is the machine learning and backend architect of Collat.AI. He designed and implemented the complete ML pipeline — XGBoost quantile value engine, LightGBM ordinal liquidity engine, Isolation Forest fraud detection with the 10-rule deterministic overlay, SHAP explainability integration, and EfficientNet-B0 image feature extraction via `timm`. He built the FastAPI backend from the ground up, including all inference endpoints, the Pydantic v2 request and response schemas, the Confidence Calibrator formula, and the `src/inference_pipeline.py` orchestration layer that sequences all three engines per API call. He also designed and generated the 200K+ synthetic training dataset with city-stratified priors and implemented the web scraper modules for listing data collection.

---

### Krish Shah — Frontend Engineering & Product

**Email:** krish.shah23@spit.ac.in

Krish designed and built the complete Collat.AI React frontend, including all six application pages (Home, Models, Portfolio, Valuation, Liquidity, Fraud), the real-time Pre-Analysis Market Intelligence panel with live Recharts visualisations, the authentication and portfolio management system,and underwriting output tab, and the overall UX design system. He managed product direction — defining the loan officer user journey, the page flows across the three engine interfaces, and the visual design language of the platform.

---

### Akshat Singh — Data Engineering & Feature Architecture

**Email:** Akshat.singh23@spit.ac.in

Akshat designed the 850-feature hierarchical intelligence system, specifying and implementing all six feature layers including the 81 POI-density features at three radii, the five composite master scores (Infrastructure Index, Neighbourhood Score, Market Heat Index, Liquidity Score, Risk Score), and the 130 non-linear interaction terms. He built the OpenStreetMap POI enrichment pipeline using the Overpass API, the circle rate data integration layer for Maharashtra/Karnataka/Delhi, the per-city fraud threshold calibration system, and the complete multi-city feature preprocessing pipeline with label encoding, scaling, and imputation in `src/preprocessor.py`.

---

<div align="center">

---

*© 2026 Collat.AI · Team The Triads · SPIT Mumbai · All rights reserved.*

*Built for India's ₹87 Lakh Crore lending ecosystem.*

[![GitHub](https://img.shields.io/badge/GitHub-Krish--2114%2Fcollat--ai-181717?style=flat-square&logo=github)](https://github.com/Krish-2114/collat-ai)
&nbsp;&nbsp;
[![Frontend](https://img.shields.io/badge/Frontend-localhost%3A5173-646CFF?style=flat-square&logo=vite)](http://localhost:5173)
&nbsp;&nbsp;
[![API Docs](https://img.shields.io/badge/API%20Docs-localhost%3A8000%2Fdocs-009688?style=flat-square&logo=fastapi)](http://localhost:8000/docs)

</div>
# AI Bias Detection and Fairness Correction System

A professional-grade platform for auditing machine learning models for bias and applying fairness corrections.

## Features

- **Bias Detection**: Analyzes 5 key metrics (Demographic Parity, Equalized Odds, Disparate Impact, etc.).
- **Bias Mitigation**: Support for pre-processing, in-processing (Exponentiated Gradient), and post-processing (Threshold Optimization) techniques.
- **AI Insights**: Integration with Google Gemini for natural language explanations of bias and mitigation strategies.
- **PDF Reporting**: Automated generation of fairness audit reports.
- **Modern UI**: Dark-themed glassmorphism dashboard built with Next.js 14.

## Tech Stack

- **Backend**: FastAPI, scikit-learn, Fairlearn, pandas, google-generativeai, fpdf2.
- **Frontend**: Next.js 14, React 18, Tailwind CSS, Axios, Framer Motion.

## Setup Instructions

### Backend

1. Navigate to the `backend` directory.
2. Create a virtual environment: `python -m venv venv`.
3. Activate the virtual environment.
4. Install dependencies: `pip install -r requirements.txt`.
5. Set your `GOOGLE_API_KEY` in the `.env` file.
6. Run the server: `python main.py`.

### Frontend

1. Navigate to the `frontend` directory.
2. Install dependencies: `npm install`.
3. Set `NEXT_PUBLIC_API_URL` in `.env.local` (default is http://localhost:10000).
4. Run the development server: `npm run dev`.

## Project Structure

```text
bias-detection-tool/
├── frontend/          # Next.js Application
│   ├── components/    # UI Components
│   ├── pages/         # Page Routes
│   └── utils/         # API & Helpers
└── backend/           # FastAPI Application
    ├── api/           # API Routes
    ├── bias/          # Fairness Logic
    ├── data/          # Data Loading & Preprocessing
    ├── gemini/        # Gemini Integration
    ├── model/         # Training & Evaluation
    └── report/        # PDF Generation
```

## Demo Data

The system is optimized for the **COMPAS** dataset. You can load it directly via the UI or upload your own CSV.
- **Target**: `two_year_recid`
- **Protected Attribute**: `race` or `sex`

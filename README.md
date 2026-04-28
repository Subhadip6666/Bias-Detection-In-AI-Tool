# ⚖️ BiasFix AI | Ethical AI Governance Platform

![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg)
![Python 3.10+](https://img.shields.io/badge/python-3.10+-blue.svg)
![Next.js 14](https://img.shields.io/badge/Next.js-14-black.svg)
![FastAPI](https://img.shields.io/badge/FastAPI-0.111.0-009688.svg)

A professional-grade platform for auditing machine learning models for bias, applying fairness corrections, and generating actionable ethical AI insights.

## 🌟 Key Features

- **Advanced Bias Detection**: Analyzes 5 key fairness metrics simultaneously:
  - Demographic Parity
  - Equalized Odds
  - Disparate Impact
  - Equal Opportunity
  - Predictive Parity
- **Automated Bias Mitigation**: Built-in support for pre-processing, in-processing (Exponentiated Gradient), and post-processing (Threshold Optimization) techniques to actively fix biased models.
- **Fairness-Accuracy Tradeoff Analysis**: Dynamic "Before vs. After" comparison dashboard that calculates exactly how much predictive utility is sacrificed to achieve mathematical fairness.
- **AI-Powered Insights**: Deep integration with Google's Gemini models to provide natural language, human-readable explanations of complex bias metrics and mitigation strategies.
- **Enterprise Reporting**: Automated generation of comprehensive, exportable PDF fairness audit reports for compliance and stakeholders.
- **Premium Interface**: A modern, dark-themed glassmorphism dashboard built with Next.js 14 for an exceptional user experience.

## 🛠️ Tech Stack

- **Backend**: Python, FastAPI, scikit-learn, Fairlearn, pandas, google-generativeai, fpdf2
- **Frontend**: Next.js 14, React 18, Tailwind CSS, Recharts, Framer Motion, Axios

## 🚀 Getting Started

### Backend Setup

1. Navigate to the `backend` directory:
   ```bash
   cd backend
   ```
2. Create and activate a virtual environment:
   ```bash
   python -m venv venv
   # Windows: venv\Scripts\activate
   # Linux/Mac: source venv/bin/activate
   ```
3. Install dependencies:
   ```bash
   pip install -r requirements.txt
   ```
4. Set your Google Gemini API key:
   Create a `.env` file in the `backend` directory and add:
   ```env
   GOOGLE_API_KEY=your_api_key_here
   ```
5. Run the server:
   ```bash
   python main.py
   ```
   *The API will run on `http://localhost:10000`*

### Frontend Setup

1. Navigate to the `frontend` directory:
   ```bash
   cd frontend
   ```
2. Install dependencies:
   ```bash
   npm install
   ```
3. Configure environment variables:
   Create a `.env.local` file (optional, defaults to localhost):
   ```env
   NEXT_PUBLIC_API_URL=http://localhost:10000
   ```
4. Run the development server:
   ```bash
   npm run dev
   ```
   *The UI will be accessible at `http://localhost:3000`*

## 📁 Project Structure

```text
Bias-Detection-In-AI-Tool/
├── frontend/          # Next.js Application & React Components
│   ├── components/    # Reusable UI elements (Charts, Uploaders)
│   ├── pages/         # Application routes (Dashboard, Compare, Report)
│   └── styles/        # Global CSS and Tailwind configurations
└── backend/           # FastAPI Application & ML Engine
    ├── bias/          # Core fairness detection & mitigation logic (Fairlearn)
    ├── data/          # Dataset loading & preprocessing pipelines
    ├── gemini/        # Google Gemini AI integration
    ├── model/         # Model training & evaluation (scikit-learn)
    └── report/        # Automated PDF generation
```

## 📊 Demo Data

The system includes a pre-configured sample of the **COMPAS** dataset to test the workflow immediately. You can load it directly via the UI or upload your own CSV.
- **Target Variable**: `two_year_recid`
- **Protected Attributes**: `race` or `sex`

## 🤝 Contributing
Contributions are welcome! Please feel free to submit a Pull Request.

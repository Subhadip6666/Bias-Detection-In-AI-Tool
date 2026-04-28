from fpdf import FPDF
import datetime
import os

class ReportGenerator:
    def __init__(self, output_dir: str):
        self.output_dir = output_dir
        if not os.path.exists(output_dir):
            os.makedirs(output_dir)

    def create_pdf(self, model_info: dict, bias_info: dict, gemini_text: str, chart_paths: list = None) -> str:
        pdf = FPDF()
        pdf.add_page()
        
        # Header
        pdf.set_font("Arial", "B", 16)
        pdf.cell(0, 10, "AI Bias Analysis & Fairness Report", 0, 1, "C")
        pdf.set_font("Arial", "", 10)
        pdf.cell(0, 10, f"Generated on: {datetime.datetime.now().strftime('%Y-%m-%d %H:%M')}", 0, 1, "R")
        pdf.ln(10)

        # Executive Summary
        pdf.set_font("Arial", "B", 14)
        pdf.cell(0, 10, "1. Executive Summary", 0, 1)
        pdf.set_font("Arial", "", 11)
        accuracy = model_info.get('accuracy', 0)
        summary = f"This report provides a detailed analysis of bias detected in the model trained on the provided dataset. Accuracy: {accuracy:.2%}"
        pdf.multi_cell(0, 10, summary)
        pdf.ln(5)

        # Metrics Table
        pdf.set_font("Arial", "B", 14)
        pdf.cell(0, 10, "2. Fairness Metrics", 0, 1)
        pdf.set_font("Arial", "B", 10)
        pdf.cell(60, 10, "Metric", 1)
        pdf.cell(60, 10, "Value", 1)
        pdf.cell(60, 10, "Status", 1)
        pdf.ln()
        
        pdf.set_font("Arial", "", 10)
        for metric, value in bias_info.items():
            try:
                val_float = float(value)
            except (ValueError, TypeError):
                val_float = 0.0
            
            status = "FAIL" if "diff" in metric and val_float > 0.1 else "PASS"
            if metric == "disparate_impact_ratio":
                status = "FAIL" if val_float < 0.8 else "PASS"
            
            pdf.cell(60, 10, metric.replace("_", " ").title(), 1)
            pdf.cell(60, 10, f"{val_float:.4f}", 1)
            pdf.cell(60, 10, status, 1)
            pdf.ln()
        
        pdf.ln(10)

        # Charts Section
        if chart_paths:
            pdf.set_font("Arial", "B", 14)
            pdf.cell(0, 10, "3. Visual Analysis", 0, 1)
            for path in chart_paths:
                if os.path.exists(path):
                    pdf.image(path, w=170)
                    pdf.ln(5)
        
        # Gemini Insights — sanitize text to avoid encoding crashes
        pdf.add_page()
        pdf.set_font("Arial", "B", 14)
        pdf.cell(0, 10, "4. AI-Generated Insights & Recommendations", 0, 1)
        pdf.set_font("Arial", "", 11)
        # Encode to latin-1 safely, replacing unsupported characters
        safe_text = gemini_text.encode('latin-1', errors='replace').decode('latin-1')
        pdf.multi_cell(0, 10, safe_text)

        report_name = f"report_{datetime.datetime.now().strftime('%Y%m%d_%H%M%S')}.pdf"
        report_path = os.path.join(self.output_dir, report_name)
        pdf.output(report_path)
        
        return report_path

import google.generativeai as genai
import os
from dotenv import load_dotenv
from typing import Optional

load_dotenv()

class GeminiClient:
    def __init__(self):
        api_key = os.getenv("GOOGLE_API_KEY")
        if not api_key:
            print("Warning: GOOGLE_API_KEY not found in environment variables.")
        genai.configure(api_key=api_key)
        # Updated model list — use current Gemini model names
        self.models = ["gemini-2.0-flash", "gemini-2.0-flash-lite", "gemini-1.5-flash"]

    def generate_explanation(self, prompt: str) -> str:
        for model_name in self.models:
            try:
                model = genai.GenerativeModel(model_name)
                response = model.generate_content(prompt)
                return response.text
            except Exception as e:
                print(f"Error with model {model_name}: {e}")
                continue
        # If all models fail, return a useful fallback instead of crashing
        return (
            "AI-generated explanation is currently unavailable. "
            "The bias metrics above can be interpreted as follows: "
            "values closer to 0 for difference metrics indicate fairness, "
            "while a disparate impact ratio closer to 1.0 indicates equal treatment across groups."
        )

    def get_bias_explanation(self, metrics: dict, protected_attr: str) -> str:
        prompt = f"""
        Analyze the following AI bias metrics for the protected attribute '{protected_attr}':
        {metrics}
        
        Provide a professional explanation of what these metrics indicate regarding fairness. 
        Identify which metrics show significant bias and explain the potential real-world impact.
        Keep it concise but informative.
        """
        return self.generate_explanation(prompt)

    def get_mitigation_recommendation(self, bias_type: str) -> str:
        prompt = f"""
        A machine learning model shows significant bias in terms of '{bias_type}'.
        Recommend the most suitable mitigation technique (e.g., Reweighting, Exponentiated Gradient, Threshold Optimization) 
        and explain why it would be effective in this context.
        """
        return self.generate_explanation(prompt)

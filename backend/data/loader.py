import pandas as pd
import os
from typing import Optional, List, Tuple
from fastapi import HTTPException

class DataLoader:
    @staticmethod
    def load_csv(file_path: str) -> pd.DataFrame:
        if not os.path.exists(file_path):
            raise HTTPException(status_code=404, detail=f"File not found: {file_path}")
        try:
            return pd.read_csv(file_path)
        except Exception as e:
            raise HTTPException(status_code=400, detail=f"Error reading CSV: {str(e)}")

    @staticmethod
    def load_compas() -> pd.DataFrame:
        local_path = "data/samples/compas.csv"
        
        if os.path.exists(local_path):
            return pd.read_csv(local_path)
            
        # Standard COMPAS dataset URL from ProPublica
        url = "https://raw.githubusercontent.com/propublica/compas-analysis/master/compas-scores-two-years.csv"
        try:
            df = pd.read_csv(url)
            # Basic preprocessing for COMPAS as per standard fairness tutorials
            cols_to_keep = ['age', 'c_charge_degree', 'race', 'age_cat', 'score_text', 
                            'sex', 'priors_count', 'days_b_screening_arrest', 'decile_score', 
                            'is_recid', 'two_year_recid']
            df = df[cols_to_keep]
            # Filter as per ProPublica analysis
            df = df[(df['days_b_screening_arrest'] <= 30) & 
                    (df['days_b_screening_arrest'] >= -30) & 
                    (df['is_recid'] != -1) & 
                    (df['c_charge_degree'] != 'O') & 
                    (df['score_text'] != 'N/A')]
            return df
        except Exception as e:
            print(f"Failed to load COMPAS from URL: {e}")
            raise HTTPException(status_code=500, detail="Failed to load COMPAS dataset")

    @staticmethod
    def detect_protected_attributes(df: pd.DataFrame) -> List[str]:
        # Common protected attributes
        common_protected = ['race', 'sex', 'age', 'gender', 'ethnicity', 'religion']
        detected = [col for col in df.columns if col.lower() in common_protected]
        return detected

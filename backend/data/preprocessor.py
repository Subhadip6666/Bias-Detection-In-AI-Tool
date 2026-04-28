import pandas as pd
from sklearn.preprocessing import LabelEncoder, StandardScaler
from sklearn.model_selection import train_test_split
from typing import Tuple, List

class DataPreprocessor:
    def __init__(self):
        self.label_encoders = {}
        self.scaler = StandardScaler()
        self.feature_cols = []
        self.target_col = ""

    def preprocess(self, df: pd.DataFrame, target_col: str, protected_cols: List[str]) -> Tuple[pd.DataFrame, pd.Series]:
        df = df.copy()
        self.target_col = target_col
        
        # Handle missing values
        df = df.dropna()

        # Encode categorical variables
        categorical_cols = df.select_dtypes(include=['object']).columns
        for col in categorical_cols:
            if col not in self.label_encoders:
                self.label_encoders[col] = LabelEncoder()
                df[col] = self.label_encoders[col].fit_transform(df[col])
            else:
                df[col] = self.label_encoders[col].transform(df[col])

        X = df.drop(columns=[target_col])
        y = df[target_col]
        
        self.feature_cols = X.columns.tolist()
        
        # Scale numerical features
        X_scaled = pd.DataFrame(self.scaler.fit_transform(X), columns=X.columns, index=X.index)
        
        return X_scaled, y

    def get_split(self, X: pd.DataFrame, y: pd.Series, test_size=0.2):
        return train_test_split(X, y, test_size=test_size, random_state=42)

from sklearn.linear_model import LogisticRegression
from sklearn.ensemble import RandomForestClassifier
from sklearn.metrics import accuracy_score, confusion_matrix
import joblib
import os

class ModelTrainer:
    @staticmethod
    def train(model_type: str, X_train, y_train):
        if model_type == "logistic_regression":
            model = LogisticRegression(max_iter=1000)
        elif model_type == "random_forest":
            model = RandomForestClassifier(n_estimators=100)
        else:
            raise ValueError(f"Unknown model type: {model_type}")
        
        model.fit(X_train, y_train)
        return model

    @staticmethod
    def evaluate(model, X_test, y_test):
        y_pred = model.predict(X_test)
        acc = accuracy_score(y_test, y_pred)
        cm = confusion_matrix(y_test, y_pred)
        return {
            "accuracy": float(acc),
            "confusion_matrix": cm.tolist(),
            "y_pred": y_pred.tolist()
        }

    @staticmethod
    def save_model(model, path):
        import joblib
        joblib.dump(model, path)

    @staticmethod
    def load_model(path):
        import joblib
        return joblib.load(path)

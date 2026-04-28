from fastapi import FastAPI, UploadFile, File, Form, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
import uvicorn
import os
import shutil
import uuid
import pandas as pd
import json
import traceback

from data.loader import DataLoader
from data.preprocessor import DataPreprocessor
from model.train import ModelTrainer
from bias.detect import BiasDetector
from bias.fix import BiasMitigator
from gemini.client import GeminiClient
from report.generator import ReportGenerator

app = FastAPI(title="AI Bias Detection API", version="1.0.0")

# CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"],
)

# Storage
STORAGE_DIR = "storage"
UPLOAD_DIR = os.path.join(STORAGE_DIR, "uploads")
MODEL_DIR = os.path.join(STORAGE_DIR, "models")
REPORT_DIR = os.path.join(STORAGE_DIR, "reports")

for d in [UPLOAD_DIR, MODEL_DIR, REPORT_DIR]:
    os.makedirs(d, exist_ok=True)

# Mount reports for download
app.mount("/download", StaticFiles(directory=REPORT_DIR), name="reports")

# State (In-memory for simplicity in this demo, use DB for production)
datasets = {}
models = {}

@app.get("/health")
def health_check():
    return {"status": "healthy", "version": "1.0.0"}

@app.post("/load_demo")
async def load_demo_dataset():
    file_id = str(uuid.uuid4())
    try:
        df = DataLoader.load_compas()
    except Exception as e:
        traceback.print_exc()
        raise HTTPException(status_code=500, detail=str(e))
    
    file_path = os.path.join(UPLOAD_DIR, f"{file_id}_compas.csv")
    df.to_csv(file_path, index=False)
    
    datasets[file_id] = {
        "path": file_path,
        "name": "compas.csv",
        "columns": df.columns.tolist(),
        "preview": df.head(10).to_dict(orient="records")
    }
    
    return {"dataset_id": file_id, "columns": df.columns.tolist(), "preview": datasets[file_id]["preview"]}

@app.post("/upload")
async def upload_dataset(file: UploadFile = File(...)):
    file_id = str(uuid.uuid4())
    file_path = os.path.join(UPLOAD_DIR, f"{file_id}_{file.filename}")
    
    with open(file_path, "wb") as buffer:
        shutil.copyfileobj(file.file, buffer)
    
    df = pd.read_csv(file_path)
    datasets[file_id] = {
        "path": file_path,
        "name": file.filename,
        "columns": df.columns.tolist(),
        "preview": df.head(10).to_dict(orient="records")
    }
    
    return {"dataset_id": file_id, "columns": df.columns.tolist(), "preview": datasets[file_id]["preview"]}

@app.post("/train")
async def train_model(dataset_id: str = Form(...), model_type: str = Form(...), target_col: str = Form(...)):
    if dataset_id not in datasets:
        raise HTTPException(status_code=404, detail="Dataset not found")
    
    dataset = datasets[dataset_id]
    df = pd.read_csv(dataset["path"])
    
    preprocessor = DataPreprocessor()
    X, y = preprocessor.preprocess(df, target_col, [])
    X_train, X_test, y_train, y_test = preprocessor.get_split(X, y)
    
    trainer = ModelTrainer()
    model = trainer.train(model_type, X_train, y_train)
    
    model_id = str(uuid.uuid4())
    model_path = os.path.join(MODEL_DIR, f"{model_id}.joblib")
    trainer.save_model(model, model_path)
    
    eval_results = trainer.evaluate(model, X_test, y_test)
    
    models[model_id] = {
        "path": model_path,
        "type": model_type,
        "dataset_id": dataset_id,
        "target_col": target_col,
        "accuracy": eval_results["accuracy"]
    }
    
    return {
        "model_id": model_id,
        "accuracy": eval_results["accuracy"],
        "confusion_matrix": eval_results["confusion_matrix"]
    }

@app.post("/analyze")
async def analyze_bias(dataset_id: str = Form(...), model_id: str = Form(...), protected_attr: str = Form(...)):
    if dataset_id not in datasets or model_id not in models:
        raise HTTPException(status_code=404, detail="Dataset or model not found")
    
    try:
        dataset = datasets[dataset_id]
        model_info = models[model_id]
        
        df = pd.read_csv(dataset["path"])
        
        # Save the raw protected attribute values BEFORE encoding
        raw_protected = df[protected_attr].copy()
        
        preprocessor = DataPreprocessor()
        X, y = preprocessor.preprocess(df, model_info["target_col"], [])
        _, X_test, _, y_test = preprocessor.get_split(X, y)
        
        trainer = ModelTrainer()
        model = trainer.load_model(model_info["path"])
        y_pred = model.predict(X_test)
        
        # Use the RAW (un-encoded) protected attribute, aligned to the test set indices
        sensitive_features = raw_protected.loc[X_test.index].values
        
        detector = BiasDetector()
        metrics, flags = detector.calculate_metrics(y_test, y_pred, sensitive_features)
        
        # Gemini explanation (non-blocking — if it fails, we still return metrics)
        try:
            gemini = GeminiClient()
            explanation = gemini.get_bias_explanation(metrics, protected_attr)
        except Exception as gem_err:
            print(f"Gemini explanation failed: {gem_err}")
            explanation = "AI explanation unavailable. Please review the metrics above."
        
        return {
            "metrics": metrics,
            "flags": flags,
            "accuracy": float(model_info["accuracy"]),
            "explanation": explanation
        }
    except Exception as e:
        traceback.print_exc()
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/report")
async def generate_report(model_id: str = Form(...), metrics_json: str = Form(...), explanation: str = Form(...)):
    if model_id not in models:
        raise HTTPException(status_code=404, detail="Model not found")
    
    try:
        model_info = models[model_id]
        metrics = json.loads(metrics_json)
        
        generator = ReportGenerator(REPORT_DIR)
        report_path = generator.create_pdf(model_info, metrics, explanation)
        
        return {"report_url": f"/download/{os.path.basename(report_path)}"}
    except Exception as e:
        traceback.print_exc()
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/fix_bias")
async def fix_bias(dataset_id: str = Form(...), model_id: str = Form(...), protected_attr: str = Form(...)):
    if dataset_id not in datasets or model_id not in models:
        raise HTTPException(status_code=404, detail="Dataset or model not found")
    try:
        dataset = datasets[dataset_id]
        model_info = models[model_id]
        df = pd.read_csv(dataset["path"])
        raw_protected = df[protected_attr].copy()

        preprocessor = DataPreprocessor()
        X, y = preprocessor.preprocess(df, model_info["target_col"], [])
        _, X_test, _, y_test = preprocessor.get_split(X, y)

        trainer = ModelTrainer()
        model = trainer.load_model(model_info["path"])
        y_pred = model.predict(X_test)
        sensitive_features = raw_protected.loc[X_test.index].values

        mitigator = BiasMitigator()
        y_pred_fixed = mitigator.apply_equalized_odds(y_test, y_pred, sensitive_features)

        detector = BiasDetector()
        metrics_after, flags_after = detector.calculate_metrics(y_test, y_pred_fixed, sensitive_features)

        from sklearn.metrics import accuracy_score
        accuracy_after = float(accuracy_score(y_test, y_pred_fixed))

        return {
            "metrics_after": metrics_after, 
            "flags_after": flags_after,
            "accuracy_before": float(model_info["accuracy"]),
            "accuracy_after": accuracy_after
        }
    except Exception as e:
        traceback.print_exc()
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/feature_importance/{model_id}")
async def feature_importance(model_id: str):
    if model_id not in models:
        raise HTTPException(status_code=404, detail="Model not found")
    try:
        trainer = ModelTrainer()
        model = trainer.load_model(models[model_id]["path"])
        if hasattr(model, 'coef_'):
            coefficients = model.coef_[0].tolist() if len(model.coef_.shape) > 1 else model.coef_.tolist()
        elif hasattr(model, 'feature_importances_'):
            coefficients = model.feature_importances_.tolist()
        else:
            raise HTTPException(status_code=400, detail="Model does not have feature importance")

        dataset = datasets.get(models[model_id]["dataset_id"])
        if dataset:
            df = pd.read_csv(dataset["path"])
            preprocessor = DataPreprocessor()
            X, _ = preprocessor.preprocess(df, models[model_id]["target_col"], [])
            features = X.columns.tolist()
        else:
            features = [f"feature_{i}" for i in range(len(coefficients))]

        return {"features": features[:len(coefficients)], "coefficients": coefficients}
    except HTTPException:
        raise
    except Exception as e:
        traceback.print_exc()
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/dataset_rows/{dataset_id}")
async def dataset_rows(dataset_id: str, race: str = "All", pred: str = "All", actual: str = "All"):
    if dataset_id not in datasets:
        raise HTTPException(status_code=404, detail="Dataset not found")
    try:
        df = pd.read_csv(datasets[dataset_id]["path"])
        if race != "All" and "race" in df.columns:
            df = df[df["race"] == race]
        rows = df.head(100).to_dict(orient="records")
        return {"rows": rows, "total": len(df)}
    except Exception as e:
        traceback.print_exc()
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/predict")
async def predict_single(data: dict):
    model_id = data.get("model_id")
    features = data.get("features", {})
    if not model_id or model_id not in models:
        raise HTTPException(status_code=404, detail="Model not found")
    try:
        trainer = ModelTrainer()
        model = trainer.load_model(models[model_id]["path"])

        dataset = datasets.get(models[model_id]["dataset_id"])
        df = pd.read_csv(dataset["path"])
        preprocessor = DataPreprocessor()
        X, _ = preprocessor.preprocess(df, models[model_id]["target_col"], [])
        cols = X.columns.tolist()

        row = {c: 0 for c in cols}
        for k, v in features.items():
            if k in row:
                row[k] = v
        import numpy as np
        input_df = pd.DataFrame([row])
        pred = int(model.predict(input_df)[0])
        prob = None
        if hasattr(model, 'predict_proba'):
            prob = float(model.predict_proba(input_df)[0][1])
        return {"prediction": pred, "probability": prob}
    except Exception as e:
        traceback.print_exc()
        raise HTTPException(status_code=500, detail=str(e))

if __name__ == "__main__":
    port = int(os.environ.get("PORT", 10000))
    uvicorn.run(app, host="0.0.0.0", port=port)

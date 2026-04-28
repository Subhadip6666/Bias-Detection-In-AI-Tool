import pandas as pd
import numpy as np
from functools import partial
from fairlearn.metrics import (
    demographic_parity_difference,
    equalized_odds_difference,
    demographic_parity_ratio,
    MetricFrame
)
from sklearn.metrics import recall_score, precision_score

class BiasDetector:
    @staticmethod
    def calculate_metrics(y_true, y_pred, sensitive_features):
        """
        Calculate 5 key fairness metrics.
        Returns (metrics_dict, flags_dict) with all values as native Python types.
        """
        # Ensure labels are integers (0/1) to satisfy Fairlearn's pos_label requirement
        y_true = np.array(y_true).astype(int)
        y_pred = np.array(y_pred).astype(int)
        # Reset index on sensitive_features to align with numpy arrays
        sensitive_features = np.array(sensitive_features)
        
        # --- Demographic Parity ---
        dp_diff = demographic_parity_difference(y_true, y_pred, sensitive_features=sensitive_features)
        dp_ratio = demographic_parity_ratio(y_true, y_pred, sensitive_features=sensitive_features)
        
        # --- Equalized Odds Difference ---
        try:
            eo_diff = equalized_odds_difference(y_true, y_pred, sensitive_features=sensitive_features)
        except ValueError:
            # Fallback: if a subgroup has only one class, equalized_odds can fail
            eo_diff = 0.0
        
        # --- Disparate Impact ---
        disparate_impact = dp_ratio
        
        # --- Equal Opportunity & Predictive Parity via MetricFrame ---
        # Use partial to pass zero_division=0, preventing UndefinedMetricWarning crashes
        # Detect multiclass targets and set average accordingly
        n_classes = len(np.unique(np.concatenate([y_true, y_pred])))
        avg = 'binary' if n_classes <= 2 else 'weighted'
        safe_recall = partial(recall_score, zero_division=0, average=avg)
        safe_precision = partial(precision_score, zero_division=0, average=avg)
        
        mf = MetricFrame(
            metrics={"recall": safe_recall, "precision": safe_precision},
            y_true=y_true,
            y_pred=y_pred,
            sensitive_features=sensitive_features
        )
        
        equal_opportunity_diff = mf.difference(method='between_groups')['recall']
        predictive_parity_diff = mf.difference(method='between_groups')['precision']

        # Build results — cast every value to native Python float/bool
        # Use np.nan_to_num to handle any division by zero in ratios
        metrics = {
            "demographic_parity_diff": float(np.nan_to_num(dp_diff)),
            "equalized_odds_diff": float(np.nan_to_num(eo_diff)),
            "disparate_impact_ratio": float(np.nan_to_num(disparate_impact)),
            "equal_opportunity_diff": float(np.nan_to_num(equal_opportunity_diff)),
            "predictive_parity_diff": float(np.nan_to_num(predictive_parity_diff))
        }
        
        flags = {
            "demographic_parity": bool(dp_diff > 0.1),
            "equalized_odds": bool(eo_diff > 0.1),
            "disparate_impact": bool(disparate_impact < 0.8),
            "equal_opportunity": bool(equal_opportunity_diff > 0.1),
            "predictive_parity": bool(predictive_parity_diff > 0.1)
        }
        
        return metrics, flags

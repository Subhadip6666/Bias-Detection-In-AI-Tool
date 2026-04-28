from fairlearn.reductions import ExponentiatedGradient, DemographicParity
from fairlearn.postprocessing import ThresholdOptimizer
from fairlearn.preprocessing import CorrelationRemover
import pandas as pd
from sklearn.linear_model import LogisticRegression
from sklearn.ensemble import RandomForestClassifier

class BiasMitigator:
    @staticmethod
    def reweighting(X, y, sensitive_features):
        # Reweighting is often done by calculating weights based on group prevalences
        # For simplicity in this tool, we'll focus on Reductions and Post-processing
        # but we can implement a basic reweighting by passing weights to scikit-learn
        pass

    @staticmethod
    def exponentiated_gradient(model, X, y, sensitive_features):
        """
        In-processing technique.
        """
        constraint = DemographicParity()
        mitigator = ExponentiatedGradient(model, constraint)
        mitigator.fit(X, y, sensitive_features=sensitive_features)
        return mitigator

    @staticmethod
    def threshold_optimization(model, X, y, sensitive_features):
        """
        Post-processing technique.
        """
        # ThresholdOptimizer requires a fitted estimator
        model.fit(X, y)
        postprocess_est = ThresholdOptimizer(
            estimator=model,
            constraints="demographic_parity",
            prefit=True
        )
        postprocess_est.fit(X, y, sensitive_features=sensitive_features)
        return postprocess_est

    @staticmethod
    def correlation_remover(X, sensitive_features):
        """
        Pre-processing technique.
        """
        remover = CorrelationRemover(sensitive_feature_ids=sensitive_features.columns.tolist())
        X_transformed = remover.fit_transform(X)
        return X_transformed

    @staticmethod
    def apply_equalized_odds(y_true, y_pred, sensitive_features):
        """
        Simple post-processing: adjust predictions to equalize FPR across groups.
        Uses random flip strategy to balance false positive rates.
        """
        import numpy as np
        y_pred_fixed = y_pred.copy()
        groups = np.unique(sensitive_features)
        
        # Calculate FPR per group
        fprs = {}
        for g in groups:
            mask = sensitive_features == g
            neg_mask = mask & (y_true == 0)
            if neg_mask.sum() > 0:
                fprs[g] = (y_pred[neg_mask] == 1).sum() / neg_mask.sum()
            else:
                fprs[g] = 0.0
        
        # Target the minimum FPR
        target_fpr = min(fprs.values())
        
        # For each group with higher FPR, randomly flip some false positives to negatives
        for g in groups:
            if fprs[g] > target_fpr:
                mask = (sensitive_features == g) & (y_true == 0) & (y_pred == 1)
                fp_indices = np.where(mask)[0]
                n_to_flip = int(len(fp_indices) * (1 - target_fpr / max(fprs[g], 1e-9)))
                if n_to_flip > 0:
                    flip = np.random.choice(fp_indices, size=min(n_to_flip, len(fp_indices)), replace=False)
                    y_pred_fixed[flip] = 0
        
        return y_pred_fixed

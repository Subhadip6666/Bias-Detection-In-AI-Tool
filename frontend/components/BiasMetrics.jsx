import React, { useState } from 'react';
import { Activity, ShieldAlert, Loader2, ArrowRight, Info } from 'lucide-react';
import { analyzeBias } from '../utils/api';
import SkeletonLoader from './SkeletonLoader';

export default function BiasMetrics({ datasetId, modelId, columns, onAnalysisSuccess }) {
  const [protectedAttr, setProtectedAttr] = useState('');
  const [loading, setLoading] = useState(false);

  const handleAnalyze = async () => {
    if (!protectedAttr) return alert("Please select a protected attribute");
    setLoading(true);
    try {
      const data = await analyzeBias(datasetId, modelId, protectedAttr);
      onAnalysisSuccess(data, protectedAttr);
    } catch (err) {
      console.error(err);
      alert("Analysis failed.");
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto space-y-4">
        <div className="flex items-center space-x-3 justify-center mb-2">
          <Loader2 className="animate-spin text-indigo-400" size={24} />
          <span className="text-indigo-300 font-medium text-sm">Evaluating fairness metrics & prompting Gemini AI...</span>
        </div>
        <SkeletonLoader variant="bias" />
      </div>
    );
  }

  return (
    <div className="glass rounded-3xl p-8 max-w-4xl mx-auto">
      <div className="flex items-center space-x-3 mb-8">
        <Activity className="text-indigo-400" />
        <h2 className="text-2xl font-bold">Bias Detection</h2>
      </div>

      <div className="bg-indigo-500/5 border border-indigo-500/10 p-6 rounded-2xl mb-8">
        <h3 className="text-sm font-semibold text-indigo-400 uppercase tracking-wider mb-4 flex items-center">
          <ShieldAlert className="mr-2" size={16} />
          Select Protected Attribute
        </h3>
        <p className="text-gray-400 text-sm mb-6">
          The system will analyze fairness across different groups within this category. 
          Protected attributes are characteristics like race, gender, or age that should not negatively impact outcomes.
        </p>
        
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {columns.filter(c => ['race', 'sex', 'age', 'gender'].includes(c.toLowerCase())).map(col => (
            <button
              key={col}
              onClick={() => setProtectedAttr(col)}
              className={`px-4 py-3 rounded-xl border text-sm font-medium transition-all ${
                protectedAttr === col 
                  ? 'border-indigo-500 bg-indigo-500/20 text-white' 
                  : 'border-white/5 bg-white/5 text-gray-400 hover:bg-white/10'
              }`}
            >
              {col.charAt(0).toUpperCase() + col.slice(1)}
            </button>
          ))}
          <select 
            onChange={(e) => setProtectedAttr(e.target.value)}
            className="col-span-2 input-field text-sm"
          >
            <option value="">Other attributes...</option>
            {columns.map(c => <option key={c} value={c}>{c}</option>)}
          </select>
        </div>
      </div>

      <div className="flex justify-between items-center">
        <div className="flex items-center text-gray-500 text-xs">
          <Info size={14} className="mr-1" />
          Powered by Fairlearn & Gemini 1.5
        </div>
        <button 
          onClick={handleAnalyze}
          disabled={loading || !protectedAttr}
          className="btn-primary flex items-center space-x-2"
        >
          <>
            <span>Run Bias Analysis</span>
            <ArrowRight size={18} />
          </>
        </button>
      </div>
    </div>
  );
}


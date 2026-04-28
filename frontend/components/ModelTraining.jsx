import React, { useState } from 'react';
import { Database, Zap, Loader2, ArrowRight } from 'lucide-react';
import { trainModel } from '../utils/api';

export default function ModelTraining({ datasetId, columns, onTrainingSuccess }) {
  const [modelType, setModelType] = useState('logistic_regression');
  const [targetCol, setTargetCol] = useState('');
  const [loading, setLoading] = useState(false);

  const handleTrain = async () => {
    if (!targetCol) return alert("Please select a target column");
    setLoading(true);
    try {
      const data = await trainModel(datasetId, modelType, targetCol);
      onTrainingSuccess(data);
    } catch (err) {
      console.error(err);
      alert("Training failed.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="glass rounded-3xl p-8 max-w-4xl mx-auto">
      <div className="flex items-center space-x-3 mb-8">
        <Database className="text-indigo-400" />
        <h2 className="text-2xl font-bold">Model Configuration</h2>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-8">
        {/* Model Type Selection */}
        <div className="space-y-4">
          <label className="block text-sm font-medium text-gray-400">Select Model Type</label>
          <div className="grid grid-cols-1 gap-3">
            {[
              { id: 'logistic_regression', name: 'Logistic Regression', desc: 'Fast, interpretable baseline' },
              { id: 'random_forest', name: 'Random Forest', desc: 'Robust ensemble method' }
            ].map((m) => (
              <button
                key={m.id}
                onClick={() => setModelType(m.id)}
                className={`text-left p-4 rounded-xl border transition-all ${
                  modelType === m.id 
                    ? 'border-indigo-500 bg-indigo-500/10 ring-1 ring-indigo-500' 
                    : 'border-white/5 bg-white/2 hover:bg-white/5'
                }`}
              >
                <p className="font-bold">{m.name}</p>
                <p className="text-xs text-gray-500 mt-1">{m.desc}</p>
              </button>
            ))}
          </div>
        </div>

        {/* Target Column Selection */}
        <div className="space-y-4">
          <label className="block text-sm font-medium text-gray-400">Target Variable (Prediction Goal)</label>
          <select 
            value={targetCol}
            onChange={(e) => setTargetCol(e.target.value)}
            className="w-full input-field"
          >
            <option value="">Select column...</option>
            {columns.map(col => (
              <option key={col} value={col}>{col}</option>
            ))}
          </select>
          <div className="p-4 bg-yellow-500/10 border border-yellow-500/20 rounded-xl">
            <p className="text-xs text-yellow-500 font-medium leading-relaxed">
              Tip: For COMPAS, choose 'two_year_recid'. For Adult dataset, choose 'income'.
            </p>
          </div>
        </div>
      </div>

      <div className="flex justify-end">
        <button 
          onClick={handleTrain}
          disabled={loading || !targetCol}
          className="btn-primary flex items-center space-x-2"
        >
          {loading ? (
            <>
              <Loader2 className="animate-spin" size={20} />
              <span>Training Model...</span>
            </>
          ) : (
            <>
              <Zap size={20} />
              <span>Initiate Training</span>
              <ArrowRight size={18} />
            </>
          )}
        </button>
      </div>
    </div>
  );
}

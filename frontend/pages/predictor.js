import React, { useState, useEffect } from 'react';
import Head from 'next/head';
import Link from 'next/link';
import { ArrowLeft, Loader2 } from 'lucide-react';
import { predictSingle } from '../utils/api';

export default function PredictorPage() {
  const [age, setAge] = useState(25);
  const [priors, setPriors] = useState(3);
  const [jf, setJf] = useState(0);
  const [jm, setJm] = useState(0);
  const [sex, setSex] = useState(1);
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);
  const [modelId, setModelId] = useState(null);

  useEffect(() => {
    const ids = JSON.parse(sessionStorage.getItem('analysisIds') || '{}');
    if (ids.modelId) setModelId(ids.modelId);
  }, []);

  const handlePredict = async () => {
    if (!modelId) { alert('Run analysis first.'); return; }
    setLoading(true);
    try {
      const r = await predictSingle(modelId, { age, sex, priors_count: priors, juv_fel_count: jf, juv_misd_count: jm });
      setResult(r);
    } catch (err) {
      alert('Prediction failed.');
    } finally {
      setLoading(false);
    }
  };

  const sliders = [
    { id: 'age', label: 'Age', value: age, set: setAge, min: 18, max: 70 },
    { id: 'priors', label: 'Prior Crimes', value: priors, set: setPriors, min: 0, max: 30 },
    { id: 'jf', label: 'Juvenile Felonies', value: jf, set: setJf, min: 0, max: 10 },
    { id: 'jm', label: 'Juvenile Misdemeanors', value: jm, set: setJm, min: 0, max: 10 },
  ];

  return (
    <div className="min-h-screen p-4 md:p-8 relative">
      <div className="bg-mesh" />
      <Head><title>Live Predictor | BiasFix AI</title></Head>
      <main className="max-w-7xl mx-auto">
        <Link href="/bias" className="text-indigo-400 hover:text-indigo-300 flex items-center gap-2 mb-4 text-sm">
          <ArrowLeft size={16} /> Back
        </Link>
        <h1 className="text-3xl font-bold text-white mb-8">Live Predictor</h1>

        {!modelId ? (
          <div className="glass p-12 rounded-3xl text-center text-gray-400">Train a model first.</div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div className="glass rounded-2xl p-6">
              <h3 className="text-xs text-gray-500 uppercase tracking-widest font-bold mb-6">Input</h3>
              {sliders.map(s => (
                <div key={s.id} className="mb-4">
                  <label className="flex justify-between text-xs text-gray-400 mb-1">{s.label} <b className="text-white">{s.value}</b></label>
                  <input type="range" min={s.min} max={s.max} value={s.value} onChange={e => s.set(+e.target.value)} className="w-full accent-indigo-500" />
                </div>
              ))}
              <select value={sex} onChange={e => setSex(+e.target.value)} className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-white text-sm mb-4">
                <option value={1}>Male</option><option value={0}>Female</option>
              </select>
              <button onClick={handlePredict} disabled={loading} className="w-full btn-primary flex items-center justify-center gap-2">
                {loading ? <Loader2 className="animate-spin" size={16} /> : '🔍'} Predict
              </button>
            </div>
            <div className="glass rounded-2xl p-6">
              <h3 className="text-xs text-gray-500 uppercase tracking-widest font-bold mb-6">Result</h3>
              {result ? (
                <div className={`rounded-2xl p-8 border ${result.prediction === 1 ? 'bg-red-500/5 border-red-500/20' : 'bg-green-500/5 border-green-500/20'}`}>
                  <p className={`text-4xl font-bold ${result.prediction === 1 ? 'text-red-400' : 'text-green-400'}`}>
                    {result.prediction === 1 ? '🔴 High Risk' : '🟢 Low Risk'}
                  </p>
                  <p className="text-gray-500 text-sm mt-2">Confidence: {result.probability ? (result.probability * 100).toFixed(1) + '%' : 'N/A'}</p>
                </div>
              ) : <p className="text-gray-500 text-center py-16">Run a prediction to see results.</p>}
            </div>
          </div>
        )}
      </main>
    </div>
  );
}

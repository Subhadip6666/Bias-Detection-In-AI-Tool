import React, { useState, useEffect } from 'react';
import Head from 'next/head';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, RadarChart, PolarGrid,
  PolarAngleAxis, PolarRadiusAxis, Radar, Legend, Cell } from 'recharts';
import { ArrowLeft, ShieldCheck, ShieldAlert, Loader2 } from 'lucide-react';
import { fixBias } from '../utils/api';

export default function BiasDetectionPage() {
  const [biasResults, setBiasResults] = useState(null);
  const [fixing, setFixing] = useState(false);
  const [fixResult, setFixResult] = useState(null);

  useEffect(() => {
    const stored = sessionStorage.getItem('biasResults');
    if (stored) setBiasResults(JSON.parse(stored));
  }, []);

  const metrics = biasResults?.metrics;
  const flags = biasResults?.flags;

  const handleFix = async () => {
    setFixing(true);
    try {
      const ids = JSON.parse(sessionStorage.getItem('analysisIds') || '{}');
      const result = await fixBias(ids.datasetId, ids.modelId, ids.protectedAttr);
      setFixResult(result);
      sessionStorage.setItem('fixResults', JSON.stringify(result));
    } catch (err) {
      alert('Fix failed: ' + (err.response?.data?.detail || err.message));
    } finally {
      setFixing(false);
    }
  };

  const metricCards = metrics ? [
    { key: 'Demographic Parity', value: metrics.demographic_parity_diff, flagged: flags.demographic_parity },
    { key: 'Equalized Odds', value: metrics.equalized_odds_diff, flagged: flags.equalized_odds },
    { key: 'Disparate Impact', value: metrics.disparate_impact_ratio, flagged: flags.disparate_impact, isRatio: true },
    { key: 'Equal Opportunity', value: metrics.equal_opportunity_diff, flagged: flags.equal_opportunity },
    { key: 'Predictive Parity', value: metrics.predictive_parity_diff, flagged: flags.predictive_parity },
  ] : [];

  const barData = metrics ? [
    { name: 'Dem. Parity', value: Math.abs(metrics.demographic_parity_diff * 100), fill: '#EF4444' },
    { name: 'Equal. Odds', value: Math.abs(metrics.equalized_odds_diff * 100), fill: '#F59E0B' },
    { name: 'Equal Opp.', value: Math.abs(metrics.equal_opportunity_diff * 100), fill: '#6366F1' },
    { name: 'Pred. Parity', value: Math.abs(metrics.predictive_parity_diff * 100), fill: '#10B981' },
  ] : [];

  const radarData = metrics ? [
    { metric: 'Dem. Parity', value: Math.abs(metrics.demographic_parity_diff) * 100 },
    { metric: 'Equal. Odds', value: Math.abs(metrics.equalized_odds_diff) * 100 },
    { metric: 'Disp. Impact', value: metrics.disparate_impact_ratio * 100 },
    { metric: 'Equal Opp.', value: Math.abs(metrics.equal_opportunity_diff) * 100 },
  ] : [];

  return (
    <div className="min-h-screen p-4 md:p-8 relative">
      <div className="bg-mesh" />
      <Head><title>Bias Detection | BiasFix AI</title></Head>

      <main className="max-w-7xl mx-auto">
        <div className="flex items-center justify-between mb-8">
          <div>
            <Link href="/" className="text-indigo-400 hover:text-indigo-300 flex items-center gap-2 mb-2 text-sm">
              <ArrowLeft size={16} /> Back to Dashboard
            </Link>
            <h1 className="text-3xl font-bold text-white">Bias Detection</h1>
            <p className="text-gray-500 mt-1 text-sm">Statistical analysis of model fairness</p>
          </div>
          <div className="flex items-center gap-2 text-green-400 text-sm">
            <div className="w-2 h-2 rounded-full bg-green-400" />
            Analysis complete
          </div>
        </div>

        {!metrics ? (
          <div className="glass p-12 rounded-3xl text-center">
            <ShieldAlert className="mx-auto text-gray-600 mb-4" size={48} />
            <p className="text-gray-400">No analysis data found. Please run the analysis from the <Link href="/" className="text-indigo-400 underline">dashboard</Link> first.</p>
          </div>
        ) : (
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
            {/* Metric Cards */}
            <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mb-6">
              {metricCards.map(m => (
                <div key={m.key} className="glass rounded-2xl p-5 border-white/5 relative overflow-hidden group">
                  <div className={`absolute top-0 left-0 w-full h-1 ${m.flagged ? 'bg-red-500' : 'bg-green-500'}`} />
                  <p className="text-[0.65rem] text-gray-500 uppercase tracking-widest mb-2 font-semibold">{m.key}</p>
                  <p className={`text-2xl font-bold ${m.flagged ? 'text-red-400' : 'text-green-400'}`}>
                    {m.isRatio ? m.value.toFixed(3) : (m.value * 100).toFixed(2) + '%'}
                  </p>
                  <p className={`text-[0.6rem] mt-2 ${m.flagged ? 'text-red-500/70' : 'text-green-500/70'}`}>
                    {m.flagged ? '⚠ Bias Detected' : '✓ Fair'}
                  </p>
                </div>
              ))}
            </div>

            {/* Alert */}
            {Object.values(flags).some(f => f) && (
              <div className="bg-red-500/5 border border-red-500/20 border-l-4 border-l-red-500 rounded-xl p-4 mb-6 text-red-300 text-sm">
                ⚠️ <b>Bias detected!</b> One or more fairness criteria have been violated.
              </div>
            )}

            {/* Fix Bias */}
            <div className="glass rounded-2xl p-6 mb-6 flex items-center justify-between gap-6">
              <div>
                <h3 className="text-sm font-bold text-white mb-1">⚙ Apply Fairness Correction</h3>
                <p className="text-gray-500 text-sm">Apply <b>Fairlearn Equalized Odds</b> post-processing to reduce bias disparity.</p>
              </div>
              <button onClick={handleFix} disabled={fixing}
                className="px-8 py-3 rounded-xl font-bold text-white text-sm tracking-wider whitespace-nowrap transition-all
                  bg-gradient-to-r from-emerald-500 to-emerald-600 hover:from-emerald-600 hover:to-emerald-700
                  shadow-lg shadow-emerald-500/25 hover:shadow-emerald-500/40 active:scale-95 disabled:opacity-50">
                {fixing ? <><Loader2 className="animate-spin inline mr-2" size={16} />Applying...</> : '🛡️ FIX BIAS'}
              </button>
            </div>
            {fixResult && (
              <div className="bg-emerald-500/5 border border-emerald-500/20 border-l-4 border-l-emerald-500 rounded-xl p-4 mb-6 text-emerald-300 text-sm">
                ✅ Bias fix applied! View <Link href="/compare" className="text-emerald-400 underline font-bold">Before vs After →</Link>
              </div>
            )}

            {/* Charts Row */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
              <div className="glass rounded-2xl p-6">
                <h3 className="text-[0.65rem] text-gray-500 uppercase tracking-widest font-bold mb-4">Fairness Metric Differences (%)</h3>
                <ResponsiveContainer width="100%" height={260}>
                  <BarChart data={barData} layout="vertical" margin={{ left: 10, right: 30 }}>
                    <XAxis type="number" tick={{ fill: '#64748B', fontSize: 11 }} axisLine={false} tickLine={false} />
                    <YAxis dataKey="name" type="category" tick={{ fill: '#E2E8F0', fontSize: 11 }} axisLine={false} tickLine={false} width={85} />
                    <Tooltip contentStyle={{ background: '#1E293B', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 8, color: '#F8FAFC' }}
                      formatter={(v) => v.toFixed(1) + '%'} />
                    <Bar dataKey="value" radius={[0, 6, 6, 0]} barSize={24}>
                      {barData.map((e, i) => <Cell key={i} fill={e.fill} />)}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              </div>
              <div className="glass rounded-2xl p-6">
                <h3 className="text-[0.65rem] text-gray-500 uppercase tracking-widest font-bold mb-4">Metrics Radar</h3>
                <ResponsiveContainer width="100%" height={260}>
                  <RadarChart data={radarData} cx="50%" cy="50%" outerRadius={90}>
                    <PolarGrid stroke="rgba(255,255,255,0.06)" />
                    <PolarAngleAxis dataKey="metric" tick={{ fill: '#E2E8F0', fontSize: 10 }} />
                    <PolarRadiusAxis tick={{ fill: '#64748B', fontSize: 9 }} axisLine={false} />
                    <Radar name="Bias" dataKey="value" stroke="#EF4444" fill="#EF4444" fillOpacity={0.15} strokeWidth={2} />
                    <Legend wrapperStyle={{ color: '#94A3B8', fontSize: 11 }} />
                    <Tooltip contentStyle={{ background: '#1E293B', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 8, color: '#F8FAFC' }} />
                  </RadarChart>
                </ResponsiveContainer>
              </div>
            </div>
          </motion.div>
        )}

        {/* Page Nav */}
        <div className="flex flex-wrap gap-3 mt-8 pt-6 border-t border-white/5">
          {[
            { href: '/matrix', label: 'Confusion Matrix' },
            { href: '/features', label: 'Feature Importance' },
            { href: '/explorer', label: 'Dataset Explorer' },
            { href: '/gemini', label: 'Gemini AI' },
            { href: '/compare', label: 'Before vs After' },
            { href: '/predictor', label: 'Live Predictor' },
            { href: '/report', label: 'Download Report' },
          ].map(p => (
            <Link key={p.href} href={p.href}
              className="px-4 py-2 rounded-full bg-white/5 text-gray-400 text-sm hover:bg-indigo-500/20 hover:text-indigo-300 transition-all">
              {p.label}
            </Link>
          ))}
        </div>
      </main>
    </div>
  );
}

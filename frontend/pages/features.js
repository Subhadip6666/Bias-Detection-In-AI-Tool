import React, { useState, useEffect } from 'react';
import Head from 'next/head';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell } from 'recharts';
import { ArrowLeft, Loader2 } from 'lucide-react';
import { getFeatureImportance } from '../utils/api';
import SkeletonLoader from '../components/SkeletonLoader';

export default function FeatureImportancePage() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [modelId, setModelId] = useState(null);

  useEffect(() => {
    const ids = JSON.parse(sessionStorage.getItem('analysisIds') || '{}');
    if (ids.modelId) {
      setModelId(ids.modelId);
      loadData(ids.modelId);
    }
  }, []);

  const loadData = async (mid) => {
    setLoading(true);
    try {
      const result = await getFeatureImportance(mid);
      const items = result.features.map((f, i) => ({
        name: f,
        importance: Math.abs(result.coefficients[i]),
        fill: result.coefficients[i] > 0 ? '#EF4444' : '#6366F1'
      })).sort((a, b) => b.importance - a.importance);
      setData(items);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen p-4 md:p-8 relative">
      <div className="bg-mesh" />
      <Head><title>Feature Importance | BiasFix AI</title></Head>

      <main className="max-w-7xl mx-auto">
        <Link href="/bias" className="text-indigo-400 hover:text-indigo-300 flex items-center gap-2 mb-4 text-sm">
          <ArrowLeft size={16} /> Back to Bias Detection
        </Link>
        <h1 className="text-3xl font-bold text-white mb-2">Feature Importance</h1>
        <p className="text-gray-500 mb-8 text-sm">Which input features drive the model's predictions</p>

        <div className="bg-yellow-500/5 border border-yellow-500/20 border-l-4 border-l-yellow-500 rounded-xl p-4 mb-6 text-yellow-200 text-sm">
          "Prior crimes" is often the most important feature. This can encode historical over-policing of minority communities — creating a feedback loop that amplifies existing bias.
        </div>

        <div className="glass rounded-2xl p-6">
          <h3 className="text-[0.65rem] text-gray-500 uppercase tracking-widest font-bold mb-4">Feature Coefficients (Absolute)</h3>
          {loading ? (
            <SkeletonLoader variant="general" count={4} />
          ) : data ? (
            <ResponsiveContainer width="100%" height={Math.max(300, data.length * 50)}>
              <BarChart data={data} layout="vertical" margin={{ left: 20, right: 40 }}>
                <XAxis type="number" tick={{ fill: '#64748B', fontSize: 11 }} axisLine={false} tickLine={false} />
                <YAxis dataKey="name" type="category" tick={{ fill: '#E2E8F0', fontSize: 11 }} axisLine={false} tickLine={false} width={120} />
                <Tooltip contentStyle={{ background: '#1E293B', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 8, color: '#F8FAFC' }}
                  formatter={(v) => v.toFixed(4)} />
                <Bar dataKey="importance" radius={[0, 6, 6, 0]} barSize={24}>
                  {data.map((e, i) => <Cell key={i} fill={e.fill} />)}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          ) : (
            <p className="text-gray-500 text-center py-12">No model data. Run analysis from <Link href="/" className="text-indigo-400 underline">dashboard</Link> first.</p>
          )}
        </div>
      </main>
    </div>
  );
}

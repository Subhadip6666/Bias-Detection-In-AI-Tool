import React, { useState, useEffect } from 'react';
import Head from 'next/head';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { ArrowLeft, Loader2 } from 'lucide-react';
import { getDatasetRows } from '../utils/api';
import SkeletonLoader from '../components/SkeletonLoader';

export default function DatasetExplorerPage() {
  const [rows, setRows] = useState([]);
  const [total, setTotal] = useState(0);
  const [filters, setFilters] = useState({ race: 'All', pred: 'All', actual: 'All' });
  const [loading, setLoading] = useState(false);
  const [datasetId, setDatasetId] = useState(null);

  useEffect(() => {
    const ids = JSON.parse(sessionStorage.getItem('analysisIds') || '{}');
    if (ids.datasetId) {
      setDatasetId(ids.datasetId);
    }
  }, []);

  useEffect(() => {
    if (datasetId) loadRows();
  }, [datasetId, filters]);

  const loadRows = async () => {
    setLoading(true);
    try {
      const result = await getDatasetRows(datasetId, filters);
      setRows(result.rows || []);
      setTotal(result.total || 0);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const displayCols = rows.length > 0 ? Object.keys(rows[0]) : [];

  return (
    <div className="min-h-screen p-4 md:p-8 relative">
      <div className="bg-mesh" />
      <Head><title>Dataset Explorer | BiasFix AI</title></Head>

      <main className="max-w-7xl mx-auto">
        <Link href="/bias" className="text-indigo-400 hover:text-indigo-300 flex items-center gap-2 mb-4 text-sm">
          <ArrowLeft size={16} /> Back to Bias Detection
        </Link>
        <h1 className="text-3xl font-bold text-white mb-2">Dataset Explorer</h1>
        <p className="text-gray-500 mb-8 text-sm">Browse and filter the raw data</p>

        {!datasetId ? (
          <div className="glass p-12 rounded-3xl text-center text-gray-400">
            Upload a dataset from the <Link href="/" className="text-indigo-400 underline">dashboard</Link> first.
          </div>
        ) : (
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
            {/* Filters */}
            <div className="glass rounded-2xl p-6 mb-6">
              <div className="flex flex-wrap gap-6 items-end">
                {[
                  { id: 'race', label: 'Race', options: ['All', 'African-American', 'Caucasian'] },
                  { id: 'pred', label: 'Prediction', options: [{ v: 'All', l: 'All' }, { v: '1', l: 'High Risk' }, { v: '0', l: 'Low Risk' }] },
                  { id: 'actual', label: 'Actual Outcome', options: [{ v: 'All', l: 'All' }, { v: '1', l: 'Reoffended' }, { v: '0', l: 'Did Not' }] },
                ].map(f => (
                  <div key={f.id}>
                    <label className="block text-[0.6rem] text-gray-500 uppercase tracking-widest font-bold mb-2">{f.label}</label>
                    <select value={filters[f.id]} onChange={e => setFilters(p => ({ ...p, [f.id]: e.target.value }))}
                      className="bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-white text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/50">
                      {f.options.map(o => typeof o === 'string'
                        ? <option key={o} value={o}>{o}</option>
                        : <option key={o.v} value={o.v}>{o.l}</option>
                      )}
                    </select>
                  </div>
                ))}
                <span className="text-xs text-gray-600 ml-auto">Showing {total} records (first 100)</span>
              </div>
            </div>

            {/* Table */}
            <div className="glass rounded-2xl overflow-hidden">
              {loading ? (
                <SkeletonLoader variant="table" />
              ) : (
                <div className="overflow-x-auto max-h-[600px] overflow-y-auto">
                  <table className="w-full text-sm">
                    <thead className="bg-slate-900/60 sticky top-0">
                      <tr>
                        {displayCols.map(c => (
                          <th key={c} className="text-left px-4 py-3 text-[0.6rem] text-gray-500 uppercase tracking-wider font-bold border-b border-white/5">
                            {c.replace(/_/g, ' ')}
                          </th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      {rows.slice(0, 100).map((row, i) => (
                        <tr key={i} className="border-b border-white/[0.03] hover:bg-white/[0.02]">
                          {displayCols.map(c => (
                            <td key={c} className={`px-4 py-3 ${
                              c === 'prediction' ? (row[c] === 1 ? 'text-red-400 font-bold' : 'text-green-400 font-bold') :
                              c === 'true_label' ? (row[c] === 1 ? 'text-red-400' : 'text-green-400') : 'text-gray-300'
                            }`}>
                              {c === 'prediction' ? (row[c] === 1 ? 'High Risk' : 'Low Risk') :
                               c === 'true_label' ? (row[c] === 1 ? 'Reoffended' : 'Did Not') :
                               row[c]}
                            </td>
                          ))}
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          </motion.div>
        )}
      </main>
    </div>
  );
}

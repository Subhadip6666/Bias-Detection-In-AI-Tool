import React, { useState, useEffect } from 'react';
import Head from 'next/head';
import Link from 'next/link';
import { ArrowLeft, FileDown, Loader2 } from 'lucide-react';
import { generateReport } from '../utils/api';

export default function ReportPage() {
  const [loading, setLoading] = useState(false);
  const [reportUrl, setReportUrl] = useState(null);
  const [biasResults, setBiasResults] = useState(null);
  const [modelId, setModelId] = useState(null);

  useEffect(() => {
    const stored = sessionStorage.getItem('biasResults');
    if (stored) setBiasResults(JSON.parse(stored));
    const ids = JSON.parse(sessionStorage.getItem('analysisIds') || '{}');
    if (ids.modelId) setModelId(ids.modelId);
  }, []);

  const handleGenerate = async () => {
    if (!modelId || !biasResults) { alert('Run analysis first.'); return; }
    setLoading(true);
    try {
      const data = await generateReport(modelId, biasResults.metrics, biasResults.explanation || '');
      setReportUrl(data.report_url);
    } catch (err) {
      alert('Report generation failed.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen p-4 md:p-8 relative">
      <div className="bg-mesh" />
      <Head><title>Download Report | BiasFix AI</title></Head>
      <main className="max-w-7xl mx-auto">
        <Link href="/bias" className="text-indigo-400 hover:text-indigo-300 flex items-center gap-2 mb-4 text-sm">
          <ArrowLeft size={16} /> Back
        </Link>
        <h1 className="text-3xl font-bold text-white mb-8">Download Report</h1>

        <div className="glass rounded-2xl p-8">
          <div className="flex items-center gap-3 mb-6">
            <FileDown className="text-indigo-400" size={24} />
            <h3 className="text-lg font-bold text-white">Export Bias Audit Report</h3>
          </div>
          <p className="text-gray-400 text-sm mb-2">Download a complete PDF bias audit report with all findings, metrics, and recommendations.</p>
          <p className="text-gray-500 text-sm mb-8">Includes: executive summary, key findings table, disparity analysis, and recommendations.</p>

          {reportUrl ? (
            <div>
              <div className="bg-emerald-500/5 border border-emerald-500/20 border-l-4 border-l-emerald-500 rounded-xl p-4 mb-4 text-emerald-300 text-sm">
                ✅ Report generated successfully!
              </div>
              <a href={`http://localhost:10000${reportUrl}`} target="_blank" rel="noopener noreferrer"
                className="btn-primary inline-flex items-center gap-2 bg-gradient-to-r from-emerald-500 to-emerald-600">
                <FileDown size={18} /> Download PDF
              </a>
            </div>
          ) : (
            <button onClick={handleGenerate} disabled={loading || !biasResults}
              className="btn-primary flex items-center gap-2">
              {loading ? <Loader2 className="animate-spin" size={18} /> : <FileDown size={18} />}
              {loading ? 'Generating...' : 'Generate & Download PDF'}
            </button>
          )}
        </div>
      </main>
    </div>
  );
}

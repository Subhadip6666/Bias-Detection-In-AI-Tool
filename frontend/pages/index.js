import React, { useState } from 'react';
import Head from 'next/head';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';
import { Upload, Database, Activity, ShieldCheck, FileText, Download, ChevronRight, AlertCircle } from 'lucide-react';
import { uploadDataset, trainModel, analyzeBias, generateReport } from '../utils/api';

// Components
import DataUpload from '../components/DataUpload';
import ModelTraining from '../components/ModelTraining';
import BiasMetrics from '../components/BiasMetrics';
import ComparisonView from '../components/ComparisonView';

export default function Dashboard() {
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  
  // Data state
  const [datasetId, setDatasetId] = useState(null);
  const [columns, setColumns] = useState([]);
  const [preview, setPreview] = useState([]);
  const [modelId, setModelId] = useState(null);
  const [trainingResults, setTrainingResults] = useState(null);
  const [biasResults, setBiasResults] = useState(null);
  const [reportUrl, setReportUrl] = useState(null);

  const handleUploadSuccess = (data) => {
    setDatasetId(data.dataset_id);
    setColumns(data.columns);
    setPreview(data.preview);
    setStep(2);
  };

  const handleTrainingSuccess = (data) => {
    setModelId(data.model_id);
    setTrainingResults(data);
    sessionStorage.setItem('analysisIds', JSON.stringify({ datasetId, modelId: data.model_id }));
    setStep(3);
  };

  const handleBiasAnalysisSuccess = (data, attr) => {
    setBiasResults(data);
    sessionStorage.setItem('biasResults', JSON.stringify(data));
    const ids = JSON.parse(sessionStorage.getItem('analysisIds') || '{}');
    ids.protectedAttr = attr;
    sessionStorage.setItem('analysisIds', JSON.stringify(ids));
    setStep(4);
  };

  const steps = [
    { id: 1, name: 'Upload Data', icon: Upload },
    { id: 2, name: 'Train Model', icon: Database },
    { id: 3, name: 'Detect Bias', icon: Activity },
    { id: 4, name: 'Mitigate & Report', icon: ShieldCheck },
  ];

  return (
    <div className="min-h-screen p-4 md:p-8 relative">
      <div className="bg-mesh" />

      <Head>
        <title>AI Fairness | Bias Detection & Correction</title>
        <meta name="description" content="Enterprise-grade AI bias detection and mitigation platform" />
      </Head>

      <main className="max-w-7xl mx-auto">
        {/* Header */}
        <header className="flex justify-between items-center mb-12">
          <div>
            <h1 className="text-4xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-indigo-400 to-purple-400">
              BiasFix AI
            </h1>
            <p className="text-gray-400 mt-1">Ethical AI Governance Platform</p>
          </div>
          
          <div className="hidden md:flex space-x-2">
            {steps.map((s) => (
              <div 
                key={s.id}
                className={`flex items-center space-x-2 px-4 py-2 rounded-full transition-all ${
                  step === s.id ? 'bg-indigo-600 text-white shadow-lg' : 'bg-white/5 text-gray-500'
                }`}
              >
                <s.icon size={18} />
                <span className="text-sm font-medium">{s.name}</span>
                {s.id < 4 && <ChevronRight size={14} className="text-gray-600" />}
              </div>
            ))}
          </div>
        </header>

        {/* Main Content Area */}
        <div className="grid grid-cols-1 gap-8">
          <AnimatePresence mode="wait">
            {step === 1 && (
              <motion.div
                key="step1"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
              >
                <DataUpload onUploadSuccess={handleUploadSuccess} />
              </motion.div>
            )}

            {step === 2 && (
              <motion.div
                key="step2"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
              >
                <ModelTraining 
                  datasetId={datasetId} 
                  columns={columns} 
                  onTrainingSuccess={handleTrainingSuccess} 
                />
              </motion.div>
            )}

            {step === 3 && (
              <motion.div
                key="step3"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
              >
                <BiasMetrics 
                  datasetId={datasetId} 
                  modelId={modelId} 
                  columns={columns}
                  onAnalysisSuccess={handleBiasAnalysisSuccess}
                />
              </motion.div>
            )}

            {step === 4 && (
              <motion.div
                key="step4"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
              >
                <ComparisonView 
                  modelId={modelId}
                  biasResults={biasResults}
                  onReportGenerated={(url) => setReportUrl(url)}
                />
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Page Navigation Links */}
        {step >= 4 && (
          <div className="mt-8 pt-6 border-t border-white/5">
            <p className="text-gray-500 text-xs uppercase tracking-widest mb-4 font-semibold">Explore Analysis</p>
            <div className="flex flex-wrap gap-3">
              {[
                { href: '/bias', label: 'Bias Detection' },
                { href: '/matrix', label: 'Confusion Matrix' },
                { href: '/features', label: 'Feature Importance' },
                { href: '/explorer', label: 'Dataset Explorer' },
                { href: '/gemini', label: 'Gemini AI' },
                { href: '/compare', label: 'Before vs After' },
                { href: '/predictor', label: 'Live Predictor' },
                { href: '/report', label: 'Download Report' },
              ].map(p => (
                <Link key={p.href} href={p.href}
                  className="px-5 py-2.5 rounded-full bg-white/5 border border-white/10 text-gray-400 text-sm font-medium hover:bg-indigo-500/20 hover:text-indigo-300 hover:border-indigo-500/30 transition-all">
                  {p.label}
                </Link>
              ))}
            </div>
          </div>
        )}

        {/* Global Error Toast */}
        <AnimatePresence>
          {error && (
            <motion.div 
              initial={{ opacity: 0, bottom: -20 }}
              animate={{ opacity: 1, bottom: 20 }}
              exit={{ opacity: 0, bottom: -20 }}
              className="fixed bottom-8 right-8 glass bg-red-500/20 border-red-500/50 p-4 rounded-xl flex items-center space-x-3 text-red-200"
            >
              <AlertCircle />
              <span>{error}</span>
              <button onClick={() => setError(null)} className="ml-4 hover:text-white">✕</button>
            </motion.div>
          )}
        </AnimatePresence>
      </main>
    </div>
  );
}

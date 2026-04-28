import React, { useState, useEffect } from 'react';
import Head from 'next/head';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { ArrowLeft, Sparkles } from 'lucide-react';

export default function GeminiPage() {
  const [explanation, setExplanation] = useState(null);

  useEffect(() => {
    const stored = sessionStorage.getItem('biasResults');
    if (stored) {
      const data = JSON.parse(stored);
      setExplanation(data.explanation);
    }
  }, []);

  return (
    <div className="min-h-screen p-4 md:p-8 relative">
      <div className="bg-mesh" />
      <Head><title>Gemini AI | BiasFix AI</title></Head>

      <main className="max-w-7xl mx-auto">
        <Link href="/bias" className="text-indigo-400 hover:text-indigo-300 flex items-center gap-2 mb-4 text-sm">
          <ArrowLeft size={16} /> Back to Bias Detection
        </Link>
        <h1 className="text-3xl font-bold text-white mb-2">Gemini AI Analysis</h1>
        <p className="text-gray-500 mb-8 text-sm">Plain English explanation of detected bias</p>

        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
          <div className="glass rounded-2xl p-8">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-10 h-10 bg-cyan-500/10 rounded-xl flex items-center justify-center">
                <Sparkles className="text-cyan-400" size={20} />
              </div>
              <h3 className="text-lg font-bold text-white">Google Gemini AI Analysis</h3>
            </div>

            <p className="text-gray-400 text-sm mb-6">
              Gemini reads the bias report and explains it in plain English — no jargon.
            </p>

            {explanation ? (
              <div className="relative overflow-hidden rounded-2xl p-6 border border-cyan-500/20"
                style={{ background: 'linear-gradient(135deg, rgba(0,198,255,0.06), rgba(0,198,255,0.02))' }}>
                <div className="text-[0.6rem] text-cyan-400 uppercase tracking-widest font-bold mb-4">🤖 GEMINI AI</div>
                <div className="text-cyan-100/80 leading-relaxed whitespace-pre-line text-sm">
                  {explanation}
                </div>
              </div>
            ) : (
              <div className="text-center py-16 text-gray-500">
                <Sparkles className="mx-auto mb-4 text-gray-600" size={40} />
                <p>No explanation available. Run analysis from the <Link href="/" className="text-indigo-400 underline">dashboard</Link> first.</p>
                <p className="text-xs text-gray-600 mt-2">Gemini generates explanations automatically during analysis.</p>
              </div>
            )}
          </div>
        </motion.div>
      </main>
    </div>
  );
}

import React, { useState } from 'react';
import { ShieldCheck, FileText, Download, TrendingDown, CheckCircle, XCircle, Sparkles, Loader2 } from 'lucide-react';
import { generateReport } from '../utils/api';

export default function ComparisonView({ modelId, biasResults, onReportGenerated }) {
  const [loading, setLoading] = useState(false);
  const [reportUrl, setReportUrl] = useState(null);

  const { metrics, flags, explanation } = biasResults;

  const handleGenerateReport = async () => {
    setLoading(true);
    try {
      const data = await generateReport(modelId, metrics, explanation);
      setReportUrl(data.report_url);
      onReportGenerated(data.report_url);
    } catch (err) {
      console.error(err);
      alert("Report generation failed.");
    } finally {
      setLoading(false);
    }
  };

  const metricCards = [
    { key: 'demographic_parity_diff', name: 'Demographic Parity', threshold: 0.1, type: 'diff' },
    { key: 'equalized_odds_diff', name: 'Equalized Odds', threshold: 0.1, type: 'diff' },
    { key: 'disparate_impact_ratio', name: 'Disparate Impact', threshold: 0.8, type: 'ratio' },
    { key: 'equal_opportunity_diff', name: 'Equal Opportunity', threshold: 0.1, type: 'diff' },
  ];

  return (
    <div className="space-y-8">
      {/* Metrics Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {metricCards.map((m) => {
          const val = metrics[m.key];
          const isFailed = m.type === 'diff' ? val > m.threshold : val < m.threshold;
          
          return (
            <div key={m.key} className="glass p-6 rounded-2xl relative overflow-hidden group">
              <div className={`absolute top-0 right-0 w-16 h-16 transition-transform group-hover:scale-110 ${
                isFailed ? 'text-red-500/20' : 'text-green-500/20'
              }`}>
                {isFailed ? <XCircle size={64} /> : <CheckCircle size={64} />}
              </div>
              
              <h4 className="text-xs font-bold text-gray-500 uppercase mb-2">{m.name}</h4>
              <div className="flex items-baseline space-x-2">
                <span className={`text-3xl font-bold ${isFailed ? 'text-red-400' : 'text-green-400'}`}>
                  {val.toFixed(3)}
                </span>
                <span className="text-xs text-gray-600">
                  /{m.type === 'diff' ? '< 0.1' : '> 0.8'}
                </span>
              </div>
              <p className={`text-xs mt-4 font-medium ${isFailed ? 'text-red-500/80' : 'text-green-500/80'}`}>
                {isFailed ? 'Significant Bias Detected' : 'Fairness Criteria Met'}
              </p>
            </div>
          );
        })}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Gemini Explanation */}
        <div className="lg:col-span-2 glass rounded-3xl p-8 border-indigo-500/20">
          <div className="flex items-center space-x-2 mb-6">
            <Sparkles className="text-indigo-400" size={20} />
            <h3 className="text-xl font-bold">AI Fairness Insights</h3>
          </div>
          <div className="prose prose-invert max-w-none">
            <p className="text-gray-300 leading-relaxed whitespace-pre-line">
              {explanation}
            </p>
          </div>
        </div>

        {/* Action Sidebar */}
        <div className="space-y-6">
          <div className="glass rounded-3xl p-6 bg-gradient-to-br from-indigo-600/10 to-purple-600/10 border-indigo-500/20">
            <h3 className="font-bold mb-4 flex items-center">
              <FileText className="mr-2" size={18} />
              Final Report
            </h3>
            <p className="text-sm text-gray-400 mb-6">
              Download a comprehensive PDF including metrics, charts, and AI recommendations.
            </p>
            
            {reportUrl ? (
              <a 
                href={`http://localhost:10000${reportUrl}`}
                target="_blank"
                rel="noopener noreferrer"
                className="w-full btn-primary flex items-center justify-center space-x-2 bg-green-600 hover:bg-green-500"
              >
                <Download size={18} />
                <span>Download PDF</span>
              </a>
            ) : (
              <button 
                onClick={handleGenerateReport}
                disabled={loading}
                className="w-full btn-primary flex items-center justify-center space-x-2"
              >
                {loading ? <Loader2 className="animate-spin" /> : <FileText size={18} />}
                <span>{loading ? 'Generating...' : 'Generate Report'}</span>
              </button>
            )}
          </div>

          <div className="glass rounded-3xl p-6 border-white/5">
            <h3 className="font-bold mb-4 flex items-center text-indigo-400">
              <TrendingDown className="mr-2" size={18} />
              Next Steps
            </h3>
            <ul className="space-y-3">
              {[
                'Apply Reweighting mitigation',
                'Retrain with Equalized Odds constraint',
                'Collect more balanced data'
              ].map((step, i) => (
                <li key={i} className="text-xs text-gray-400 flex items-start">
                  <span className="w-1.5 h-1.5 rounded-full bg-indigo-500 mt-1 mr-2 flex-shrink-0" />
                  {step}
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}

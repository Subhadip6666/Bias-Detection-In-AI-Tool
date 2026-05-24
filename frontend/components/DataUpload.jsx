import React, { useState } from 'react';
import { Upload, File, CheckCircle2, Loader2, Database } from 'lucide-react';
import { uploadDataset, loadDemoDataset } from '../utils/api';
import SkeletonLoader from './SkeletonLoader';

export default function DataUpload({ onUploadSuccess }) {
  const [isDragging, setIsDragging] = useState(false);
  const [loading, setLoading] = useState(false);
  const [file, setFile] = useState(null);

  const handleFile = async (selectedFile) => {
    if (!selectedFile) return;
    setFile(selectedFile);
    setLoading(true);
    try {
      const data = await uploadDataset(selectedFile);
      onUploadSuccess(data);
    } catch (err) {
      console.error(err);
      alert("Upload failed. Make sure the backend is running.");
    } finally {
      setLoading(false);
    }
  };

  const handleDemoData = async () => {
    setLoading(true);
    try {
      const data = await loadDemoDataset();
      onUploadSuccess(data);
    } catch (err) {
      console.error(err);
      alert("Failed to load demo data.");
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="max-w-2xl mx-auto space-y-4">
        <div className="flex items-center space-x-3 justify-center mb-2">
          <Loader2 className="animate-spin text-indigo-400" size={24} />
          <span className="text-indigo-300 font-medium text-sm">Processing & parsing CSV data...</span>
        </div>
        <SkeletonLoader variant="table" />
      </div>
    );
  }

  return (
    <div className="glass rounded-3xl p-8 max-w-2xl mx-auto border-dashed border-2 border-white/10">
      <div className="text-center mb-8">
        <div className="w-16 h-16 bg-indigo-600/20 text-indigo-400 rounded-2xl flex items-center justify-center mx-auto mb-4">
          <Upload size={32} />
        </div>
        <h2 className="text-2xl font-bold">Upload Your Dataset</h2>
        <p className="text-gray-400 mt-2">CSV files supported. All processing is secure and private.</p>
      </div>

      <div 
        onDragOver={(e) => { e.preventDefault(); setIsDragging(true); }}
        onDragLeave={() => setIsDragging(false)}
        onDrop={(e) => { e.preventDefault(); setIsDragging(false); handleFile(e.dataTransfer.files[0]); }}
        className={`relative group h-64 rounded-2xl flex flex-col items-center justify-center border-2 border-dashed transition-all cursor-pointer ${
          isDragging ? 'border-indigo-500 bg-indigo-500/10' : 'border-white/5 bg-white/2 hover:bg-white/5'
        }`}
        onClick={() => document.getElementById('file-upload').click()}
      >
        <input 
          id="file-upload" 
          type="file" 
          className="hidden" 
          accept=".csv"
          onChange={(e) => handleFile(e.target.files[0])}
        />
        
        {file ? (
          <div className="flex flex-col items-center">
            <CheckCircle2 className="text-green-400 mb-4" size={48} />
            <p className="text-green-400 font-medium">{file.name}</p>
          </div>
        ) : (
          <>
            <Upload className="text-gray-600 group-hover:text-indigo-400 mb-4 transition-colors" size={48} />
            <p className="text-gray-400 group-hover:text-gray-200 transition-colors">Drag and drop or click to browse</p>
            <p className="text-xs text-gray-600 mt-2">COMPAS, Adult, or custom CSV</p>
          </>
        )}
      </div>

      <div className="mt-8 flex items-center justify-between p-4 bg-white/5 rounded-xl border border-white/5">
        <div className="flex items-center space-x-3">
          <Database className="text-indigo-400" size={20} />
          <span className="text-sm font-medium">Standard COMPAS Dataset</span>
        </div>
        <button 
          onClick={handleDemoData}
          disabled={loading}
          className="text-xs font-semibold text-indigo-400 hover:text-indigo-300 underline disabled:opacity-50"
        >
          Use Demo Data
        </button>
      </div>
    </div>
  );
}


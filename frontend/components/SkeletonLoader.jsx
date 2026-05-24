import React from 'react';

export default function SkeletonLoader({ variant = 'general', count = 3 }) {
  // Shimmering pulse styles
  const baseShimmer = "bg-white/5 shimmer-effect rounded-xl";

  if (variant === 'table') {
    return (
      <div className="glass rounded-3xl p-6 w-full space-y-4">
        {/* Table header skeleton */}
        <div className="flex items-center justify-between pb-4 border-b border-white/5">
          <div className={`${baseShimmer} h-6 w-1/4`} />
          <div className={`${baseShimmer} h-6 w-1/6`} />
        </div>
        
        {/* Table rows skeleton */}
        <div className="space-y-3">
          {[...Array(5)].map((_, idx) => (
            <div key={idx} className="flex items-center space-x-4">
              <div className={`${baseShimmer} h-10 flex-1`} />
              <div className={`${baseShimmer} h-10 w-24`} />
              <div className={`${baseShimmer} h-10 w-16`} />
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (variant === 'training') {
    return (
      <div className="glass rounded-3xl p-8 max-w-4xl mx-auto space-y-8">
        {/* Header */}
        <div className="flex items-center space-x-4 pb-2">
          <div className={`${baseShimmer} h-8 w-8 rounded-full`} />
          <div className={`${baseShimmer} h-8 w-1/3`} />
        </div>

        {/* Content columns */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <div className="space-y-4">
            <div className={`${baseShimmer} h-5 w-1/3`} />
            <div className={`${baseShimmer} h-20 w-full`} />
            <div className={`${baseShimmer} h-20 w-full`} />
          </div>
          <div className="space-y-4">
            <div className={`${baseShimmer} h-5 w-1/2`} />
            <div className={`${baseShimmer} h-12 w-full`} />
            <div className={`${baseShimmer} h-24 w-full`} />
          </div>
        </div>

        {/* Action Button */}
        <div className="flex justify-end pt-4">
          <div className={`${baseShimmer} h-12 w-48`} />
        </div>
      </div>
    );
  }

  if (variant === 'bias') {
    return (
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Metric Cards Skeleton */}
        <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
          {[...Array(5)].map((_, idx) => (
            <div key={idx} className="glass rounded-2xl p-5 border-white/5 relative overflow-hidden space-y-3">
              <div className="absolute top-0 left-0 w-full h-1 bg-indigo-500/30 shimmer-effect" />
              <div className={`${baseShimmer} h-3 w-1/2`} />
              <div className={`${baseShimmer} h-8 w-2/3`} />
              <div className={`${baseShimmer} h-3 w-1/3`} />
            </div>
          ))}
        </div>

        {/* Info Banner Alert Skeleton */}
        <div className="glass rounded-xl p-5 flex items-center space-x-3 border-white/5">
          <div className={`${baseShimmer} h-6 w-6 rounded-full`} />
          <div className={`${baseShimmer} h-4 flex-1`} />
        </div>

        {/* Fix Bias Action Skeleton */}
        <div className="glass rounded-2xl p-6 flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="space-y-2 flex-1 w-full">
            <div className={`${baseShimmer} h-5 w-1/4`} />
            <div className={`${baseShimmer} h-4 w-3/4`} />
          </div>
          <div className={`${baseShimmer} h-12 w-full md:w-44`} />
        </div>

        {/* Charts Row Skeleton */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Bar Chart Container Skeleton */}
          <div className="glass rounded-2xl p-6 space-y-6">
            <div className={`${baseShimmer} h-4 w-1/3`} />
            <div className="space-y-4">
              {[...Array(4)].map((_, idx) => (
                <div key={idx} className="flex items-center space-x-4">
                  <div className={`${baseShimmer} h-4 w-16`} />
                  <div className={`${baseShimmer} h-6 flex-1`} style={{ width: `${85 - idx * 15}%` }} />
                </div>
              ))}
            </div>
          </div>
          
          {/* Radar Chart Container Skeleton */}
          <div className="glass rounded-2xl p-6 flex flex-col items-center justify-center space-y-4">
            <div className={`${baseShimmer} h-4 w-1/3 align-self-start self-start`} />
            <div className={`${baseShimmer} h-48 w-48 rounded-full border border-white/5 flex items-center justify-center`}>
              <div className="h-32 w-32 rounded-full border border-white/5 flex items-center justify-center">
                <div className="h-16 w-16 rounded-full border border-white/5" />
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // General vertical listing
  return (
    <div className="space-y-4 w-full">
      {[...Array(count)].map((_, idx) => (
        <div key={idx} className="glass rounded-2xl p-6 border-white/5 space-y-3">
          <div className={`${baseShimmer} h-4 w-1/3`} />
          <div className={`${baseShimmer} h-3 w-3/4`} />
          <div className={`${baseShimmer} h-3 w-1/2`} />
        </div>
      ))}
    </div>
  );
}

import React from 'react';

const MapLegend = ({ activeLayer }) => {
  if (activeLayer === 'heatmap') {
    return (
      <div className="absolute bottom-4 right-4 z-[1000] bg-white dark:bg-slate-800 rounded-xl shadow-lg border border-gray-200 dark:border-slate-700 p-4">
        <h4 className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-2">Complaint Density</h4>
        <div className="flex items-center gap-2 text-xs text-gray-600 dark:text-gray-300">
          <span>Low</span>
          <div className="w-24 h-3 rounded-full bg-gradient-to-r from-blue-500 via-lime-500 to-red-500 opacity-80" />
          <span>High</span>
        </div>
      </div>
    );
  }

  if (activeLayer === 'violations') {
    return (
      <div className="absolute bottom-4 right-4 z-[1000] bg-white dark:bg-slate-800 rounded-xl shadow-lg border border-gray-200 dark:border-slate-700 p-4">
        <h4 className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-3">Violation Priority</h4>
        <div className="space-y-2">
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-full bg-red-500 shadow-sm" />
            <span className="text-xs text-gray-600 dark:text-gray-300">Critical / High</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-full bg-orange-500 shadow-sm" />
            <span className="text-xs text-gray-600 dark:text-gray-300">Medium</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-full bg-yellow-500 shadow-sm" />
            <span className="text-xs text-gray-600 dark:text-gray-300">Low</span>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="absolute bottom-4 right-4 z-[1000] bg-white dark:bg-slate-800 rounded-xl shadow-lg border border-gray-200 dark:border-slate-700 p-4">
      <h4 className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-3">Property Status</h4>
      <div className="space-y-2">
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 rounded-full bg-blue-500 shadow-sm" />
          <span className="text-xs text-gray-600 dark:text-gray-300">Registered Property</span>
        </div>
      </div>
    </div>
  );
};

export default MapLegend;

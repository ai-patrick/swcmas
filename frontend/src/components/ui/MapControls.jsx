import React from 'react';
import { Layers, ThermometerSun, AlertTriangle, Building2 } from 'lucide-react';

const MapControls = ({ activeLayer, setActiveLayer }) => {
  const layers = [
    { id: 'apartments', label: 'Properties', icon: Building2, color: 'text-blue-500' },
    { id: 'violations', label: 'Violations', icon: AlertTriangle, color: 'text-red-500' },
    { id: 'heatmap', label: 'Heatmap', icon: ThermometerSun, color: 'text-orange-500' },
  ];

  return (
    <div className="absolute top-4 right-4 z-[1000] bg-white dark:bg-slate-800 rounded-xl shadow-lg border border-gray-200 dark:border-slate-700 p-2 space-y-1">
      <div className="px-3 py-2 border-b border-gray-100 dark:border-slate-700 mb-2">
        <h4 className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider flex items-center gap-2">
          <Layers className="w-4 h-4" /> Map Layers
        </h4>
      </div>
      
      {layers.map((layer) => {
        const Icon = layer.icon;
        const isActive = activeLayer === layer.id;
        
        return (
          <button
            key={layer.id}
            onClick={() => setActiveLayer(layer.id)}
            className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg text-sm transition-colors ${
              isActive 
                ? 'bg-brand-50 dark:bg-brand-500/20 text-brand-700 dark:text-brand-300 font-medium' 
                : 'text-gray-600 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-slate-700'
            }`}
          >
            <Icon className={`w-4 h-4 ${isActive ? layer.color : 'text-gray-400'}`} />
            {layer.label}
            {isActive && (
              <div className="ml-auto w-2 h-2 rounded-full bg-brand-500 shadow-sm" />
            )}
          </button>
        );
      })}
    </div>
  );
};

export default MapControls;

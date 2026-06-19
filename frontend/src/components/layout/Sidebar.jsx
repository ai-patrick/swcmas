import React from 'react';
import { NavLink } from 'react-router-dom';
import { useAuth } from '@/context/AuthContext.jsx';
import { 
  LayoutDashboard, 
  Map as MapIcon, 
  Bell, 
  Users, 
  Building2, 
  Truck, 
  AlertTriangle, 
  BarChart3, 
  FileWarning,
  CheckSquare,
  Shield
} from 'lucide-react';

const getMenuItems = (role) => {
  const base = [
    { to: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { to: '/maps', label: 'Live Map', icon: MapIcon },
    { to: '/notifications', label: 'Notifications', icon: Bell },
  ];

  switch (role) {
    case 'county_admin':
      return [
        ...base,
        { to: '/users', label: 'Users', icon: Users },
        { to: '/apartments', label: 'Apartments', icon: Building2 },
        { to: '/collections', label: 'Collections', icon: Truck },
        { to: '/complaints', label: 'Complaints', icon: FileWarning },
        { to: '/reports', label: 'Analytics', icon: BarChart3 },
        { to: '/anomalies', label: 'Anomalies', icon: AlertTriangle },
        { to: '/audit', label: 'Audit Logs', icon: Shield },
      ];
    case 'county_officer':
      return [
        ...base, 
        { to: '/complaints', label: 'Complaints', icon: FileWarning }, 
        { to: '/reports', label: 'Reports', icon: BarChart3 }, 
        { to: '/anomalies', label: 'Anomalies', icon: AlertTriangle }
      ];
    case 'landlord':
      return [
        ...base, 
        { to: '/apartments', label: 'My Properties', icon: Building2 }, 
        { to: '/collections', label: 'Collections', icon: Truck }
      ];
    case 'waste_collector':
      return [
        ...base, 
        { to: '/collections', label: 'My Routes', icon: Truck }
      ];
    case 'resident':
      return [
        ...base, 
        { to: '/complaints', label: 'My Complaints', icon: FileWarning }, 
        { to: '/verifications', label: 'Verifications', icon: CheckSquare }
      ];
    default:
      return base;
  }
};

const Sidebar = () => {
  const { user } = useAuth();
  const role = user?.role || '';
  const menuItems = getMenuItems(role);

  return (
    <aside className="w-64 glass-panel border-r-0 z-20 m-4 mr-0 rounded-2xl flex flex-col h-[calc(100vh-2rem)] transition-all duration-300">
      <div className="p-6 flex items-center justify-center border-b border-gray-200/50 dark:border-slate-700/50">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-brand-500 to-emerald-400 flex items-center justify-center shadow-lg shadow-brand-500/30">
            <span className="text-white font-bold text-xl tracking-tighter">SW</span>
          </div>
          <span className="text-xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-gray-900 to-gray-600 dark:from-white dark:to-gray-300 tracking-tight">
            SWCMAS
          </span>
        </div>
      </div>

      <nav className="flex-1 overflow-y-auto py-6 px-4 scrollbar-hide">
        <div className="space-y-1">
          {menuItems.map((item) => {
            const Icon = item.icon;
            return (
              <NavLink
                key={item.to}
                to={item.to}
                className={({ isActive }) =>
                  `flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 group ${
                    isActive
                      ? 'bg-brand-50 dark:bg-brand-500/10 text-brand-600 dark:text-brand-400 font-medium'
                      : 'text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-slate-800/50 hover:text-gray-900 dark:hover:text-gray-200'
                  }`
                }
              >
                {({ isActive }) => (
                  <>
                    <Icon 
                      className={`w-5 h-5 transition-colors ${
                        isActive 
                          ? 'text-brand-500 dark:text-brand-400' 
                          : 'text-gray-400 group-hover:text-gray-600 dark:group-hover:text-gray-300'
                      }`} 
                    />
                    <span>{item.label}</span>
                    {isActive && (
                      <div className="ml-auto w-1.5 h-5 bg-brand-500 rounded-full animate-fade-in" />
                    )}
                  </>
                )}
              </NavLink>
            );
          })}
        </div>
      </nav>
      
      {/* Abstract decorative element at bottom of sidebar */}
      <div className="mt-auto p-4 opacity-60">
         <div className="h-24 rounded-xl bg-gradient-to-br from-brand-500/10 to-emerald-400/5 dark:from-brand-500/5 dark:to-emerald-400/5 border border-brand-500/10 flex items-center justify-center overflow-hidden relative">
            <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjAiIGhlaWdodD0iMjAiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+PGNpcmNsZSBjeD0iMiIgY3k9IjIiIHI9IjEiIGZpbGw9IiMyMmQzZWUiIGZpbGwtb3BhY2l0eT0iMC4yIi8+PC9zdmc+')] [mask-image:linear-gradient(to_bottom,white,transparent)]"></div>
            <p className="text-xs text-center text-gray-500 dark:text-gray-400 relative z-10 px-2">
              <span className="block font-semibold mb-1 text-brand-600 dark:text-brand-400">AI Powered</span>
              Compliance & Monitoring
            </p>
         </div>
      </div>
    </aside>
  );
};

export default Sidebar;

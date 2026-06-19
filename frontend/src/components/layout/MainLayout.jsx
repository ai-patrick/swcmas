import React from 'react';
import Header from '@/components/layout/Header.jsx';
import Sidebar from '@/components/layout/Sidebar.jsx';

const MainLayout = ({ children }) => (
  <div className="flex h-screen w-full bg-var(--bg-main) dark:bg-var(--bg-main) overflow-hidden relative">
    {/* Abstract Background Elements */}
    <div className="absolute top-[-10%] left-[-10%] w-96 h-96 bg-brand-400 rounded-full mix-blend-multiply filter blur-3xl opacity-20 dark:opacity-10 animate-blob"></div>
    <div className="absolute top-[20%] right-[-5%] w-72 h-72 bg-emerald-300 rounded-full mix-blend-multiply filter blur-3xl opacity-20 dark:opacity-10 animate-blob animation-delay-2000"></div>
    <div className="absolute bottom-[-10%] left-[20%] w-80 h-80 bg-blue-300 rounded-full mix-blend-multiply filter blur-3xl opacity-20 dark:opacity-10 animate-blob animation-delay-4000"></div>

    <Sidebar />
    <div className="flex flex-col flex-1 min-w-0 z-10 relative">
      <Header />
      <main className="flex-1 overflow-y-auto p-6 scrollbar-thin scrollbar-thumb-gray-300 dark:scrollbar-thumb-slate-700 animate-fade-in relative z-10">
        <div className="mx-auto max-w-7xl">
          {children}
        </div>
      </main>
    </div>
  </div>
);

export default MainLayout;

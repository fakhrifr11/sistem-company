"use client";

import React, { useState, useEffect, Suspense } from 'react';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Briefcase, FileText, PieChart, 
  Menu, X, Search, Bell, LogOut, User 
} from 'lucide-react';

function DashboardContent({ children }: { children: React.ReactNode }) {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const searchParams = useSearchParams();
  const activeMenu = searchParams.get('menu') || 'Pekerjaan'; // Default ke Job List

  useEffect(() => {
    setIsMobileMenuOpen(false);
  }, [activeMenu]);

  const handleLogout = () => {
    localStorage.removeItem("userSession");
    document.cookie = "isLoggedIn=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT";
    window.location.href = "/login";
  };

  const menuItems = [
    { name: "Job List", icon: Briefcase, id: "Pekerjaan" }, 
    { name: "Invoices", icon: FileText, id: "Invoice" },
    { name: "Analisis", icon: PieChart, id: "Analisis" },
  ];

  return (
    // Menggunakan background gradasi statis yang super ringan namun tetap elegan
    <div className="flex min-h-screen bg-gradient-to-br from-slate-50 via-[#F1F5F9] to-blue-50/50 relative overflow-hidden font-sans text-slate-800 z-0">
      
      {/* Overlay Gelap HP (Tetap dipertahankan karena ringan dan penting untuk UX) */}
      <AnimatePresence>
        {isMobileMenuOpen && (
          <motion.div 
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} 
            onClick={() => setIsMobileMenuOpen(false)}
            className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm z-40 lg:hidden"
          />
        )}
      </AnimatePresence>

      {/* Sidebar Kiri */}
      <aside className={`fixed inset-y-0 left-0 z-50 w-72 transform transition-transform duration-300 ease-in-out lg:translate-x-0 lg:static lg:inset-auto lg:flex ${isMobileMenuOpen ? "translate-x-0" : "-translate-x-full"}`}>
        <div className="h-full w-full bg-white lg:rounded-3xl border border-slate-200/60 shadow-xl flex flex-col p-6 m-0 lg:my-4 lg:ml-4">
          
          <div className="flex items-center justify-between mb-10">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-gradient-to-br from-blue-700 to-blue-500 rounded-xl shadow-md shadow-blue-500/20 flex items-center justify-center">
                <Briefcase className="text-white w-6 h-6" />
              </div>
              <span className="text-2xl font-extrabold bg-clip-text text-transparent bg-gradient-to-r from-blue-950 to-blue-700">
                SistemCo
              </span>
            </div>
            <button className="lg:hidden text-slate-400 hover:bg-slate-100 p-2 rounded-full" onClick={() => setIsMobileMenuOpen(false)}>
              <X className="w-5 h-5" />
            </button>
          </div>
          
          <nav className="flex-1 space-y-3">
            {menuItems.map((item) => {
              const isActive = activeMenu === item.id;
              return (
                <Link key={item.name} href={`/dashboard?menu=${item.id}`}>
                  <div className={`flex items-center gap-4 px-4 py-3 rounded-2xl transition-all duration-200 relative overflow-hidden ${
                    isActive 
                      ? "text-blue-700 font-bold bg-blue-50 border border-blue-100 shadow-sm" 
                      : "text-slate-500 hover:bg-slate-50 hover:text-blue-600 font-semibold"
                  }`}>
                    <item.icon className={`w-5 h-5 ${isActive ? "text-blue-600" : ""}`} />
                    <span>{item.name}</span>
                  </div>
                </Link>
              );
            })}
          </nav>
          
          <button onClick={handleLogout} className="mt-auto flex items-center justify-center gap-3 p-3 rounded-2xl text-red-500 bg-red-50/50 border border-red-100 hover:bg-red-500 hover:text-white hover:shadow-md transition-all font-bold group">
             <LogOut className="w-5 h-5 group-hover:-translate-x-1 transition-transform"/> Keluar
          </button>
        </div>
      </aside>

      {/* Area Kanan (Header & Konten) */}
      <div className="flex-1 flex flex-col min-w-0 h-screen overflow-hidden relative z-10">
        <header className="sticky top-0 z-30 lg:pt-4 lg:px-6">
          <div className="bg-white/80 backdrop-blur-md lg:rounded-3xl border-b lg:border border-slate-200/60 shadow-sm px-4 py-3 flex items-center justify-between">
            <div className="flex items-center gap-3 lg:hidden">
              <button onClick={() => setIsMobileMenuOpen(true)} className="p-2 bg-white rounded-xl shadow-sm text-slate-600 active:scale-95 transition-transform border border-slate-200">
                <Menu className="w-6 h-6" />
              </button>
            </div>
            <div className="hidden lg:flex items-center bg-slate-50 rounded-full px-5 py-2.5 border border-slate-200 focus-within:ring-2 ring-blue-500/20 transition-all w-96 shadow-inner">
              <Search className="w-4 h-4 text-slate-400 mr-3" />
              <input type="text" placeholder="Cari data..." className="bg-transparent border-none outline-none w-full text-sm text-slate-700 font-medium placeholder:text-slate-400" />
            </div>
            <div className="flex items-center gap-4 ml-auto">
              <button className="relative p-2 text-slate-500 hover:bg-slate-100 rounded-full transition-colors hidden sm:block border border-transparent">
                <Bell className="w-5 h-5" />
                <span className="absolute top-1 right-1 w-2.5 h-2.5 bg-red-500 rounded-full border-2 border-white"></span>
              </button>
              <div className="flex items-center gap-3 sm:border-l border-slate-200 sm:pl-4">
                <div className="hidden md:block text-right">
                  <p className="text-sm font-bold text-blue-950">Bos Besar</p>
                  <p className="text-xs text-blue-600 font-bold tracking-wide uppercase">Admin</p>
                </div>
                <div className="w-10 h-10 rounded-full bg-gradient-to-tr from-blue-600 to-blue-400 border-2 border-white shadow-sm flex items-center justify-center overflow-hidden">
                  <User className="text-white w-5 h-5" />
                </div>
              </div>
            </div>
          </div>
        </header>

        <main className="flex-1 overflow-x-hidden overflow-y-auto p-4 lg:p-6 pb-24 scroll-smooth">
          {/* Animasi perpindahan halaman disederhanakan agar lebih ringan (hanya fade in) */}
          <motion.div
            key={activeMenu}
            initial={{ opacity: 0, y: 5 }} 
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.2 }}
            className="h-full max-w-7xl mx-auto"
          >
            {children}
          </motion.div>
        </main>
      </div>
    </div>
  );
}

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  return (
    <Suspense fallback={<div className="min-h-screen flex items-center justify-center bg-slate-50 text-blue-600 font-bold">Memuat Tampilan...</div>}>
      <DashboardContent>{children}</DashboardContent>
    </Suspense>
  );
}
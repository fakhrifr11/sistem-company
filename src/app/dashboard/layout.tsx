"use client";

import React, { useState, useEffect, Suspense } from 'react';
import Link from 'next/link';
import { useSearchParams, useRouter } from 'next/navigation';
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
    <div className="flex min-h-screen bg-[#F1F5F9] relative overflow-hidden font-sans text-slate-800 z-0">
      
      {/* =========================================================
          BACKGROUND ANIMASI BANGUN RUANG ABSTRAK (FRAMER MOTION)
          ========================================================= */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden z-0">
        
        {/* 1. Bola Raksasa Melayang (Kiri Atas) */}
        <motion.div 
          animate={{ 
            y: [0, -30, 0], 
            x: [0, 20, 0],
            scale: [1, 1.05, 1] 
          }}
          transition={{ duration: 12, repeat: Infinity, ease: "easeInOut" }}
          className="absolute -top-[15%] -left-[10%] w-[40rem] h-[40rem] bg-gradient-to-br from-blue-400/20 to-blue-200/10 rounded-full blur-[80px]"
        />

        {/* 2. Kubus Melengkung (Squircle) Berputar (Kanan Atas) */}
        <motion.div 
          animate={{ 
            rotate: [0, 90, 180, 270, 360],
            scale: [1, 1.1, 1]
          }}
          transition={{ duration: 25, repeat: Infinity, ease: "linear" }}
          className="absolute top-[10%] -right-[15%] w-[35rem] h-[35rem] bg-gradient-to-tr from-cyan-400/15 to-sky-300/20 rounded-[8rem] blur-[60px]"
        />

        {/* 3. Kapsul Abstrak Melayang Vertikal (Kiri Bawah) */}
        <motion.div 
          animate={{ 
            y: [0, 50, 0],
            rotate: [-15, 0, -15] 
          }}
          transition={{ duration: 15, repeat: Infinity, ease: "easeInOut" }}
          className="absolute -bottom-[20%] left-[10%] w-[25rem] h-[40rem] bg-gradient-to-t from-indigo-300/15 to-blue-400/10 rounded-full blur-[70px] transform -rotate-12"
        />

        {/* 4. Segitiga Halus Berputar Pelan (Tengah Kanan) */}
        <motion.div 
          animate={{ 
            rotate: [360, 270, 180, 90, 0],
            x: [0, -30, 0]
          }}
          transition={{ duration: 30, repeat: Infinity, ease: "linear" }}
          className="absolute bottom-[20%] right-[10%] w-[20rem] h-[20rem] bg-sky-200/20 rounded-[5rem] blur-[50px]"
        />
        
        {/* Lapisan Grid Transparan (Memberikan tekstur premium) */}
        <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-[0.03] mix-blend-overlay"></div>
      </div>
      {/* ========================================================= */}

      {/* Overlay Gelap HP */}
      <AnimatePresence>
        {isMobileMenuOpen && (
          <motion.div 
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} 
            onClick={() => setIsMobileMenuOpen(false)}
            className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm z-40 lg:hidden"
          />
        )}
      </AnimatePresence>

      {/* Sidebar Kiri - Z-index dipastikan lebih tinggi dari animasi */}
      <aside className={`fixed inset-y-0 left-0 z-50 w-72 transform transition-transform duration-300 ease-in-out lg:translate-x-0 lg:static lg:inset-auto lg:flex ${isMobileMenuOpen ? "translate-x-0" : "-translate-x-full"}`}>
        <div className="h-full w-full bg-white/70 backdrop-blur-2xl lg:rounded-3xl border border-white/60 shadow-[0_8px_30px_rgb(0,0,0,0.04)] flex flex-col p-6 m-0 lg:my-4 lg:ml-4">
          
          <div className="flex items-center justify-between mb-10">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-gradient-to-br from-blue-700 to-cyan-500 rounded-xl shadow-lg shadow-blue-500/30 flex items-center justify-center">
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
                  <div className={`flex items-center gap-4 px-4 py-3 rounded-2xl transition-all duration-300 relative overflow-hidden ${
                    isActive 
                      ? "text-white font-bold tracking-wide shadow-lg shadow-blue-500/20" 
                      : "text-slate-500 hover:bg-white/60 hover:text-blue-700 font-semibold"
                  }`}>
                    {/* Background indicator menu aktif */}
                    {isActive && (
                      <motion.div 
                        layoutId="activeTab"
                        className="absolute inset-0 bg-gradient-to-r from-blue-600 to-blue-500 rounded-2xl z-0"
                        transition={{ type: "spring", stiffness: 300, damping: 30 }}
                      />
                    )}
                    <item.icon className={`w-5 h-5 relative z-10 ${isActive ? "text-white" : ""}`} />
                    <span className="relative z-10">{item.name}</span>
                  </div>
                </Link>
              );
            })}
          </nav>
          
          <button onClick={handleLogout} className="mt-auto flex items-center justify-center gap-3 p-3 rounded-2xl text-red-500 bg-red-50/50 border border-red-100 hover:bg-red-500 hover:text-white hover:shadow-lg transition-all font-bold group">
             <LogOut className="w-5 h-5 group-hover:-translate-x-1 transition-transform"/> Keluar
          </button>
        </div>
      </aside>

      {/* Area Kanan (Header & Konten) */}
      <div className="flex-1 flex flex-col min-w-0 h-screen overflow-hidden relative z-10">
        <header className="sticky top-0 z-30 lg:pt-4 lg:px-6">
          <div className="bg-white/60 backdrop-blur-xl lg:rounded-3xl border-b lg:border border-white/50 shadow-[0_4px_20px_rgb(0,0,0,0.03)] px-4 py-3 flex items-center justify-between">
            <div className="flex items-center gap-3 lg:hidden">
              <button onClick={() => setIsMobileMenuOpen(true)} className="p-2 bg-white/80 rounded-xl shadow-sm text-slate-600 active:scale-95 transition-transform border border-white">
                <Menu className="w-6 h-6" />
              </button>
            </div>
            <div className="hidden lg:flex items-center bg-white/50 rounded-full px-5 py-2.5 border border-white/60 focus-within:ring-2 ring-blue-500/20 transition-all w-96 shadow-inner">
              <Search className="w-4 h-4 text-slate-400 mr-3" />
              <input type="text" placeholder="Cari data..." className="bg-transparent border-none outline-none w-full text-sm text-slate-700 font-medium placeholder:text-slate-400" />
            </div>
            <div className="flex items-center gap-4 ml-auto">
              <button className="relative p-2 text-slate-500 hover:bg-white/80 rounded-full transition-colors hidden sm:block border border-transparent hover:border-white">
                <Bell className="w-5 h-5" />
                <span className="absolute top-1 right-1 w-2.5 h-2.5 bg-red-500 rounded-full border-2 border-white"></span>
              </button>
              <div className="flex items-center gap-3 sm:border-l border-slate-200/60 sm:pl-4">
                <div className="hidden md:block text-right">
                  <p className="text-sm font-bold text-blue-950">Bos Besar</p>
                  <p className="text-xs text-blue-600 font-bold tracking-wide uppercase">Admin</p>
                </div>
                <div className="w-10 h-10 rounded-full bg-gradient-to-tr from-blue-500 to-cyan-400 border-2 border-white shadow-md flex items-center justify-center overflow-hidden">
                  <User className="text-white w-5 h-5" />
                </div>
              </div>
            </div>
          </div>
        </header>

        <main className="flex-1 overflow-x-hidden overflow-y-auto p-4 lg:p-6 pb-24 scroll-smooth">
          <motion.div
            key={activeMenu}
            initial={{ opacity: 0, scale: 0.98, filter: "blur(4px)" }} 
            animate={{ opacity: 1, scale: 1, filter: "blur(0px)" }}
            transition={{ duration: 0.4, ease: "easeOut" }}
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
    <Suspense fallback={<div className="min-h-screen flex items-center justify-center bg-[#F1F5F9] text-blue-600 font-bold">Memuat Tampilan...</div>}>
      <DashboardContent>{children}</DashboardContent>
    </Suspense>
  );
}
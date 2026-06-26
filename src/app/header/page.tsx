// app/header/page.tsx
"use client";
import { motion, AnimatePresence } from "framer-motion";
import { useState, useEffect } from "react";
import { LogOut, User as UserIcon, Cloud } from "lucide-react";
import { useRouter } from "next/navigation";

export default function Header() {
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const router = useRouter();
  
  // State untuk menyimpan data akun yang sedang login
  const [userData, setUserData] = useState({
    name: "Loading...",
    email: "Loading...",
    initials: "-"
  });

  // Mengambil data user (Versi Tanpa Supabase / Dummy Sementara)
  useEffect(() => {
    // Ambil data user yang disimpan saat login tadi
    const sessionString = localStorage.getItem("userSession");
    
    if (sessionString) {
      const user = JSON.parse(sessionString);
      const initials = user.name.substring(0, 2).toUpperCase();

      setUserData({
        name: user.name,
        email: user.email,
        initials: initials
      });
    } else {
      // Jika tidak ada sesi, paksa kembali ke login
      router.push("/login");
    }
  }, [router]);

  const handleLogout = () => {
    // Hapus data sesi lalu tendang ke halaman login
    localStorage.removeItem("userSession");
    router.push("/login");
  };
  //===========================================

  return (
    <motion.header
      initial={{ y: -100, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ type: "spring", stiffness: 100, damping: 20 }}
      className="w-full px-8 py-4 bg-white/30 backdrop-blur-md border-b border-white/40 shadow-sm fixed top-0 z-50 flex justify-between items-center font-sans"
    >
      {/* Bagian Kiri: Logo dan Nama Sistem */}
      <div className="flex items-center gap-3">
        <motion.div
          animate={{ y: [0, -4, 0] }}
          transition={{ repeat: Infinity, duration: 3, ease: "easeInOut" }}
          className="bg-gradient-to-br from-white to-blue-200 p-2.5 rounded-xl shadow-inner border border-white/60"
        >
          <Cloud className="w-7 h-7 text-blue-500 fill-blue-500/20" />
        </motion.div>
        <div className="flex flex-col justify-center">
          <h1 className="text-2xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-blue-700 to-cyan-500 drop-shadow-sm leading-none tracking-tight">
            Sistem
          </h1>
          <h2 className="text-[11px] font-black text-blue-900/70 tracking-[0.2em] uppercase leading-none mt-1">
            Company
          </h2>
        </div>
      </div>

      {/* Bagian Kanan: Akun dan Dropdown Logout */}
      <div className="relative">
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={() => setIsDropdownOpen(!isDropdownOpen)}
          className="flex items-center gap-2 bg-white/50 hover:bg-white/70 border border-white/60 p-1.5 rounded-full transition-colors shadow-sm focus:outline-none"
        >
          {/* Inisial Profil Otomatis */}
          <div className="w-10 h-10 rounded-full bg-gradient-to-tr from-blue-500 to-cyan-400 flex items-center justify-center text-white font-bold shadow-inner border border-white/50 tracking-wider">
            {userData.initials}
          </div>
        </motion.button>

        {/* Animasi Dropdown */}
        <AnimatePresence>
          {isDropdownOpen && (
            <motion.div
              initial={{ opacity: 0, y: 15, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 15, scale: 0.95 }}
              transition={{ duration: 0.2 }}
              className="absolute right-0 mt-3 w-48 bg-white/90 backdrop-blur-xl rounded-2xl shadow-xl border border-white/50 overflow-hidden"
            >
              <div className="p-4 border-b border-blue-100/50 bg-gradient-to-br from-white to-blue-50/50">
                {/* Menampilkan Nama dan Email Aktif */}
                <p className="text-sm font-bold text-blue-900 truncate" title={userData.name}>{userData.name}</p>
                <p className="text-xs text-blue-600/70 truncate" title={userData.email}>{userData.email}</p>
              </div>
              <div className="p-2">
                <button
                  onClick={handleLogout}
                  className="w-full flex items-center gap-3 px-3 py-2.5 text-sm font-semibold text-red-500 hover:bg-red-50 hover:text-red-600 rounded-xl transition-all mt-1"
                >
                  <LogOut className="w-4 h-4" />
                  Keluar
                </button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </motion.header>
  );
}
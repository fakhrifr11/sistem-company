// components/CloudBackground.tsx
"use client";
import { motion } from "framer-motion";

export default function CloudBackground({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-100 via-sky-300 to-blue-500 relative overflow-hidden font-sans">
      {/* Awan Animasi */}
      <motion.div
        animate={{ x: [0, 1000, 0] }}
        transition={{ repeat: Infinity, duration: 40, ease: "linear" }}
        className="absolute top-10 left-[-200px] opacity-60 text-white"
      >
        <svg width="150" height="100" viewBox="0 0 24 24" fill="currentColor"><path d="M17.5 19c-2.485 0-4.5-2.015-4.5-4.5 0-.173.01-.343.03-.51C12.42 14.17 12 14.5 11.5 14.5c-1.38 0-2.5-1.12-2.5-2.5 0-.85.427-1.6 1.077-2.05-.18-.42-.277-.88-.277-1.35 0-1.933 1.567-3.5 3.5-3.5 1.517 0 2.81 1.008 3.32 2.38.384-.19.81-.28 1.28-.28 1.657 0 3 1.343 3 3 0 .285-.04.56-.11.82 1.4.38 2.41 1.69 2.41 3.28 0 1.93-1.57 3.5-3.5 3.5h-2.2z"/></svg>
      </motion.div>
      
      <motion.div
        animate={{ x: [1000, -200, 1000] }}
        transition={{ repeat: Infinity, duration: 60, ease: "linear" }}
        className="absolute top-40 right-[-200px] opacity-40 text-white"
      >
        <svg width="250" height="150" viewBox="0 0 24 24" fill="currentColor"><path d="M17.5 19c-2.485 0-4.5-2.015-4.5-4.5 0-.173.01-.343.03-.51C12.42 14.17 12 14.5 11.5 14.5c-1.38 0-2.5-1.12-2.5-2.5 0-.85.427-1.6 1.077-2.05-.18-.42-.277-.88-.277-1.35 0-1.933 1.567-3.5 3.5-3.5 1.517 0 2.81 1.008 3.32 2.38.384-.19.81-.28 1.28-.28 1.657 0 3 1.343 3 3 0 .285-.04.56-.11.82 1.4.38 2.41 1.69 2.41 3.28 0 1.93-1.57 3.5-3.5 3.5h-2.2z"/></svg>
      </motion.div>

      {/* Konten Utama */}
      <div className="relative z-10 p-6 h-full flex flex-col justify-center items-center min-h-screen">
        {children}
      </div>
    </div>
  );
}
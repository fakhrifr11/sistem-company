// app/page.tsx
"use client";
import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useRouter } from "next/navigation";
import CloudBackground from "@/components/CloudBackground"; // Sesuaikan path jika perlu
import { supabase } from "@/utils/supabase";

export default function AuthPage() {
  const [isLogin, setIsLogin] = useState(true);

  //STATE BARU untuk menyimpan inputan user dan status loading/error
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [errorMsg, setErrorMsg] = useState("");
  const [isLoading, setIsLoading] = useState(false); 

  const router = useRouter();

  const handleAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(""); // Reset error message tiap kali tombol diklik
    setIsLoading(true);

    try {
      if (isLogin) {
        // PROSES LOGIN
        const { data, error } = await supabase.auth.signInWithPassword({
          email: email,
          password: password,
        });

        if (error) throw error;
        
        // Jika berhasil, langsung ke dashboard
        router.push("/dashboard");
        
      } else {
        // PROSES SIGN UP (Buat Akun)
        const { data, error } = await supabase.auth.signUp({
          email: email,
          password: password,
          options: {
            data: {
              full_name: fullName, // Menyimpan nama user ke database auth
            }
          }
        });

        if (error) throw error;
        
        alert("Pendaftaran berhasil! Silakan login.");
        // Kosongkan form dan ubah ke mode login
        setFullName("");
        setPassword("");
        setIsLogin(true);
      }
    } catch (error: any) {
      // Mengubah pesan error bawaan Supabase menjadi bahasa Indonesia yang ramah
      if (error.message === "Invalid login credentials") {
        setErrorMsg("Email atau password yang Anda masukkan salah.");
      } else if (error.message === "User already registered") {
        setErrorMsg("Email ini sudah terdaftar. Silakan login.");
      } else if (error.message.includes("Password should be at least")) {
        setErrorMsg("Password terlalu pendek (minimal 6 karakter).");
      } else {
        setErrorMsg(error.message); // Tampilkan error lainnya
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <CloudBackground>
      <motion.div
        initial={{ opacity: 0, y: -50 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="w-full max-w-md p-8 bg-white/30 backdrop-blur-md rounded-2xl shadow-xl border border-white/40"
      >
        <h1 className="text-3xl font-bold text-white text-center mb-6">
          Sistem Company
        </h1>
        
        <div className="flex bg-white/40 rounded-lg p-1 mb-6">
          <button
            onClick={() => { setIsLogin(true); setErrorMsg(""); }}
            className={`flex-1 py-2 rounded-md font-semibold transition-all ${isLogin ? "bg-white text-blue-600 shadow" : "text-white"}`}
          >
            Login
          </button>
          <button
            onClick={() => { setIsLogin(false); setErrorMsg(""); }}
            className={`flex-1 py-2 rounded-md font-semibold transition-all ${!isLogin ? "bg-white text-blue-600 shadow" : "text-white"}`}
          >
            Sign Up
          </button>
        </div>

        {/* // AREA PESAN ERROR  */}
        <AnimatePresence>
          {errorMsg && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="mb-4 p-3 bg-red-100/90 border border-red-300 text-red-600 text-sm font-semibold rounded-lg text-center"
            >
              {errorMsg}
            </motion.div>
          )}
        </AnimatePresence>

        <form onSubmit={handleAuth} className="space-y-4">
          <AnimatePresence mode="wait">
            {!isLogin && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: "auto" }}
                exit={{ opacity: 0, height: 0 }}
              >
                {/* Tambahan: value & onChange untuk Name */}
                <input
                  type="text"
                  placeholder="Nama Lengkap"
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  className="w-full p-3 rounded-lg bg-white/70 border-none outline-none focus:ring-2 focus:ring-blue-400 placeholder-gray-500"
                  required={!isLogin}
                />
              </motion.div>
            )}
          </AnimatePresence>

         {/* Tambahan: value & onChange untuk Email & Password */}
         <input
            type="email"
            placeholder="Email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="w-full p-3 rounded-lg bg-white/70 border-none outline-none focus:ring-2 focus:ring-blue-400 placeholder-gray-500"
            required
          />
          <input
            type="password"
            placeholder="Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="w-full p-3 rounded-lg bg-white/70 border-none outline-none focus:ring-2 focus:ring-blue-400 placeholder-gray-500"
            required
          />

          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            type="submit"
            disabled={isLoading}
            className={`w-full py-3 text-white rounded-lg font-bold shadow-lg transition-all ${
              isLoading 
                ? "bg-gray-400 cursor-not-allowed" 
                : "bg-gradient-to-r from-blue-500 to-cyan-400 hover:shadow-cyan-400/50"
            }`}
          >
            {isLoading 
              ? "Memproses..." 
              : isLogin ? "Masuk ke Dashboard" : "Daftar Sekarang"}
          </motion.button>
        </form>
      </motion.div>
    </CloudBackground>
  );
}
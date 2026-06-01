"use client";
import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import CloudBackground from "@/components/CloudBackground";
// Tambahan icon Send untuk Telegram
import { Plus, Edit, Trash2, Search, X, Check, Sun, Heart, ExternalLink, Send } from "lucide-react";
import Header from "@/app/header/page"; 
import { supabase } from "@/utils/supabase";

type ProjectData = {
  id: string;
  tglMasuk: string;
  tglKeluar: string;
  namaProject: string;
  keluhan: string;
  perbaikan: string;
  status: "Proses" | "Selesai";
  dokumentasi: string;
};

export default function Dashboard() {
  const [data, setData] = useState<ProjectData[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchData = async () => {
    setLoading(true);
    const { data: projects, error } = await supabase
      .from('projects')
      .select('*')
      .order('id', { ascending: true });

    if (error) {
      console.error("Gagal mengambil data:", error);
    } else if (projects) {
      const formattedData = projects.map((p) => ({
        id: p.id,
        tglMasuk: p.tgl_masuk,
        tglKeluar: p.tgl_keluar,
        namaProject: p.nama_project,
        keluhan: p.keluhan,
        perbaikan: p.perbaikan,
        status: p.status,
        dokumentasi: p.dokumentasi
      }));
      setData(formattedData);
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchData();
  }, []);
  
  const [filter, setFilter] = useState("");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [formData, setFormData] = useState<Partial<ProjectData>>({});
  
  const [editingId, setEditingId] = useState<string | null>(null);

  const filteredData = data.filter((item) =>
    item.namaProject.toLowerCase().includes(filter.toLowerCase()) ||
    item.status.toLowerCase().includes(filter.toLowerCase()) ||
    item.id.toLowerCase().includes(filter.toLowerCase())
  );

  const handleEditClick = (item: ProjectData) => {
    setEditingId(item.id);
    setFormData(item);
    setIsModalOpen(true);
  };

  // === FUNGSI BARU UNTUK MENGIRIM KE TELEGRAM ===
  const handleSendTelegram = async (item: ProjectData) => {
    // PENTING: Ganti dengan Token Bot dan Chat ID milikmu
    // Disarankan menyimpannya di file .env (process.env.NEXT_PUBLIC_TELEGRAM_BOT_TOKEN)
    const BOT_TOKEN = "8941562735:AAHU-uqsTYODZwE3DF0343HsZh_ih2Ry4iI"; 
    const CHAT_ID = "-1003752685844"; 

    // Format pesan yang akan dikirim (menggunakan Markdown agar rapi)
    const message = `
📋 *Detail Project Job List* 📋

*ID:* ${item.id}
*Nama Project:* ${item.namaProject}
*Status:* ${item.status === "Selesai" ? "🟢" : "🟡"} ${item.status}
*Tgl Masuk:* ${item.tglMasuk}
*Tgl Keluar:* ${item.tglKeluar}

*Keluhan:*
_${item.keluhan}_

*Perbaikan:*
_${item.perbaikan || "-"}_

*Dokumentasi:*
${item.dokumentasi || "-"}
    `;

    try {
      const response = await fetch(`https://api.telegram.org/bot${BOT_TOKEN}/sendMessage`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          chat_id: CHAT_ID,
          text: message,
          parse_mode: "Markdown",
        }),
      });

      if (response.ok) {
        alert("Berhasil! Data telah dikirim ke Telegram.");
      } else {
        alert("Gagal mengirim data ke Telegram.");
      }
    } catch (error) {
      console.error("Telegram error:", error);
      alert("Terjadi kesalahan saat menghubungi Telegram API.");
    }
  };
  // ==============================================

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (editingId) {
      const { error } = await supabase
        .from('projects')
        .update({
          tgl_masuk: formData.tglMasuk,
          tgl_keluar: formData.tglKeluar,
          nama_project: formData.namaProject,
          keluhan: formData.keluhan,
          perbaikan: formData.perbaikan,
          status: formData.status,
          dokumentasi: formData.dokumentasi
        })
        .eq('id', editingId);

      if (error) {
        alert("Gagal mengupdate data: " + error.message);
      } else {
        setIsModalOpen(false);
        setFormData({});
        setEditingId(null);
        fetchData();
      }
    } else {
      const newId = `PRJ-00${data.length + 1}`;
      const { error } = await supabase
        .from('projects')
        .insert([
          {
            id: newId,
            tgl_masuk: formData.tglMasuk || "-",
            tgl_keluar: formData.tglKeluar || "-",
            nama_project: formData.namaProject,
            keluhan: formData.keluhan,
            perbaikan: formData.perbaikan || "",
            status: formData.status || "Proses",
            dokumentasi: formData.dokumentasi || "",
          }
        ]);

      if (error) {
        alert("Gagal menyimpan: " + error.message);
      } else {
        setIsModalOpen(false);
        setFormData({});
        fetchData(); 
      }
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Yakin ingin menghapus project ini?")) return;
    
    const { error } = await supabase
      .from('projects')
      .delete()
      .eq('id', id);

    if (error) {
      alert("Gagal menghapus data: " + error.message);
    } else {
      fetchData(); 
    }
  };

  const handleToggleStatus = async (id: string, currentStatus: string) => {
    const today = new Date().toISOString().split('T')[0];
    const isProses = currentStatus === "Proses";
    
    const newStatus = isProses ? "Selesai" : "Proses";
    const newTglKeluar = isProses ? today : "-";

    const { error } = await supabase
      .from('projects')
      .update({ status: newStatus, tgl_keluar: newTglKeluar })
      .eq('id', id);

    if (error) {
      alert("Gagal merubah status: " + error.message);
    } else {
      fetchData(); 
    }
  };

  return (
    <CloudBackground>
      <Header /> 
      
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        className="w-full max-w-7xl mt-24 bg-white/70 backdrop-blur-xl rounded-3xl shadow-2xl overflow-hidden border border-white/50"
      >
        <div className="p-8">
          <div className="flex justify-between items-center mb-8">
            <h1 className="text-3xl font-extrabold text-blue-900">Data Job List</h1>
            
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500 w-5 h-5" />
              <input
                type="text"
                placeholder="Cari project, ID, atau status..."
                value={filter}
                onChange={(e) => setFilter(e.target.value)}
                className="pl-10 pr-4 py-2 rounded-full bg-white border-2 border-blue-200 outline-none focus:border-blue-500 shadow-sm min-w-[250px]"
              />
            </div>
          </div>

          <div className="overflow-x-auto rounded-xl border border-blue-100 bg-white/60 mb-6">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-blue-500 text-white">
                  <th className="p-4">ID</th>
                  <th className="p-4 whitespace-nowrap">Tgl Masuk</th>
                  <th className="p-4 whitespace-nowrap">Tgl Keluar</th>
                  <th className="p-4 min-w-[150px]">Nama Project</th>
                  <th className="p-4 min-w-[200px]">Keluhan</th>
                  <th className="p-4 min-w-[200px]">Perbaikan</th>
                  <th className="p-4">Status</th>
                  <th className="p-4">Dokumentasi</th>
                  <th className="p-4 min-w-[180px]">Aksi</th>
                </tr>
              </thead>
              <tbody>
                <AnimatePresence>
                  {filteredData.map((item, index) => (
                    <motion.tr
                      key={item.id}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, x: -20 }}
                      transition={{ delay: index * 0.05 }}
                      className="border-b border-blue-100 hover:bg-blue-50/50"
                    >
                      <td className="p-4 font-semibold text-blue-800">{item.id}</td>
                      <td className="p-4 text-gray-700">{item.tglMasuk}</td>
                      <td className="p-4 text-gray-700 font-medium">{item.tglKeluar}</td>
                      <td className="p-4 text-gray-800 font-medium">{item.namaProject}</td>
                      <td className="p-4 text-gray-600">{item.keluhan}</td>
                      <td className="p-4 text-gray-600">{item.perbaikan}</td>
                      <td className="p-4">
                        <span className={`px-3 py-1 rounded-full text-sm font-bold ${item.status === 'Selesai' ? 'bg-green-100 text-green-700' : 'bg-yellow-100 text-yellow-700'}`}>
                          {item.status}
                        </span>
                      </td>
                      
                      <td className="p-4 max-w-[150px] truncate">
                        {item.dokumentasi && item.dokumentasi !== "-" ? (
                          <a 
                            href={item.dokumentasi.startsWith('http') ? item.dokumentasi : `https://${item.dokumentasi}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center gap-1 text-blue-600 hover:text-blue-800 hover:underline font-medium"
                            title={item.dokumentasi}
                          >
                            <span className="truncate">{item.dokumentasi}</span>
                            <ExternalLink className="w-3 h-3 flex-shrink-0" />
                          </a>
                        ) : (
                          <span className="text-gray-400">-</span>
                        )}
                      </td>

                      <td className="p-4 flex gap-2">
                        <button 
                          onClick={() => handleToggleStatus(item.id, item.status)} 
                          className={`p-2 rounded-lg transition-colors ${
                            item.status === 'Selesai' 
                              ? 'bg-orange-100 text-orange-600 hover:bg-orange-200' 
                              : 'bg-green-100 text-green-600 hover:bg-green-200'
                          }`}
                          title={item.status === 'Selesai' ? "Batalkan Selesai" : "Tandai Selesai"}
                        >
                          {item.status === 'Selesai' ? <X className="w-4 h-4" /> : <Check className="w-4 h-4" />}
                        </button>
                        
                        <button 
                          onClick={() => handleEditClick(item)} 
                          className="p-2 bg-blue-100 text-blue-600 rounded-lg hover:bg-blue-200" 
                          title="Edit Data"
                        >
                          <Edit className="w-4 h-4" />
                        </button>
                        
                        <button onClick={() => handleDelete(item.id)} className="p-2 bg-red-100 text-red-600 rounded-lg hover:bg-red-200" title="Hapus Data">
                          <Trash2 className="w-4 h-4" />
                        </button>

                        {/* === TOMBOL KIRIM KE TELEGRAM DI SINI === */}
                        <button 
                          onClick={() => handleSendTelegram(item)} 
                          className="p-2 bg-sky-100 text-sky-600 rounded-lg hover:bg-sky-200" 
                          title="Kirim ke Telegram"
                        >
                          <Send className="w-4 h-4" />
                        </button>
                        {/* ======================================== */}
                      </td>
                    </motion.tr>
                  ))}
                </AnimatePresence>
              </tbody>
            </table>
          </div>

          <div className="w-full pt-6 border-t border-blue-200/50 flex justify-center items-center gap-2 text-sm text-blue-800/60 font-semibold">
            <span>Sistem Company © 2026 | Dibuat dengan</span>
            <motion.div animate={{ scale: [1, 1.3, 1] }} transition={{ repeat: Infinity, duration: 1, ease: "easeInOut" }}>
              <Heart className="w-4 h-4 text-pink-500 fill-pink-500" />
            </motion.div>
            <span>oleh Fakhri</span>
            <motion.div animate={{ y: [0, -8, 0], rotate: [-10, 10, -10] }} transition={{ repeat: Infinity, duration: 4, ease: "easeInOut" }} className="ml-1">
              <Sun className="w-5 h-5 text-yellow-500 fill-yellow-400" />
            </motion.div>
          </div>

        </div>
      </motion.div>

      <motion.button
        whileHover={{ scale: 1.1 }}
        whileTap={{ scale: 0.9 }}
        onClick={() => {
          setEditingId(null);
          setFormData({});
          setIsModalOpen(true);
        }}
        className="fixed bottom-10 right-10 bg-gradient-to-r from-blue-600 to-cyan-500 text-white p-4 rounded-full shadow-2xl shadow-blue-500/50 z-50 flex items-center gap-2"
      >
        <Plus className="w-6 h-6" />
        <span className="font-bold pr-2">Tambah Data</span>
      </motion.button>

      <AnimatePresence>
        {isModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4">
            <motion.div
              initial={{ opacity: 0, scale: 0.8, y: 50 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.8, y: 50 }}
              className="bg-white rounded-3xl p-8 w-full max-w-2xl shadow-2xl relative max-h-[90vh] overflow-y-auto"
            >
              <button 
                onClick={() => { setIsModalOpen(false); setEditingId(null); }} 
                className="absolute top-6 right-6 text-gray-400 hover:text-red-500 transition-colors"
              >
                <X className="w-6 h-6" />
              </button>
              
              <h2 className="text-2xl font-bold text-blue-900 mb-6">
                {editingId ? "Edit Project" : "Tambah Project Baru"}
              </h2>
              
              <form onSubmit={handleSubmit} className="grid grid-cols-2 gap-4">
                <div className="col-span-2">
                  <label className="text-sm font-semibold text-gray-600">Nama Project</label>
                  <input required type="text" value={formData.namaProject || ""} onChange={e => setFormData({...formData, namaProject: e.target.value})} className="w-full p-3 border rounded-lg mt-1 bg-gray-50 focus:ring-2 focus:ring-blue-400 outline-none transition-all" />
                </div>
                
                <div>
                  <label className="text-sm font-semibold text-gray-600">Tanggal Masuk</label>
                  <input required type="date" value={formData.tglMasuk === "-" ? "" : formData.tglMasuk || ""} onChange={e => setFormData({...formData, tglMasuk: e.target.value})} className="w-full p-3 border rounded-lg mt-1 bg-gray-50 focus:ring-2 focus:ring-blue-400 outline-none transition-all" />
                </div>
                <div>
                  <label className="text-sm font-semibold text-gray-600">Tanggal Keluar</label>
                  <input type="date" value={formData.tglKeluar === "-" ? "" : formData.tglKeluar || ""} onChange={e => setFormData({...formData, tglKeluar: e.target.value})} className="w-full p-3 border rounded-lg mt-1 bg-gray-50 focus:ring-2 focus:ring-blue-400 outline-none transition-all" />
                </div>

                <div>
                  <label className="text-sm font-semibold text-gray-600">Status</label>
                  <select value={formData.status || "Proses"} onChange={e => setFormData({...formData, status: e.target.value as any})} className="w-full p-3 border rounded-lg mt-1 bg-gray-50 focus:ring-2 focus:ring-blue-400 outline-none transition-all">
                    <option value="Proses">Proses</option>
                    <option value="Selesai">Selesai</option>
                  </select>
                </div>
                <div>
                  <label className="text-sm font-semibold text-gray-600">Link Dokumentasi</label>
                  <input type="text" value={formData.dokumentasi || ""} onChange={e => setFormData({...formData, dokumentasi: e.target.value})} className="w-full p-3 border rounded-lg mt-1 bg-gray-50 focus:ring-2 focus:ring-blue-400 outline-none transition-all" />
                </div>
                
                <div className="col-span-2">
                  <label className="text-sm font-semibold text-gray-600">Keluhan</label>
                  <textarea required value={formData.keluhan || ""} onChange={e => setFormData({...formData, keluhan: e.target.value})} className="w-full p-3 border rounded-lg mt-1 bg-gray-50 focus:ring-2 focus:ring-blue-400 outline-none transition-all" rows={2}></textarea>
                </div>

                <div className="col-span-2">
                  <label className="text-sm font-semibold text-gray-600">Perbaikan (Tindakan)</label>
                  <textarea value={formData.perbaikan || ""} onChange={e => setFormData({...formData, perbaikan: e.target.value})} className="w-full p-3 border rounded-lg mt-1 bg-gray-50 focus:ring-2 focus:ring-blue-400 outline-none transition-all" rows={2}></textarea>
                </div>
                
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  type="submit"
                  className="col-span-2 py-3 mt-2 bg-gradient-to-r from-blue-500 to-cyan-400 text-white rounded-xl font-bold shadow-lg"
                >
                  {editingId ? "Simpan Perubahan" : "Simpan Data"}
                </motion.button>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </CloudBackground>
  );
}
"use client";
import { useState, useEffect } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import CloudBackground from "@/components/CloudBackground";
import { 
  Plus, Edit, Trash2, Search, X, Check, Sun, Heart, ExternalLink, Send,
  LayoutDashboard, FileText, PieChart, ChevronLeft, ChevronRight,
  Printer, Image as ImageIcon
} from "lucide-react";
import { 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, Pie, Cell 
} from "recharts";

type ProjectData = {
  id: string;
  tglMasuk: string;
  tglKeluar: string;
  perusahaan: string;
  namaProject: string;
  keluhan: string;
  perbaikan: string;
  status: "Proses" | "Selesai";
  dokumentasi: string;
};

type InvoiceData = {
  id: string;
  perusahaan: string;
  tanggal: string;
  jatuhTempo: string;
  total: number;
  status: "Draft" | "Terkirim" | "Lunas" | "Overdue";
  items?: any[];
};

export default function Dashboard() {
  const router = useRouter();
  
  // State Utama
  const [data, setData] = useState<ProjectData[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState("");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [formData, setFormData] = useState<Partial<ProjectData>>({});
  const [editingId, setEditingId] = useState<string | null>(null);

  // State Sidebar
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);

  const searchParams = useSearchParams();

// Membaca menu aktif langsung dari URL web
const activeMenu = searchParams.get("menu") || "Pekerjaan";

// Kita buat fungsi bohongan "setActiveMenu" agar kode Anda yang lama di bawah tidak error 
// jika ada tombol yang mencoba mengubah state. Fungsi ini akan mengarahkan ulang URL-nya.
const setActiveMenu = (menu: string) => {
  router.push(`/dashboard?menu=${menu}`);
};

  // State Invoice
  const [invoices, setInvoices] = useState<InvoiceData[]>([]);
  const [invoiceFilter, setInvoiceFilter] = useState("");
  const [editingInvoiceId, setEditingInvoiceId] = useState<string | null>(null);
  const [isInvoiceModalOpen, setIsInvoiceModalOpen] = useState(false);
  const [invoiceFormData, setInvoiceFormData] = useState({
    perusahaan: "",
    tanggal: new Date().toISOString().split('T')[0],
    jatuhTempo: "",
    status: "Draft" as "Draft" | "Terkirim" | "Lunas" | "Overdue",
    items: [{ deskripsi: "", qty: 1, harga: 0 }]
  });

  const menuItems = [
    { id: "Job list", label: "Pekerjaan", icon: LayoutDashboard },
    { id: "Invoice", label: "Invoice", icon: FileText },
    { id: "Analisis", label: "Analisis", icon: PieChart },
  ];

  // ===================== FETCH DATA DARI VERCEL POSTGRES =====================
  const fetchData = async () => {
    setLoading(true);
    try {
      const response = await fetch('/api/projects');
      const result = await response.json();
      
      if (result.data) {
        const formattedData = result.data.map((p: any) => ({
          id: p.id,
          tglMasuk: p.tgl_masuk,
          tglKeluar: p.tgl_keluar,
          perusahaan: p.perusahaan || "-", 
          namaProject: p.nama_project,
          keluhan: p.keluhan,
          perbaikan: p.perbaikan,
          status: p.status,
          dokumentasi: p.dokumentasi
        }));
        setData(formattedData);
      }
    } catch (error) {
      console.error("Gagal mengambil data:", error);
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchData();
    
  }, []);

  const filteredData = data.filter((item) =>
    item.namaProject.toLowerCase().includes(filter.toLowerCase()) ||
    (item.perusahaan && item.perusahaan.toLowerCase().includes(filter.toLowerCase())) ||
    item.status.toLowerCase().includes(filter.toLowerCase()) ||
    item.id.toLowerCase().includes(filter.toLowerCase())
  );

  const filteredInvoices = invoices.filter((item) =>
    item.perusahaan.toLowerCase().includes(invoiceFilter.toLowerCase()) ||
    item.id.toLowerCase().includes(invoiceFilter.toLowerCase()) ||
    item.status.toLowerCase().includes(invoiceFilter.toLowerCase())
  );

  const uniqueCompanies = Array.from(new Set(data.map(item => item.perusahaan).filter(Boolean)));

  

  // ===================== HANDLER JOB LIST (DB VERCEL) =====================
  const handleEditClick = (item: ProjectData) => {
    setEditingId(item.id);
    setFormData(item);
    setIsModalOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (editingId) {
      try {
        const res = await fetch('/api/projects', {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            id: editingId,
            tgl_masuk: formData.tglMasuk,
            tgl_keluar: formData.tglKeluar,
            perusahaan: formData.perusahaan,
            nama_project: formData.namaProject,
            keluhan: formData.keluhan,
            perbaikan: formData.perbaikan,
            status: formData.status,
            dokumentasi: formData.dokumentasi
          })
        });
        
        if (!res.ok) throw new Error("Gagal update data");
        
        setIsModalOpen(false);
        setFormData({});
        setEditingId(null);
        fetchData();
      } catch (err: any) {
        alert(err.message);
      }
    } else {
      const newId = `PRJ-00${data.length + 1}`;
      try {
        const res = await fetch('/api/projects', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            id: newId,
            tgl_masuk: formData.tglMasuk || "-",
            tgl_keluar: formData.tglKeluar || "-",
            perusahaan: formData.perusahaan || "-",
            nama_project: formData.namaProject,
            keluhan: formData.keluhan,
            perbaikan: formData.perbaikan || "",
            status: formData.status || "Proses",
            dokumentasi: formData.dokumentasi || ""
          })
        });
        
        if (!res.ok) throw new Error("Gagal menyimpan data");

        setIsModalOpen(false);
        setFormData({});
        fetchData(); 
      } catch (err: any) {
        alert(err.message);
      }
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Yakin ingin menghapus project ini?")) return;
    try {
      const res = await fetch(`/api/projects?id=${id}`, { method: 'DELETE' });
      if (!res.ok) throw new Error("Gagal menghapus data");
      fetchData(); 
    } catch (err: any) {
      alert(err.message);
    }
  };

  const handleEditInvoiceClick = (item: InvoiceData) => {
    setEditingInvoiceId(item.id);
    setInvoiceFormData({
      perusahaan: item.perusahaan || "",
      tanggal: item.tanggal,
      jatuhTempo: item.jatuhTempo === "-" ? "" : item.jatuhTempo,
      status: item.status,
      items: item.items && item.items.length > 0 ? item.items : [{ deskripsi: "", qty: 1, harga: 0 }]
    });
    setIsInvoiceModalOpen(true);
  };

  const handleToggleStatus = async (id: string, currentStatus: string) => {
    const today = new Date().toISOString().split('T')[0];
    const isProses = currentStatus === "Proses";
    const newStatus = isProses ? "Selesai" : "Proses";
    const newTglKeluar = isProses ? today : "-";

    try {
      const res = await fetch('/api/projects', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id, status: newStatus, tgl_keluar: newTglKeluar })
      });
      if (!res.ok) throw new Error("Gagal merubah status");
      fetchData(); 
    } catch (err: any) {
      alert(err.message);
    }
  };

  // ===================== HANDLER TELEGRAM =====================
  const handleSendTelegram = async (item: ProjectData) => {
    const BOT_TOKEN = "8941562735:AAHU-uqsTYODZwE3DF0343HsZh_ih2Ry4iI"; 
    const CHAT_ID = "-1003752685844"; 

    const message = `
📋 *Detail Project Job List* 📋

*ID:* ${item.id}
*Perusahaan:* ${item.perusahaan}
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
        body: JSON.stringify({ chat_id: CHAT_ID, text: message, parse_mode: "Markdown" }),
      });

      if (response.ok) {
        alert("Berhasil! Data telah dikirim ke Telegram.");
      } else {
        alert("Gagal mengirim data ke Telegram.");
      }
    } catch (error) {
      alert("Terjadi kesalahan saat menghubungi Telegram API.");
    }
  };

  // ===================== FETCH & HANDLER INVOICE (VERCEL DB) =====================
  
  // 1. Fungsi untuk menarik data invoice dari database
  const fetchInvoices = async () => {
    try {
      const response = await fetch('/api/invoices');
      const result = await response.json();
      
      if (result.data) {
        const formattedInvoices = result.data.map((inv: any) => ({
          id: inv.id,
          perusahaan: inv.perusahaan,
          tanggal: inv.tanggal,
          jatuhTempo: inv.jatuh_tempo,
          total: parseFloat(inv.total),
          status: inv.status,
          items: inv.items
        }));
        setInvoices(formattedInvoices);
      }
    } catch (error) {
      console.error("Gagal mengambil data invoice:", error);
    }
  };

  // 2. Pastikan data Job List & Invoice ditarik bersamaan saat web pertama kali dibuka
  useEffect(() => {
    fetchData();      // Tarik data Job List
    fetchInvoices();  // Tarik data Invoice
  }, []);

  // 3. Handler hapus invoice via icon Trash
  const handleDeleteInvoice = async (id: string) => {
    if (!confirm("Yakin ingin menghapus invoice ini?")) return;
    try {
      const res = await fetch(`/api/invoices?id=${id}`, { method: 'DELETE' });
      if (!res.ok) throw new Error("Gagal menghapus data");
      fetchInvoices(); // Refresh tabel setelah dihapus
    } catch (err: any) {
      alert(err.message);
    }
  };

  // 4. Handler untuk form item (Tambah/Ubah/Hapus baris)
  const handleAddInvoiceItem = () => {
    setInvoiceFormData({
      ...invoiceFormData,
      items: [...invoiceFormData.items, { deskripsi: "", qty: 1, harga: 0 }]
    });
  };

  const handleInvoiceItemChange = (index: number, field: string, value: any) => {
    const newItems = [...invoiceFormData.items];
    newItems[index] = { ...newItems[index], [field]: value };
    setInvoiceFormData({ ...invoiceFormData, items: newItems });
  };

  const handleRemoveInvoiceItem = (index: number) => {
    if (invoiceFormData.items.length === 1) return;
    const newItems = invoiceFormData.items.filter((_, i) => i !== index);
    setInvoiceFormData({ ...invoiceFormData, items: newItems });
  };

  const calculateInvoiceTotal = () => {
    return invoiceFormData.items.reduce((sum, item) => sum + (item.qty * item.harga), 0);
  };

  // 5. Handler untuk Submit / Simpan Invoice Baru
  const handleInvoiceSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
  const finalPerusahaan = invoiceFormData.perusahaan === "Manual" ? "" : invoiceFormData.perusahaan;

    try {
      if (editingInvoiceId) {
        // ================= PROSES UPDATE (PUT) =================
        const res = await fetch('/api/invoices', {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            id: editingInvoiceId,
            perusahaan: finalPerusahaan,
            tanggal: invoiceFormData.tanggal,
            jatuh_tempo: invoiceFormData.jatuhTempo || "-",
            total: calculateInvoiceTotal(),
            status: invoiceFormData.status,
            items: invoiceFormData.items
          })
        });

        if (!res.ok) throw new Error("Gagal memperbarui invoice");
        alert("Invoice berhasil diperbarui!");
        
      } else {
        // ================= PROSES SIMPAN BARU (POST) =================
        const newId = `INV-${new Date().getFullYear()}${String(invoices.length + 1).padStart(3, '0')}`;
        const res = await fetch('/api/invoices', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            id: newId,
            perusahaan: finalPerusahaan,
            tanggal: invoiceFormData.tanggal,
            jatuh_tempo: invoiceFormData.jatuhTempo || "-",
            total: calculateInvoiceTotal(),
            status: invoiceFormData.status,
            items: invoiceFormData.items
          })
        });

        if (!res.ok) throw new Error("Gagal menyimpan invoice");
        alert("Invoice berhasil disimpan ke database!");
      }

      // Selesai (Sama untuk keduanya)
      setIsInvoiceModalOpen(false);
      setEditingInvoiceId(null);
      
      // Reset Form
      setInvoiceFormData({
        perusahaan: "",
        tanggal: new Date().toISOString().split('T')[0],
        jatuhTempo: "",
        status: "Draft",
        items: [{ deskripsi: "", qty: 1, harga: 0 }]
      });
      
      fetchInvoices(); // Refresh tabel
    } catch (err: any) {
      alert(err.message);
    }
  };

  // ===================== LOGIKA HITUNG DATA ANALISIS =====================
  // 1. Hitung Project
  const totalProjects = data.length;
  const projectProses = data.filter(p => p.status === "Proses").length;
  const projectSelesai = data.filter(p => p.status === "Selesai").length;

  // 2. Hitung Keuangan dari Invoice
  const totalPendapatan = invoices
    .filter(inv => inv.status === "Lunas")
    .reduce((sum, inv) => sum + inv.total, 0);

  const tagihanMenggantung = invoices
    .filter(inv => inv.status === "Terkirim" || inv.status === "Overdue")
    .reduce((sum, inv) => sum + inv.total, 0);

  // 3. Format Data untuk Grafik Lingkaran (Pie Chart - Status Project)
  const dataPieProject = [
    { name: "Selesai", value: projectSelesai, color: "#10B981" }, // Hijau
    { name: "Proses", value: projectProses, color: "#FBBF24" },  // Kuning
  ];

  // 4. Format Data untuk Grafik Batang (Bar Chart - Nominal Finansial)
  const dataBarFinansial = [
    { name: "Draft", Total: invoices.filter(i => i.status === "Draft").reduce((s, i) => s + i.total, 0) },
    { name: "Terkirim", Total: invoices.filter(i => i.status === "Terkirim").reduce((s, i) => s + i.total, 0) },
    { name: "Lunas", Total: invoices.filter(i => i.status === "Lunas").reduce((s, i) => s + i.total, 0) },
    { name: "Overdue", Total: invoices.filter(i => i.status === "Overdue").reduce((s, i) => s + i.total, 0) },
  ];

  // 5. Ambil 3 Klien dengan Invoice Terbesar (Leaderboard)
  const topClients = Array.from(
    invoices.reduce((map, inv) => {
      const currentTotal = map.get(inv.perusahaan) || 0;
      map.set(inv.perusahaan, currentTotal + inv.total);
      return map;
    }, new Map<string, number>())
  )
    .map(([name, total]) => ({ name, total }))
    .sort((a, b) => b.total - a.total)
    .slice(0, 3);

  // ===================== RENDER LAYOUT =====================
  return (
    <CloudBackground>
      <div className="flex h-screen w-full overflow-hidden pt-[90px] box-border relative z-40">

        {/* === KONTEN UTAMA === */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-8 relative h-full">
          <div className="w-full max-w-7xl mx-auto flex flex-col h-full">
            
            {/* 1. MENU JOB LIST */}
            {activeMenu === "Pekerjaan" && (
              <>
                <motion.div
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="w-full bg-white/70 backdrop-blur-xl rounded-3xl shadow-2xl overflow-hidden border border-white/50 flex flex-col"
                >
                  <div className="p-8 flex-1">
                    <div className="flex justify-between items-center mb-8">
                      <h1 className="text-3xl font-extrabold text-blue-900">Data Job List</h1>
                      <div className="relative">
                        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500 w-5 h-5" />
                        <input
                          type="text"
                          placeholder="Cari project, perusahaan..."
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
                            <th className="p-4 min-w-[150px]">Perusahaan</th>
                            <th className="p-4 min-w-[150px]">Nama Project</th>
                            <th className="p-4 min-w-[200px]">Keluhan</th>
                            <th className="p-4 min-w-[200px]">Tindakan</th>
                            <th className="p-4">Status</th>
                            <th className="p-4">Dokumentasi</th>
                            <th className="p-4 min-w-[180px]">Aksi</th>
                          </tr>
                        </thead>
                        <tbody>
                          <AnimatePresence>
                            {filteredData.map((item, index) => (
                              <motion.tr key={item.id} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, x: -20 }} transition={{ delay: index * 0.05 }} className="border-b border-blue-100 hover:bg-blue-50/50">
                                <td className="p-4 font-semibold text-blue-800">{item.id}</td>
                                <td className="p-4 text-gray-700">{item.tglMasuk}</td>
                                <td className="p-4 text-gray-700 font-medium">{item.tglKeluar}</td>
                                <td className="p-4 text-gray-800 font-bold">{item.perusahaan}</td>
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
                                    <a href={item.dokumentasi.startsWith('http') ? item.dokumentasi : `https://${item.dokumentasi}`} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-1 text-blue-600 hover:text-blue-800 hover:underline font-medium" title={item.dokumentasi}>
                                      <span className="truncate">{item.dokumentasi}</span><ExternalLink className="w-3 h-3 flex-shrink-0" />
                                    </a>
                                  ) : (<span className="text-gray-400">-</span>)}
                                </td>
                                <td className="p-4 flex gap-2">
                                  <button onClick={() => handleToggleStatus(item.id, item.status)} className={`p-2 rounded-lg transition-colors ${item.status === 'Selesai' ? 'bg-orange-100 text-orange-600 hover:bg-orange-200' : 'bg-green-100 text-green-600 hover:bg-green-200'}`} title={item.status === 'Selesai' ? "Batalkan Selesai" : "Tandai Selesai"}>
                                    {item.status === 'Selesai' ? <X className="w-4 h-4" /> : <Check className="w-4 h-4" />}
                                  </button>
                                  <button onClick={() => handleEditClick(item)} className="p-2 bg-blue-100 text-blue-600 rounded-lg hover:bg-blue-200" title="Edit Data"><Edit className="w-4 h-4" /></button>
                                  <button onClick={() => handleDelete(item.id)} className="p-2 bg-red-100 text-red-600 rounded-lg hover:bg-red-200" title="Hapus Data"><Trash2 className="w-4 h-4" /></button>
                                  <button onClick={() => handleSendTelegram(item)} className="p-2 bg-sky-100 text-sky-600 rounded-lg hover:bg-sky-200" title="Kirim ke Telegram"><Send className="w-4 h-4" /></button>
                                </td>
                              </motion.tr>
                            ))}
                          </AnimatePresence>
                        </tbody>
                      </table>
                    </div>
                  </div>
                </motion.div>

                <motion.button onClick={() => { setEditingId(null); setFormData({}); setIsModalOpen(true); }} whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.9 }} className="fixed bottom-10 right-10 bg-gradient-to-r from-blue-600 to-cyan-500 text-white p-4 rounded-full shadow-2xl z-50 flex items-center gap-2">
                  <Plus className="w-6 h-6" /><span className="font-bold pr-2">Tambah Data</span>
                </motion.button>
              </>
            )}

            {/* 2. MENU INVOICE */}
            {activeMenu === "Invoice" && (
              <>
                <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="w-full bg-white/70 backdrop-blur-xl rounded-3xl shadow-2xl overflow-hidden border border-white/50 flex flex-col">
                  <div className="p-8 flex-1">
                    <div className="flex justify-between items-center mb-8">
                      <h1 className="text-3xl font-extrabold text-blue-900">Data Invoice</h1>
                      <div className="relative">
                        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500 w-5 h-5" />
                        <input type="text" placeholder="Cari No. Invoice, Perusahaan..." value={invoiceFilter} onChange={(e) => setInvoiceFilter(e.target.value)} className="pl-10 pr-4 py-2 rounded-full bg-white border-2 border-blue-200 outline-none focus:border-blue-500 shadow-sm min-w-[250px]" />
                      </div>
                    </div>

                    <div className="overflow-x-auto rounded-xl border border-blue-100 bg-white/60 mb-6">
                      <table className="w-full text-left border-collapse">
                        <thead>
                          <tr className="bg-blue-500 text-white">
                            <th className="p-4">No. Invoice</th>
                            <th className="p-4 min-w-[200px]">Perusahaan</th>
                            <th className="p-4 whitespace-nowrap">Tanggal</th>
                            <th className="p-4 whitespace-nowrap">Jatuh Tempo</th>
                            <th className="p-4 text-right">Total Tagihan</th>
                            <th className="p-4">Status</th>
                            <th className="p-4 min-w-[150px]">Aksi</th>
                          </tr>
                        </thead>
                        <tbody>
                          <AnimatePresence>
                            {filteredInvoices.map((item, index) => (
                              <motion.tr key={item.id} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, x: -20 }} transition={{ delay: index * 0.05 }} className="border-b border-blue-100 hover:bg-blue-50/50">
                                <td className="p-4 font-bold text-blue-800">{item.id}</td>
                                <td className="p-4 text-gray-800 font-semibold">{item.perusahaan}</td>
                                <td className="p-4 text-gray-600">{item.tanggal}</td>
                                <td className="p-4 text-gray-600 font-medium">{item.jatuhTempo}</td>
                                <td className="p-4 text-right text-gray-800 font-bold">Rp {item.total.toLocaleString('id-ID')}</td>
                                <td className="p-4">
                                  <span className={`px-3 py-1 rounded-full text-sm font-bold ${item.status === 'Lunas' ? 'bg-green-100 text-green-700' : item.status === 'Draft' ? 'bg-gray-200 text-gray-700' : item.status === 'Overdue' ? 'bg-red-100 text-red-700' : 'bg-blue-100 text-blue-700'}`}>
                                    {item.status}
                                  </span>
                                </td>
                                <td className="p-4 flex gap-2">
                                  <button onClick={() => router.push(`/invoice/print/${item.id}`)} className="p-2 bg-indigo-100 text-indigo-600 rounded-lg hover:bg-indigo-200" title="Cetak PDF"><Printer className="w-4 h-4" /></button>
                                  <button onClick={() => handleEditInvoiceClick(item)} className="p-2 bg-blue-100 text-blue-600 rounded-lg hover:bg-blue-200" title="Edit Invoice"><Edit className="w-4 h-4" />
                                  </button>
                                  <button onClick={() => handleDeleteInvoice(item.id)} className="p-2 bg-red-100 text-red-600 rounded-lg hover:bg-red-200" title="Hapus Invoice"><Trash2 className="w-4 h-4" /></button>
                                </td>
                              </motion.tr>
                            ))}
                          </AnimatePresence>
                        </tbody>
                      </table>
                    </div>
                  </div>
                </motion.div>

                <motion.button onClick={() => setIsInvoiceModalOpen(true)} whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.9 }} className="fixed bottom-10 right-10 bg-gradient-to-r from-indigo-600 to-blue-500 text-white p-4 rounded-full shadow-2xl z-50 flex items-center gap-2">
                  <Plus className="w-6 h-6" /><span className="font-bold pr-2">Buat Invoice</span>
                </motion.button>
              </>
            )}

            {/* 3. MENU ANALISIS */}
            {activeMenu === "Analisis" && (
              <motion.div 
                initial={{ opacity: 0, y: 20 }} 
                animate={{ opacity: 1, y: 0 }} 
                className="space-y-6 w-full pb-10"
              >
                {/* --- BARIS 1: SUMMARY CARDS --- */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                  {/* Card 1 */}
                  <div className="bg-white/80 backdrop-blur-md p-6 rounded-2xl border border-white/50 shadow-xl flex flex-col justify-between">
                    <span className="text-sm font-semibold text-gray-500 uppercase tracking-wider">Total Pendapatan (Lunas)</span>
                    <span className="text-2xl font-extrabold text-emerald-600 mt-2">Rp {totalPendapatan.toLocaleString('id-ID')}</span>
                  </div>
                  {/* Card 2 */}
                  <div className="bg-white/80 backdrop-blur-md p-6 rounded-2xl border border-white/50 shadow-xl flex flex-col justify-between">
                    <span className="text-sm font-semibold text-gray-500 uppercase tracking-wider">Piutang / Menggantung</span>
                    <span className="text-2xl font-extrabold text-amber-600 mt-2">Rp {tagihanMenggantung.toLocaleString('id-ID')}</span>
                  </div>
                  {/* Card 3 */}
                  <div className="bg-white/80 backdrop-blur-md p-6 rounded-2xl border border-white/50 shadow-xl flex flex-col justify-between">
                    <span className="text-sm font-semibold text-gray-500 uppercase tracking-wider">Project Berjalan</span>
                    <span className="text-2xl font-extrabold text-blue-600 mt-2">{projectProses} <span className="text-sm font-normal text-gray-400">Pekerjaan</span></span>
                  </div>
                  {/* Card 4 */}
                  <div className="bg-white/80 backdrop-blur-md p-6 rounded-2xl border border-white/50 shadow-xl flex flex-col justify-between">
                    <span className="text-sm font-semibold text-gray-500 uppercase tracking-wider">Project Selesai</span>
                    <span className="text-2xl font-extrabold text-indigo-600 mt-2">{projectSelesai} <span className="text-sm font-normal text-gray-400">Sukses</span></span>
                  </div>
                </div>

                {/* --- BARIS 2: CHARTS VISUALIZATION --- */}
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                  
                  {/* Grafik Batang Finansial (Lebar 2 Kolom) */}
                  <div className="lg:col-span-2 bg-white/80 backdrop-blur-md p-6 rounded-3xl border border-white/50 shadow-xl">
                    <h3 className="text-lg font-bold text-blue-900 mb-4">Statistik Keuangan Per Status Invoice</h3>
                    <div className="w-full h-64">
                      <ResponsiveContainer width="100%" height="100%">
                        <BarChart data={dataBarFinansial}>
                          <CartesianGrid strokeDasharray="3 3" opacity={0.3} />
                          <XAxis dataKey="name" stroke="#64748B" />
                          <YAxis stroke="#64748B" tickFormatter={(value) => `Rp ${value.toLocaleString('id-ID')}`} />
                          <Tooltip formatter={(value: any) => [`Rp ${value.toLocaleString('id-ID')}`, 'Total']} />
                          <Legend />
                          <Bar dataKey="Total" fill="#3B82F6" radius={[8, 8, 0, 0]} name="Nominal Rupiah" />
                        </BarChart>
                      </ResponsiveContainer>
                    </div>
                  </div>

                  {/* Grafik Donut Status Project (Lebar 1 Kolom) */}
                  <div className="bg-white/80 backdrop-blur-md p-6 rounded-3xl border border-white/50 shadow-xl flex flex-col justify-between">
                    <h3 className="text-lg font-bold text-blue-900 mb-2">Rasio Status Project</h3>
                    <div className="w-full h-52 relative flex items-center justify-center">
                      {totalProjects === 0 ? (
                        <span className="text-gray-400 text-sm">Tidak ada data project</span>
                      ) : (
                        <ResponsiveContainer width="100%" height="100%">
                          <PieChart>
                            <Pie
                              data={dataPieProject.filter(d => d.value > 0)}
                              cx="50%"
                              cy="50%"
                              innerRadius={60}
                              outerRadius={80}
                              paddingAngle={5}
                              dataKey="value"
                            >
                              {dataPieProject.map((entry, index) => (
                                <Cell key={`cell-${index}`} fill={entry.color} />
                              ))}
                            </Pie>
                            <Tooltip />
                          </PieChart>
                        </ResponsiveContainer>
                      )}
                      {/* Angka di tengah lingkaran */}
                      <div className="absolute text-center flex flex-col">
                        <span className="text-2xl font-extrabold text-blue-900">{totalProjects}</span>
                        <span className="text-xs font-semibold text-gray-400 uppercase tracking-tight">Total Job</span>
                      </div>
                    </div>
                    {/* Legenda Manual di bawah chart */}
                    <div className="flex justify-center gap-6 mt-2">
                      <div className="flex items-center gap-2">
                        <div className="w-3 h-3 rounded-full bg-emerald-500" />
                        <span className="text-sm font-medium text-gray-600">Selesai ({projectSelesai})</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <div className="w-3 h-3 rounded-full bg-amber-400" />
                        <span className="text-sm font-medium text-gray-600">Proses ({projectProses})</span>
                      </div>
                    </div>
                  </div>

                </div>

                {/* --- BARIS 3: LEADERBOARD / DATA TAMBAHAN --- */}
                <div className="bg-white/80 backdrop-blur-md p-6 rounded-3xl border border-white/50 shadow-xl w-full">
                  <h3 className="text-lg font-bold text-blue-900 mb-4">👑 Klien / Perusahaan Kontributor Terbesar</h3>
                  {topClients.length === 0 ? (
                    <p className="text-gray-400 text-sm py-2">Belum ada transaksi invoice terdata.</p>
                  ) : (
                    <div className="space-y-3">
                      {topClients.map((client, index) => (
                        <div key={index} className="flex items-center justify-between p-4 bg-white/50 rounded-xl border border-blue-50/50 hover:bg-white transition-colors shadow-sm">
                          <div className="flex items-center gap-3">
                            <span className="w-7 h-7 flex items-center justify-center bg-blue-100 text-blue-600 font-bold rounded-full text-sm">
                              {index + 1}
                            </span>
                            <span className="font-bold text-gray-800">{client.name || "Klien Umum / Perorangan"}</span>
                          </div>
                          <span className="font-extrabold text-blue-600">Rp {client.total.toLocaleString('id-ID')}</span>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

              </motion.div>
            )}
          </div>
        </div>
      </div>

      {/* ================= MODAL FORM JOB LIST ================= */}
      <AnimatePresence>
        {isModalOpen && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/40 backdrop-blur-sm p-4 pt-24">
            <motion.div initial={{ opacity: 0, scale: 0.8, y: 50 }} animate={{ opacity: 1, scale: 1, y: 0 }} exit={{ opacity: 0, scale: 0.8, y: 50 }} className="bg-white rounded-3xl p-8 w-full max-w-2xl shadow-2xl relative max-h-[90vh] overflow-y-auto">
              <button onClick={() => { setIsModalOpen(false); setEditingId(null); }} className="absolute top-6 right-6 text-gray-400 hover:text-red-500 transition-colors"><X className="w-6 h-6" /></button>
              <h2 className="text-2xl font-bold text-blue-900 mb-6">{editingId ? "Edit Project" : "Tambah Project Baru"}</h2>
              
              <form onSubmit={handleSubmit} className="grid grid-cols-2 gap-4">
                <div className="col-span-2 sm:col-span-1">
                  <label className="text-sm font-semibold text-gray-600">Perusahaan</label>
                  <input required type="text" value={formData.perusahaan || ""} onChange={e => setFormData({...formData, perusahaan: e.target.value})} className="w-full p-3 border rounded-lg mt-1 bg-gray-50 outline-none" />
                </div>
                <div className="col-span-2 sm:col-span-1">
                  <label className="text-sm font-semibold text-gray-600">Nama Project</label>
                  <input required type="text" value={formData.namaProject || ""} onChange={e => setFormData({...formData, namaProject: e.target.value})} className="w-full p-3 border rounded-lg mt-1 bg-gray-50 outline-none" />
                </div>
                <div>
                  <label className="text-sm font-semibold text-gray-600">Tanggal Masuk</label>
                  <input required type="date" value={formData.tglMasuk === "-" ? "" : formData.tglMasuk || ""} onChange={e => setFormData({...formData, tglMasuk: e.target.value})} className="w-full p-3 border rounded-lg mt-1 bg-gray-50 outline-none" />
                </div>
                <div>
                  <label className="text-sm font-semibold text-gray-600">Tanggal Keluar</label>
                  <input type="date" value={formData.tglKeluar === "-" ? "" : formData.tglKeluar || ""} onChange={e => setFormData({...formData, tglKeluar: e.target.value})} className="w-full p-3 border rounded-lg mt-1 bg-gray-50 outline-none" />
                </div>
                <div>
                  <label className="text-sm font-semibold text-gray-600">Status</label>
                  <select value={formData.status || "Proses"} onChange={e => setFormData({...formData, status: e.target.value as any})} className="w-full p-3 border rounded-lg mt-1 bg-gray-50 outline-none">
                    <option value="Proses">Proses</option>
                    <option value="Selesai">Selesai</option>
                  </select>
                </div>
                <div>
                  <label className="text-sm font-semibold text-gray-600">Link Dokumentasi</label>
                  <input type="text" value={formData.dokumentasi || ""} onChange={e => setFormData({...formData, dokumentasi: e.target.value})} className="w-full p-3 border rounded-lg mt-1 bg-gray-50 outline-none" />
                </div>
                <div className="col-span-2">
                  <label className="text-sm font-semibold text-gray-600">Keluhan</label>
                  <textarea required value={formData.keluhan || ""} onChange={e => setFormData({...formData, keluhan: e.target.value})} className="w-full p-3 border rounded-lg mt-1 bg-gray-50 outline-none" rows={2}></textarea>
                </div>
                <div className="col-span-2">
                  <label className="text-sm font-semibold text-gray-600">Perbaikan (Tindakan)</label>
                  <textarea value={formData.perbaikan || ""} onChange={e => setFormData({...formData, perbaikan: e.target.value})} className="w-full p-3 border rounded-lg mt-1 bg-gray-50 outline-none" rows={2}></textarea>
                </div>
                <motion.button type="submit" whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }} className="col-span-2 py-3 mt-2 bg-gradient-to-r from-blue-500 to-cyan-400 text-white rounded-xl font-bold shadow-lg">
                  {editingId ? "Simpan Perubahan" : "Simpan Data"}
                </motion.button>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* ================= MODAL FORM INVOICE ================= */}
      <AnimatePresence>
        {isInvoiceModalOpen && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/40 backdrop-blur-sm p-4 pt-24">
            <motion.div initial={{ opacity: 0, scale: 0.8, y: 50 }} animate={{ opacity: 1, scale: 1, y: 0 }} exit={{ opacity: 0, scale: 0.8, y: 50 }} className="bg-white rounded-3xl p-8 w-full max-w-3xl shadow-2xl relative max-h-[90vh] overflow-y-auto">
            <button onClick={() => { setIsInvoiceModalOpen(false); setEditingInvoiceId(null); }} className="absolute top-6 right-6 text-gray-400 hover:text-red-500 transition-colors"><X className="w-6 h-6" /></button>
              <h2 className="text-2xl font-bold text-indigo-900 mb-6"> {editingInvoiceId ? `Edit Invoice (${editingInvoiceId})` : "Buat Invoice Baru"} </h2>
              
              <form onSubmit={handleInvoiceSubmit} className="space-y-6">
                <div className="grid grid-cols-2 gap-4">
                  <div className="col-span-2 sm:col-span-1">
                    <label className="text-sm font-semibold text-gray-600">Pilih Perusahaan / Klien</label>
                    <select required value={invoiceFormData.perusahaan} onChange={e => setInvoiceFormData({...invoiceFormData, perusahaan: e.target.value})} className="w-full p-3 border rounded-lg mt-1 bg-gray-50 outline-none">
                      <option value="">-- Pilih Perusahaan --</option>
                      {uniqueCompanies.map((comp, idx) => (<option key={idx} value={comp}>{comp}</option>))}
                      <option value="Manual">Ketik Manual / Perusahaan Baru...</option>
                    </select>
                    {invoiceFormData.perusahaan === "Manual" && (
                      <input required type="text" placeholder="Ketik Nama Perusahaan Baru..." onChange={e => setInvoiceFormData({...invoiceFormData, perusahaan: e.target.value})} className="w-full p-3 border rounded-lg mt-2 bg-gray-50 outline-none" />
                    )}
                  </div>
                  <div className="col-span-2 sm:col-span-1">
                    <label className="text-sm font-semibold text-gray-600">Status Pembayaran</label>
                    <select value={invoiceFormData.status} onChange={e => setInvoiceFormData({...invoiceFormData, status: e.target.value as any})} className="w-full p-3 border rounded-lg mt-1 bg-gray-50 outline-none">
                      <option value="Draft">Draft</option><option value="Terkirim">Terkirim</option><option value="Lunas">Lunas</option><option value="Overdue">Overdue</option>
                    </select>
                  </div>
                  <div>
                    <label className="text-sm font-semibold text-gray-600">Tanggal Invoice</label>
                    <input required type="date" value={invoiceFormData.tanggal} onChange={e => setInvoiceFormData({...invoiceFormData, tanggal: e.target.value})} className="w-full p-3 border rounded-lg mt-1 bg-gray-50 outline-none" />
                  </div>
                  <div>
                    <label className="text-sm font-semibold text-gray-600">Tanggal Jatuh Tempo</label>
                    <input required type="date" value={invoiceFormData.jatuhTempo} onChange={e => setInvoiceFormData({...invoiceFormData, jatuhTempo: e.target.value})} className="w-full p-3 border rounded-lg mt-1 bg-gray-50 outline-none" />
                  </div>
                </div>

                <div className="border-t border-gray-100 pt-4">
                  <div className="flex justify-between items-center mb-4">
                    <h3 className="text-lg font-bold text-gray-700">Detail Item Tagihan</h3>
                    <button type="button" onClick={handleAddInvoiceItem} className="text-sm px-3 py-1.5 bg-indigo-50 text-indigo-600 font-semibold rounded-lg hover:bg-indigo-100 transition-colors">+ Tambah Baris Pekerjaan</button>
                  </div>
                  <div className="space-y-3 max-h-[25vh] overflow-y-auto pr-1">
                    {invoiceFormData.items.map((item, idx) => (
                      <div key={idx} className="flex gap-3 items-end bg-gray-50 p-3 rounded-xl border border-gray-100">
                        <div className="flex-1">
                          <label className="text-xs font-semibold text-gray-500">Deskripsi Pekerjaan</label>
                          <input required type="text" value={item.deskripsi} onChange={e => handleInvoiceItemChange(idx, 'deskripsi', e.target.value)} placeholder="Contoh: Maintenance Inverter" className="w-full p-2 border rounded-lg mt-1 bg-white outline-none text-sm" />
                        </div>
                        <div className="w-20">
                          <label className="text-xs font-semibold text-gray-500">Qty</label>
                          <input required type="number" min="1" value={item.qty} onChange={e => handleInvoiceItemChange(idx, 'qty', parseInt(e.target.value) || 1)} className="w-full p-2 border rounded-lg mt-1 bg-white outline-none text-sm text-center" />
                        </div>
                        <div className="w-40">
                          <label className="text-xs font-semibold text-gray-500">Harga Satuan (Rp)</label>
                          <input required type="number" min="0" value={item.harga} onChange={e => handleInvoiceItemChange(idx, 'harga', parseInt(e.target.value) || 0)} className="w-full p-2 border rounded-lg mt-1 bg-white outline-none text-sm text-right" />
                        </div>
                        <button type="button" onClick={() => handleRemoveInvoiceItem(idx)} disabled={invoiceFormData.items.length === 1} className="p-2.5 bg-red-50 text-red-500 rounded-lg hover:bg-red-100 disabled:opacity-40 transition-colors mb-0.5" title="Hapus baris"><Trash2 className="w-4 h-4" /></button>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="border-t border-gray-100 pt-4 flex justify-between items-center bg-indigo-50/50 p-4 rounded-2xl">
                  <span className="font-bold text-gray-700">Total Tagihan:</span>
                  <span className="text-xl font-extrabold text-indigo-600">Rp {calculateInvoiceTotal().toLocaleString('id-ID')}</span>
                </div>

                <motion.button type="submit" whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }} className="w-full py-3 bg-gradient-to-r from-indigo-600 to-blue-500 text-white rounded-xl font-bold shadow-lg">Simpan & Buat Invoice</motion.button>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

    </CloudBackground>
  );
}
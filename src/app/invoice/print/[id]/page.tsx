"use client";
import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { Printer, ArrowLeft } from "lucide-react";

export default function PrintInvoice() {
  const params = useParams();
  const router = useRouter();
  const invoiceId = params.id as string;

  const [invoiceData, setInvoiceData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchDetailInvoice = async () => {
      try {
        const response = await fetch(`/api/invoices?id=${invoiceId}`);
        const result = await response.json();

        if (result.data && result.data.length > 0) {
          const inv = result.data[0];
          setInvoiceData({
            id: inv.id,
            perusahaan: inv.perusahaan,
            tanggal: inv.tanggal,
            jatuhTempo: inv.jatuh_tempo,
            total: parseFloat(inv.total),
            items: inv.items || [] 
          });
        } else {
          setError("Data Invoice tidak ditemukan.");
        }
      } catch (err) {
        setError("Gagal mengambil data dari database.");
      } finally {
        setLoading(false);
      }
    };

    if (invoiceId) {
      fetchDetailInvoice();
    }
  }, [invoiceId]);

  if (loading) return <div className="min-h-screen flex items-center justify-center text-xl font-bold text-gray-500">Memuat dokumen...</div>;
  if (error) return <div className="min-h-screen flex items-center justify-center text-xl font-bold text-red-500">{error}</div>;
  if (!invoiceData) return null;

  return (
    // Tambahkan class 'print:bg-white' dan 'print:py-0' agar saat disave PDF, background abu-abunya hilang
    <div className="min-h-screen bg-gray-100 py-10 print:py-0 print:bg-white flex flex-col items-center">
      
      {/* Tombol Aksi - Disembunyikan otomatis saat diprint berkat 'print:hidden' */}
      <div className="w-full max-w-4xl px-4 flex justify-between items-center mb-6 print:hidden">
        <button 
          onClick={() => router.back()} 
          className="flex items-center gap-2 px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition font-semibold"
        >
          <ArrowLeft className="w-4 h-4" /> Kembali
        </button>
        
        <button 
          onClick={() => window.print()} 
          className="flex items-center gap-2 px-6 py-2 bg-blue-600 text-white font-bold rounded-lg hover:bg-blue-700 transition shadow-lg"
        >
          <Printer className="w-5 h-5" /> Simpan PDF / Cetak
        </button>
      </div>

      {/* ================= AREA KERTAS INVOICE ================= */}
      <div className="w-full max-w-4xl bg-white p-10 sm:p-16 shadow-2xl print:shadow-none print:p-0 text-black">
        
        <div className="border-b-2 border-gray-800 pb-6 mb-8 flex justify-between items-end">
          <div>
            <h1 className="text-4xl font-extrabold text-blue-900 tracking-wider">INVOICE</h1>
            <p className="text-gray-500 mt-1 font-medium">No. {invoiceData.id}</p>
          </div>
          <div className="text-right">
            <h2 className="text-2xl font-bold text-gray-800">SISTEM COMPANY</h2>
            <p className="text-gray-500 text-sm">Jl. Teknologi No. 123, Bandung</p>
            <p className="text-gray-500 text-sm">Email: admin@sistemcompany.com</p>
          </div>
        </div>

        <div className="flex justify-between mb-10">
          <div>
            <p className="text-sm text-gray-500 font-semibold mb-1">Ditagihkan Kepada:</p>
            <h3 className="text-xl font-bold text-gray-800">{invoiceData.perusahaan || "-"}</h3>
          </div>
          <div className="text-right flex flex-col gap-1">
            <div className="flex justify-between gap-8">
              <span className="text-gray-500 font-medium">Tanggal Invoice:</span>
              <span className="font-semibold text-gray-800">{invoiceData.tanggal}</span>
            </div>
            <div className="flex justify-between gap-8">
              <span className="text-gray-500 font-medium">Jatuh Tempo:</span>
              <span className="font-semibold text-gray-800">{invoiceData.jatuhTempo}</span>
            </div>
          </div>
        </div>

        <table className="w-full text-left mb-10 border-collapse">
          <thead>
            <tr className="bg-gray-100 text-gray-800">
              <th className="p-3 border-y-2 border-gray-300">Deskripsi Pekerjaan</th>
              <th className="p-3 border-y-2 border-gray-300 text-center">Qty</th>
              <th className="p-3 border-y-2 border-gray-300 text-right">Harga</th>
              <th className="p-3 border-y-2 border-gray-300 text-right">Total</th>
            </tr>
          </thead>
          <tbody>
            {invoiceData.items.map((itm: any, idx: number) => {
              const subtotal = (Number(itm.qty) || 0) * (Number(itm.harga) || 0);
              return (
                <tr key={idx} className="border-b border-gray-200">
                  <td className="p-3 text-gray-800 font-medium">{itm.deskripsi}</td>
                  <td className="p-3 text-center text-gray-800">{itm.qty}</td>
                  <td className="p-3 text-right text-gray-800">Rp {Number(itm.harga).toLocaleString('id-ID')}</td>
                  <td className="p-3 text-right text-gray-800 font-bold">Rp {subtotal.toLocaleString('id-ID')}</td>
                </tr>
              );
            })}
          </tbody>
        </table>

        <div className="flex justify-end mb-16">
          <div className="w-1/2">
            <div className="flex justify-between p-4 bg-blue-50 text-blue-900 font-bold text-xl rounded-lg border border-blue-200 print:border-none print:bg-transparent">
              <span>TOTAL TAGIHAN</span>
              <span>Rp {invoiceData.total.toLocaleString('id-ID')}</span>
            </div>
          </div>
        </div>

        <div className="text-center text-gray-500 text-sm mt-20 pt-8 border-t border-gray-200">
          <p>Terima kasih atas kepercayaan Anda bekerja sama dengan Sistem Company.</p>
          <p>Harap melakukan pembayaran sebelum tanggal jatuh tempo ke rekening BCA: 1234567890 a.n Sistem Company.</p>
        </div>
        
      </div>
    </div>
  );
}
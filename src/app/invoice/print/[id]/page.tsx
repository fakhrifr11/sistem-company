"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { Printer, ArrowLeft } from "lucide-react";

export  default  function  PrintInvoice() {
  const params = useParams();
  const router = useRouter();
  const invoiceId = params.id as  string;

  // State untuk menyimpan data invoice (Saat ini pakai dummy dulu)
  const [invoiceData, setInvoiceData] = useState<any>(null);

  useEffect(() => {
    // NANTINYA: Di sini tempat Anda fetch data ke Supabase berdasarkan invoiceId
    // Contoh dummy data:
    setInvoiceData({
      id: invoiceId,
      perusahaan: "PT Anjay",
      tanggal: "2026-06-15",
      jatuhTempo: "2026-06-30",
      total: 1500000,
      item: [
        { deskripsi: "Perbaikan Inverter", qty: 1, harga: 1000000, subtotal: 1000000 },
        { deskripsi: "Ganti Komponen Kelistrikan", qty: 1, harga: 500000, subtotal: 500000 }
      ]
    });
  }, [invoiceId]);

  if (!invoiceData) return  <div  className="p-10 text-center">Memuat dokumen...</div>;

  return (
    // Background abu-abu di layar, tapi putih polos saat diprint
    <div  className="min-h-screen bg-gray-100 py-10 print:py-0 print:bg-white flex justify-center">
      
      {/* Container Kertas A4 */}
      <div  className="w-full max-w-4xl bg-white p-10 sm:p-16 shadow-2xl print:shadow-none print:p-0">
        
        {/* Tombol Aksi (Akan HILANG saat diprint berkat class 'print:hidden') */}
        <div  className="flex justify-between items-center mb-10 print:hidden">
          <button 
            onClick={() => router.back()} 
            className="flex items-center gap-2 px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition"
          >
            <ArrowLeft  className="w-4 h-4"  /> Kembali
          </button>
          
          <button 
            onClick={() =>  window.print()} 
            className="flex items-center gap-2 px-6 py-2 bg-blue-600 text-white font-bold rounded-lg hover:bg-blue-700 transition shadow-lg"
          >
            <Printer  className="w-5 h-5"  /> Cetak / Save PDF
          </button>
        </div>

        {/* ================= AREA KERTAS INVOICE ================= */}
        <div  className="border-b-2 border-gray-800 pb-6 mb-8 flex justify-between items-end">
          <div>
            <h1  className="text-4xl font-extrabold text-blue-900 tracking-wider">INVOICE</h1>
            <p  className="text-gray-500 mt-1 font-medium">No. {invoiceData.id}</p>
          </div>
          <div  className="text-right">
            <h2  className="text-2xl font-bold text-gray-800">SISTEM COMPANY</h2>
            <p  className="text-gray-500 text-sm">Jl. Teknologi No. 123, Bandung</p>
            <p  className="text-gray-500 text-sm">Email: finance@sistemcompany.com</p>
          </div>
        </div>

        <div  className="flex justify-between mb-10">
          <div>
            <p  className="text-sm text-gray-500 font-semibold mb-1">Ditagihkan Kepada:</p>
            <h3  className="text-xl font-bold text-gray-800">{invoiceData.perusahaan}</h3>
          </div>
          <div  className="text-right flex flex-col gap-1">
            <div  className="flex justify-between gap-8">
              <span  className="text-gray-500 font-medium">Tanggal Invoice:</span>
              <span  className="font-semibold text-gray-800">{invoiceData.tanggal}</span>
            </div>
            <div  className="flex justify-between gap-8">
              <span  className="text-gray-500 font-medium">Jatuh Tempo:</span>
              <span  className="font-semibold text-gray-800">{invoiceData.jatuhTempo}</span>
            </div>
          </div>
        </div>

        <table  className="w-full text-left mb-10 border-collapse">
          <thead>
            <tr  className="bg-gray-100 text-gray-800">
              <th  className="p-3 border-y-2 border-gray-300">Deskripsi Pekerjaan</th>
              <th  className="p-3 border-y-2 border-gray-300 text-center">Qty</th>
              <th  className="p-3 border-y-2 border-gray-300 text-right">Harga</th>
              <th  className="p-3 border-y-2 border-gray-300 text-right">Total</th>
            </tr>
          </thead>
          <tbody>
            {invoiceData.item.map((itm: any, idx: number) => (
              <tr  key={idx}  className="border-b border-gray-200">
                <td  className="p-3 text-gray-800">{itm.deskripsi}</td>
                <td  className="p-3 text-center text-gray-800">{itm.qty}</td>
                <td  className="p-3 text-right text-gray-800">Rp {itm.harga.toLocaleString('id-ID')}</td>
                <td  className="p-3 text-right text-gray-800 font-semibold">Rp {itm.subtotal.toLocaleString('id-ID')}</td>
              </tr>
            ))}
          </tbody>
        </table>

        <div  className="flex justify-end mb-16">
          <div  className="w-1/2">
            <div  className="flex justify-between p-3 bg-blue-50 text-blue-900 font-bold text-xl rounded-lg border border-blue-100">
              <span>TOTAL TAGIHAN</span>
              <span>Rp {invoiceData.total.toLocaleString('id-ID')}</span>
            </div>
          </div>
        </div>

        <div  className="text-center text-gray-500 text-sm mt-20 pt-8 border-t border-gray-200">
          <p>Terima kasih atas kepercayaan Anda bekerja sama dengan Sistem Company.</p>
          <p>Harap melakukan pembayaran sebelum tanggal jatuh tempo ke rekening BCA: 1234567890 a.n Sistem Company.</p>
        </div>
        {/* ================= AKHIR AREA KERTAS ================= */}
        
      </div>
    </div>
  );
}
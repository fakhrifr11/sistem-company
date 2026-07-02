import { sql } from '@vercel/postgres';
import { NextResponse } from 'next/server';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    
    // Log ini akan muncul di Vercel untuk memastikan pesan masuk
    console.log("Pesan masuk dari Telegram:", JSON.stringify(body));

    const message = body.message;
    if (!message || !message.text) {
      return NextResponse.json({ status: 'ignored' }, { status: 200 });
    }

    const chatId = message.chat.id;
    const text = message.text.trim();
    const token = process.env.TELEGRAM_BOT_TOKEN;

    // Pastikan token terbaca (tapi jangan tampilkan semua demi keamanan)
    console.log("Token bot terbaca awalan:", token ? token.substring(0, 5) : "TIDAK ADA TOKEN");

    let replyText = "Maaf Bos, perintah tidak dikenali. Coba ketik /bantuan";

    // ================= LOGIKA PERINTAH BOT =================
    if (text === '/start' || text === '/bantuan') {
      replyText = "Halo Bos! Saya adalah Asisten Sistem Company Anda.\nPerintah: /summary - Lihat ringkasan bisnis";
    } 
    else if (text === '/summary') {
      try {
        const { rows: projects } = await sql`SELECT status FROM projects`;
        const { rows: invoices } = await sql`SELECT total, status FROM invoices`;

        const projectProses = projects.filter(p => p.status === 'Proses').length;
        const pendapatanLunas = invoices
          .filter(inv => inv.status === 'Lunas')
          .reduce((sum, inv) => sum + parseFloat(inv.total), 0);
        const tagihanMenggantung = invoices
          .filter(inv => inv.status === 'Terkirim' || inv.status === 'Overdue')
          .reduce((sum, inv) => sum + parseFloat(inv.total), 0);

        // SAYA HAPUS MARKDOWN (Bintang/Bold) SEMENTARA AGAR AMAN DARI ERROR TELEGRAM
        replyText = `RINGKASAN BISNIS HARI INI\n\nProject Berjalan: ${projectProses} Pekerjaan\nTotal Omset Lunas: Rp ${pendapatanLunas.toLocaleString('id-ID')}\nTagihan Belum Cair: Rp ${tagihanMenggantung.toLocaleString('id-ID')}\n\nSemangat kerjanya Bos!`;
      } catch (dbError: any) {
        console.error("Error baca database di Telegram API:", dbError.message);
        replyText = "Waduh, saya gagal mengambil data dari database nih Bos.";
      }
    }

    // ================= KIRIM BALASAN KE TELEGRAM =================
    const telegramRes = await fetch(`https://api.telegram.org/bot${token}/sendMessage`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        chat_id: chatId,
        text: replyText
        // parse_mode: 'Markdown' <-- SAYA MATIKAN DULU SEMENTARA
      })
    });

    const telegramData = await telegramRes.json();
    
    // Log ini SANGAT PENTING untuk melihat jawaban asli dari server Telegram
    console.log("Jawaban dari server Telegram:", telegramData);

    return NextResponse.json({ status: 'success' }, { status: 200 });
    
  } catch (error: any) {
    console.error("Telegram Webhook Error Utama:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
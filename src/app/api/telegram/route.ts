import { sql } from '@vercel/postgres';
import { NextResponse } from 'next/server';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const message = body.message;

    // Jika yang masuk bukan teks biasa, abaikan saja
    if (!message || !message.text) {
      return NextResponse.json({ status: 'ignored' }, { status: 200 });
    }

    const chatId = message.chat.id;
    const text = message.text.trim();
    const token = process.env.TELEGRAM_BOT_TOKEN;

    let replyText = "Maaf Bos, perintah tidak dikenali. Coba ketik /bantuan";

    // ================= LOGIKA PERINTAH BOT =================
    if (text === '/start' || text === '/bantuan') {
      replyText = "Halo Bos! 🤖 Saya adalah Asisten Sistem Company Anda.\n\nPerintah yang tersedia:\n📊 `/summary` - Lihat ringkasan bisnis hari ini\n❓ `/bantuan` - Tampilkan pesan ini";
    } 
    else if (text === '/summary') {
      try {
        // Ambil data langsung dari Vercel Postgres
        const { rows: projects } = await sql`SELECT status FROM projects`;
        const { rows: invoices } = await sql`SELECT total, status FROM invoices`;

        const projectProses = projects.filter(p => p.status === 'Proses').length;
        const pendapatanLunas = invoices
          .filter(inv => inv.status === 'Lunas')
          .reduce((sum, inv) => sum + parseFloat(inv.total), 0);
        const tagihanMenggantung = invoices
          .filter(inv => inv.status === 'Terkirim' || inv.status === 'Overdue')
          .reduce((sum, inv) => sum + parseFloat(inv.total), 0);

        replyText = `📊 *RINGKASAN BISNIS HARI INI*\n\n🛠 *Project Berjalan:* ${projectProses} Pekerjaan\n💰 *Total Omset Lunas:* Rp ${pendapatanLunas.toLocaleString('id-ID')}\n⚠️ *Tagihan Belum Cair:* Rp ${tagihanMenggantung.toLocaleString('id-ID')}\n\nSemangat kerjanya Bos! 🚀`;
      } catch (dbError) {
        replyText = "Waduh, saya gagal mengambil data dari database nih Bos. Coba lagi nanti ya.";
      }
    }

    // ================= KIRIM BALASAN KE TELEGRAM =================
    await fetch(`https://api.telegram.org/bot${token}/sendMessage`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        chat_id: chatId,
        text: replyText,
        parse_mode: 'Markdown' // Agar bisa pakai huruf tebal (bold)
      })
    });

    // Harus selalu return 200 agar Telegram tahu pesan sudah kita terima
    return NextResponse.json({ status: 'success' }, { status: 200 });
    
  } catch (error: any) {
    console.error("Telegram Webhook Error:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
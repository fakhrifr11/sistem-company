import { sql } from '@vercel/postgres';
import { NextResponse } from 'next/server';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const message = body.message;

    if (!message || !message.text) {
      return NextResponse.json({ status: 'ignored' }, { status: 200 });
    }

    const chatId = message.chat.id;
    const text = message.text.trim();
    const token = process.env.TELEGRAM_BOT_TOKEN;
    const channelId = process.env.TELEGRAM_CHANNEL_ID; // <--- Ambil ID Channel dari Vercel

    let replyText = "Maaf Bos, perintah tidak dikenali. Coba ketik /bantuan";

    // ================= LOGIKA PERINTAH BOT =================
    
    // 1. PERINTAH BANTUAN
    if (text === '/start' || text === '/bantuan') {
      replyText = "Halo Bos! 🤖 Saya adalah Asisten Sistem Company Anda.\n\n*Perintah yang tersedia:*\n📊 `/summary` - Ringkasan bisnis hari ini\n➕ `/tambah Perusahaan - Nama Project - Keluhan` - Tambah job baru\n⚠️ `/tagihan` - Cek invoice belum lunas\n🛠 `/proses` - Cek project yang sedang berjalan\n❓ `/bantuan` - Tampilkan pesan ini";
    } 
    
    // 2. PERINTAH SUMMARY / RINGKASAN
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

        replyText = `📊 *RINGKASAN BISNIS HARI INI*\n\n🛠 *Project Berjalan:* ${projectProses} Pekerjaan\n💰 *Total Omset Lunas:* Rp ${pendapatanLunas.toLocaleString('id-ID')}\n⚠️ *Tagihan Belum Cair:* Rp ${tagihanMenggantung.toLocaleString('id-ID')}\n\nSemangat kerjanya Bos! 🚀`;
      } catch (dbError) {
        replyText = "Waduhh, saya gagal mengambil data dari database nih Bos.";
      }
    }
    
    // 3. PERINTAH CEK TAGIHAN MENGGANTUNG
    else if (text === '/tagihan') {
      try {
        const { rows: invoices } = await sql`SELECT perusahaan, total, status FROM invoices WHERE status IN ('Terkirim', 'Overdue') ORDER BY status DESC`;
        
        if (invoices.length === 0) {
          replyText = "✅ *Aman Bos!* Tidak ada tagihan yang menggantung.";
        } else {
          let listTagihan = "⚠️ *DAFTAR TAGIHAN BELUM LUNAS*\n\n";
          let totalMenunggu = 0;
          invoices.forEach((inv, index) => {
            listTagihan += `${index + 1}. *${inv.perusahaan}*\n   Nominal: Rp ${parseFloat(inv.total).toLocaleString('id-ID')}\n   Status: _${inv.status}_\n\n`;
            totalMenunggu += parseFloat(inv.total);
          });
          listTagihan += `💰 *Total Uang Menunggu:* Rp ${totalMenunggu.toLocaleString('id-ID')}`;
          replyText = listTagihan;
        }
      } catch (dbError) {
        replyText = "Waduh, gagal mengambil data tagihan dari database nih Bos.";
      }
    }

    // 4. PERINTAH CEK PROJECT BERJALAN
    else if (text === '/proses') {
      try {
        const { rows: projects } = await sql`SELECT perusahaan, nama_project, tgl_masuk FROM projects WHERE status = 'Proses' ORDER BY tgl_masuk ASC`;
        
        if (projects.length === 0) {
          replyText = "✅ *Santai Bos!* Tidak ada project yang berjalan saat ini.";
        } else {
          let listProses = "🛠 *DAFTAR PROJECT BERJALAN*\n\n";
          projects.forEach((proj, index) => {
            listProses += `${index + 1}. *${proj.perusahaan}*\n   Project: ${proj.nama_project}\n   Tgl Masuk: _${proj.tgl_masuk}_\n\n`;
          });
          replyText = listProses;
        }
      } catch (dbError) {
        replyText = "Waduh, gagal mengambil data project dari database nih Bos.";
      }
    }

    // 5. PERINTAH TAMBAH PROJECT BARU + BROADCAST CHANNEL
    else if (text.startsWith('/tambah ')) {
      const input = text.replace('/tambah ', '').split('-');
      
      if (input.length < 3) {
        replyText = "❌ *Format Salah Bos!*\n\nKetik dengan format seperti ini:\n`/tambah Nama Perusahaan - Nama Project - Keluhan`";
      } else {
        try {
          const perusahaan = input[0].trim();
          const namaProject = input[1].trim();
          const keluhan = input.slice(2).join('-').trim(); 
          
          const randomNum = Math.floor(Math.random() * 1000).toString().padStart(3, '0');
          const newId = `PRJ-${new Date().getFullYear()}${randomNum}`; 
          const tglMasuk = new Date().toISOString().split('T')[0];
          
          // 5A. Insert ke Database
          await sql`
            INSERT INTO projects (id, tgl_masuk, tgl_keluar, perusahaan, nama_project, keluhan, perbaikan, status, dokumentasi)
            VALUES (${newId}, ${tglMasuk}, '-', ${perusahaan}, ${namaProject}, ${keluhan}, '', 'Proses', '-')
          `;

          // 5B. Balasan ke Bos (Private Chat)
          replyText = `✅ *Siap Bos! Project Baru Tersimpan*\n\nData sudah dimasukkan ke database dan diumumkan ke Channel Tim!`;

          // 5C. Broadcast ke Channel
          if (channelId) {
            const broadcastText = `📢 *TUGAS BARU MASUK!*\n\n🏢 *Klien:* ${perusahaan}\n🛠 *Project:* ${namaProject}\n📝 *Keluhan:* ${keluhan}\n📅 *Tgl Masuk:* ${tglMasuk}\n\n_Mohon tim teknisi segera menindaklanjuti. Status: Proses_`;
            
            // Kirim pesan ke Channel (Berjalan di latar belakang tanpa mengganggu balasan ke bos)
            await fetch(`https://api.telegram.org/bot${token}/sendMessage`, {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({
                chat_id: channelId, // <--- Targetnya ID Channel
                text: broadcastText,
                parse_mode: 'Markdown'
              })
            }).catch(err => console.error("Gagal broadcast:", err));
          }

        } catch (dbError: any) {
          replyText = "❌ Gagal menyimpan data ke database. Coba cek formatnya lagi ya.";
        }
      }
    }

    // ================= KIRIM BALASAN KE PENGIRIM (BOS) =================
    await fetch(`https://api.telegram.org/bot${token}/sendMessage`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        chat_id: chatId, // <--- Targetnya ID Bos / Pengirim perintah
        text: replyText,
        parse_mode: 'Markdown'
      })
    });

    return NextResponse.json({ status: 'success' }, { status: 200 });
    
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
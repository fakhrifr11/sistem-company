import { sql } from '@vercel/postgres';
import { NextResponse } from 'next/server';

// 1. GET: Ambil semua invoice atau 1 invoice spesifik
export async function GET(request: Request) {
  try {
    const url = new URL(request.url);
    const id = url.searchParams.get("id");
    
    // Jika ada request ID spesifik (untuk halaman Print)
    if (id) {
      const { rows } = await sql`SELECT * FROM invoices WHERE id = ${id}`;
      return NextResponse.json({ data: rows }, { status: 200 });
    }

    // Jika tidak ada ID, panggil semua data (untuk tabel Dashboard)
    const { rows } = await sql`SELECT * FROM invoices ORDER BY id DESC`;
    return NextResponse.json({ data: rows }, { status: 200 });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
  
  // 2. POST: Simpan invoice baru
  export async function POST(request: Request) {
    try {
      const body = await request.json();
      // Ubah array item (pekerjaan) menjadi format string JSON agar bisa masuk database
      const itemsJson = JSON.stringify(body.items);
  
      await sql`
        INSERT INTO invoices (id, perusahaan, tanggal, jatuh_tempo, total, status, items)
        VALUES (${body.id}, ${body.perusahaan}, ${body.tanggal}, ${body.jatuh_tempo}, ${body.total}, ${body.status}, ${itemsJson})
      `;
      return NextResponse.json({ message: "Invoice berhasil disimpan" }, { status: 201 });
    } catch (error: any) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }
  }
  
  // 3. DELETE: Hapus invoice
  export async function DELETE(request: Request) {
    try {
      const url = new URL(request.url);
      const id = url.searchParams.get("id");
      
      if (!id) return NextResponse.json({ error: "ID tidak valid" }, { status: 400 });
  
      await sql`DELETE FROM invoices WHERE id = ${id}`;
      return NextResponse.json({ message: "Berhasil dihapus" }, { status: 200 });
    } catch (error: any) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }
  }

  // 4. PUT: Mengubah data invoice yang sudah ada
export async function PUT(request: Request) {
  try {
    const body = await request.json();
    const itemsJson = JSON.stringify(body.items);

    await sql`
      UPDATE invoices 
      SET perusahaan = ${body.perusahaan}, 
          tanggal = ${body.tanggal}, 
          jatuh_tempo = ${body.jatuh_tempo}, 
          total = ${body.total}, 
          status = ${body.status}, 
          items = ${itemsJson}
      WHERE id = ${body.id}
    `;
    return NextResponse.json({ message: "Invoice berhasil diperbarui" }, { status: 200 });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
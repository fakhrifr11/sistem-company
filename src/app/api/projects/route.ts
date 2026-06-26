// File: app/api/projects/route.ts
import { sql } from '@vercel/postgres';
import { NextResponse } from 'next/server';

// 1. GET: Mengambil Data
export async function GET() {
  try {
    const { rows } = await sql`SELECT * FROM projects ORDER BY id ASC`;
    return NextResponse.json({ data: rows }, { status: 200 });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

// 2. POST: Menambah Data Baru
export async function POST(request: Request) {
  try {
    const body = await request.json();
    await sql`
      INSERT INTO projects (id, tgl_masuk, tgl_keluar, perusahaan, nama_project, keluhan, perbaikan, status, dokumentasi)
      VALUES (${body.id}, ${body.tgl_masuk}, ${body.tgl_keluar}, ${body.perusahaan}, ${body.nama_project}, ${body.keluhan}, ${body.perbaikan}, ${body.status}, ${body.dokumentasi})
    `;
    return NextResponse.json({ message: "Berhasil disimpan" }, { status: 201 });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

// 3. PUT: Mengubah Data (Edit Full atau sekadar Edit Status)
export async function PUT(request: Request) {
  try {
    const body = await request.json();
    
    // Logika cerdas: Jika ada nama_project, berarti ini form edit utuh. Jika tidak, ini hanya toggle tombol status.
    if (body.nama_project) {
      await sql`
        UPDATE projects 
        SET tgl_masuk = ${body.tgl_masuk}, tgl_keluar = ${body.tgl_keluar}, perusahaan = ${body.perusahaan}, 
            nama_project = ${body.nama_project}, keluhan = ${body.keluhan}, perbaikan = ${body.perbaikan}, 
            status = ${body.status}, dokumentasi = ${body.dokumentasi}
        WHERE id = ${body.id}
      `;
    } else {
      await sql`
        UPDATE projects 
        SET status = ${body.status}, tgl_keluar = ${body.tgl_keluar}
        WHERE id = ${body.id}
      `;
    }
    return NextResponse.json({ message: "Berhasil diubah" }, { status: 200 });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

// 4. DELETE: Menghapus Data
export async function DELETE(request: Request) {
  try {
    const url = new URL(request.url);
    const id = url.searchParams.get("id");
    
    if (!id) return NextResponse.json({ error: "ID tidak valid" }, { status: 400 });

    await sql`DELETE FROM projects WHERE id = ${id}`;
    return NextResponse.json({ message: "Berhasil dihapus" }, { status: 200 });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
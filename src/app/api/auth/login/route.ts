import { sql } from '@vercel/postgres';
import { NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';

export async function POST(request: Request) {
  try {
    const { email, password } = await request.json();

    // Cari user berdasarkan email
    const { rows } = await sql`SELECT * FROM users WHERE email = ${email}`;
    if (rows.length === 0) {
      return NextResponse.json({ error: "Email tidak ditemukan!" }, { status: 404 });
    }

    const user = rows[0];

    // Cocokkan password yang diketik dengan password yang diacak di database
    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      return NextResponse.json({ error: "Password salah!" }, { status: 401 });
    }

    // Berhasil Login! Kembalikan data user TANPA password
    return NextResponse.json({
      message: "Login Berhasil",
      user: { id: user.id, name: user.name, email: user.email }
    }, { status: 200 });

  } catch (error: any) {
    return NextResponse.json({ error: "Terjadi kesalahan server" }, { status: 500 });
  }
}
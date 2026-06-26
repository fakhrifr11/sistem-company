import { sql } from '@vercel/postgres';
import { NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';

export async function POST(request: Request) {
  try {
    const { name, email, password } = await request.json();
    
    // Acak password sebelum disimpan ke database
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    await sql`
      INSERT INTO users (name, email, password)
      VALUES (${name}, ${email}, ${hashedPassword})
    `;
    
    return NextResponse.json({ message: "Akun berhasil dibuat!" }, { status: 201 });
  } catch (error: any) {
    return NextResponse.json({ error: "Gagal membuat akun. Email mungkin sudah terdaftar." }, { status: 500 });
  }
}
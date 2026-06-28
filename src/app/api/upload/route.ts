import { put } from '@vercel/blob';
import { NextResponse } from 'next/server';

export async function POST(request: Request) {
  try {
    const formData = await request.formData();
    const file = formData.get('file') as File;
    
    if (!file) {
      return NextResponse.json({ error: "Tidak ada file yang diunggah" }, { status: 400 });
    }

    // Mengunggah file ke Vercel Blob secara publik
    const blob = await put(file.name, file, {
      access: 'public',
    });

    // Mengembalikan URL asli dari foto tersebut
    return NextResponse.json({ url: blob.url }, { status: 200 });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
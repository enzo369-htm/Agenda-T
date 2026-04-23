import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { writeFile, mkdir } from 'fs/promises';
import path from 'path';
import { randomBytes } from 'crypto';

const ALLOWED_TYPES = ['image/jpeg', 'image/png', 'image/gif', 'image/webp'];
const MAX_SIZE = 10 * 1024 * 1024; // 10MB

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'No autorizado' }, { status: 401 });
    }

    const formData = await request.formData();
    const logoFile = formData.get('logo') as File | null;
    const coverFile = formData.get('cover') as File | null;
    const file = logoFile instanceof File ? logoFile : coverFile instanceof File ? coverFile : null;
    const isCover = !!coverFile && coverFile instanceof File;

    if (!file || !(file instanceof File)) {
      return NextResponse.json(
        { error: 'Seleccioná una imagen' },
        { status: 400 }
      );
    }

    if (!ALLOWED_TYPES.includes(file.type)) {
      return NextResponse.json(
        { error: 'Formato no permitido. Usá JPG, PNG, GIF o WebP.' },
        { status: 400 }
      );
    }

    if (file.size > MAX_SIZE) {
      return NextResponse.json(
        { error: 'La imagen no puede superar 10 MB' },
        { status: 400 }
      );
    }

    const ext = path.extname(file.name) || '.jpg';
    const safeExt = ['.jpg', '.jpeg', '.png', '.gif', '.webp'].includes(ext.toLowerCase())
      ? ext.toLowerCase()
      : '.jpg';
    const filename = `${randomBytes(8).toString('hex')}${safeExt}`;
    const subdir = isCover ? 'covers' : 'logos';
    const uploadDir = path.join(process.cwd(), 'public', 'uploads', subdir);

    await mkdir(uploadDir, { recursive: true });

    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);
    const filepath = path.join(uploadDir, filename);

    await writeFile(filepath, buffer);

    const url = `/uploads/${subdir}/${filename}`;
    return NextResponse.json({ url });
  } catch (error) {
    console.error('Upload logo error:', error);
    return NextResponse.json(
      { error: 'Error al subir la imagen' },
      { status: 500 }
    );
  }
}

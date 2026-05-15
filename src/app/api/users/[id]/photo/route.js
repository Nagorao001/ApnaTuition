import { NextResponse } from 'next/server';
import getDb from '@/lib/db';
import { getUserFromRequest } from '@/lib/auth';
export async function POST(request, { params }) {
  const user = getUserFromRequest(request);
  if (!user || user.role !== 'admin') return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
  
  const { id } = await params;
  const formData = await request.formData();
  const file = formData.get('photo');
  
  if (!file || file.size === 0) {
    return NextResponse.json({ error: 'No file provided' }, { status: 400 });
  }

  const buffer = Buffer.from(await file.arrayBuffer());
  const base64 = buffer.toString('base64');
  const mime = file.type || 'image/jpeg';
  const dataUri = `data:${mime};base64,${base64}`;

  const db = getDb();
  await db.query('UPDATE users SET photo_url = $1 WHERE id = $2', [dataUri, id]);
  
  return NextResponse.json({ message: 'Photo uploaded successfully', photo_url: dataUri });
}

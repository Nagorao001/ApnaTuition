import { NextResponse } from 'next/server';
import getDb from '@/lib/db';
import { getUserFromRequest } from '@/lib/auth';
import { v4 as uuidv4 } from 'uuid';

export async function GET(request) {
  const user = getUserFromRequest(request);
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  const db = getDb();
  const testsRes = await db.query('SELECT * FROM tests ORDER BY created_at DESC');
  return NextResponse.json({ tests: testsRes.rows });
}

export async function POST(request) {
  const user = getUserFromRequest(request);
  if (!user || user.role !== 'admin') return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
  const formData = await request.formData();
  const title = formData.get('title');
  const subject = formData.get('subject');
  const type = formData.get('type') || 'weekly';
  const date = formData.get('date');
  const duration = parseInt(formData.get('duration')) || 60;
  const file = formData.get('file');
  const id = uuidv4();
  
  let filePath = null, fileName = null;
  if (file && file.size > 0) {
    fileName = file.name;
    const buffer = Buffer.from(await file.arrayBuffer());
    const base64 = buffer.toString('base64');
    const mime = file.type || 'application/pdf';
    filePath = `data:${mime};base64,${base64}`;
  }
  
  const db = getDb();
  await db.query(
    'INSERT INTO tests (id, title, subject, type, date, duration, file_path, file_name, assigned_to, created_by) VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10)',
    [id, title, subject, type, date, duration, filePath, fileName, 'all', user.id]
  );
  return NextResponse.json({ id, title }, { status: 201 });
}

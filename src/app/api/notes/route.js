import { NextResponse } from 'next/server';
import getDb from '@/lib/db';
import { getUserFromRequest } from '@/lib/auth';
import { v4 as uuidv4 } from 'uuid';

export const dynamic = 'force-dynamic';

export async function GET(request) {
  const user = getUserFromRequest(request);
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  const db = getDb();
  const { searchParams } = new URL(request.url);
  const subject = searchParams.get('subject');
  let query = 'SELECT * FROM notes';
  const params = [];
  if (subject) {
    query += ' WHERE subject = $1';
    params.push(subject);
  }
  query += ' ORDER BY uploaded_at DESC';
  const notesRes = await db.query(query, params);
  const foldersRes = await db.query('SELECT subject as name, COUNT(*) as count FROM notes GROUP BY subject');
  return NextResponse.json({ 
    notes: notesRes.rows, 
    folders: foldersRes.rows.map(f => ({ name: f.name, count: parseInt(f.count, 10) }))
  });
}

export async function POST(request) {
  const user = getUserFromRequest(request);
  if (!user || user.role !== 'admin') return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
  const formData = await request.formData();
  const title = formData.get('title');
  const subject = formData.get('subject');
  const grade = formData.get('grade');
  const file = formData.get('file');
  const id = uuidv4();
  
  let filePath = null, fileName = null, fileSize = 0;
  if (file && file.size > 0) {
    fileName = file.name;
    fileSize = file.size;
    const buffer = Buffer.from(await file.arrayBuffer());
    const base64 = buffer.toString('base64');
    const mime = file.type || 'application/octet-stream';
    filePath = `data:${mime};base64,${base64}`;
  }
  
  const db = getDb();
  await db.query(
    'INSERT INTO notes (id, title, subject, folder, grade, file_path, file_name, file_size, assigned_to, uploaded_by) VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10)',
    [id, title, subject, subject, grade, filePath, fileName, fileSize, 'all', user.id]
  );
  return NextResponse.json({ id, title, subject }, { status: 201 });
}

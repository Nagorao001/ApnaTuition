import { NextResponse } from 'next/server';
import getDb from '@/lib/db';
import { getUserFromRequest } from '@/lib/auth';
import { v4 as uuidv4 } from 'uuid';

export async function GET(request) {
  const user = getUserFromRequest(request);
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  const db = getDb();
  const gamesRes = await db.query('SELECT * FROM games ORDER BY created_at DESC');
  return NextResponse.json({ games: gamesRes.rows });
}

export async function POST(request) {
  const user = getUserFromRequest(request);
  if (!user || user.role !== 'admin') return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
  const db = getDb();
  const { title, subject, difficulty, description, url, type, icon } = await request.json();
  const id = uuidv4();
  await db.query(
    'INSERT INTO games (id, title, subject, difficulty, description, url, type, icon, enabled) VALUES ($1,$2,$3,$4,$5,$6,$7,$8,1)',
    [id, title, subject, difficulty || 'medium', description, url, type || 'embed', icon || 'gamepad']
  );
  return NextResponse.json({ id, title }, { status: 201 });
}

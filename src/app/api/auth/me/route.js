import { NextResponse } from 'next/server';
import { getUserFromRequest } from '@/lib/auth';
import getDb from '@/lib/db';

export async function GET(request) {
  const tokenUser = getUserFromRequest(request);
  if (!tokenUser) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  const db = getDb();
  const userRes = await db.query('SELECT id, name, email, student_id, role, grade, status, theme_preference, photo_url FROM users WHERE id = $1', [tokenUser.id]);
  const user = userRes.rows[0];
  if (!user) return NextResponse.json({ error: 'User not found' }, { status: 404 });
  return NextResponse.json({ user });
}

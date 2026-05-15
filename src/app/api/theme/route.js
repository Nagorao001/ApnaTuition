import { NextResponse } from 'next/server';
import getDb from '@/lib/db';
import { getUserFromRequest } from '@/lib/auth';

export async function PUT(request) {
  const user = getUserFromRequest(request);
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  const db = getDb();
  const { theme } = await request.json();
  await db.query('UPDATE users SET theme_preference = $1 WHERE id = $2', [theme, user.id]);
  return NextResponse.json({ message: 'Theme updated' });
}

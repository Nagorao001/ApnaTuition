import { NextResponse } from 'next/server';
import getDb from '@/lib/db';
import { getUserFromRequest } from '@/lib/auth';

export async function DELETE(request, { params }) {
  const user = getUserFromRequest(request);
  if (!user || user.role !== 'admin') return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
  const { id } = await params;
  const db = getDb();
  await db.query('DELETE FROM games WHERE id = $1', [id]);
  return NextResponse.json({ message: 'Deleted' });
}

export async function PUT(request, { params }) {
  const user = getUserFromRequest(request);
  if (!user || user.role !== 'admin') return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
  const { id } = await params;
  const db = getDb();
  const { enabled } = await request.json();
  if (enabled !== undefined) {
    await db.query('UPDATE games SET enabled = $1 WHERE id = $2', [enabled ? 1 : 0, id]);
  }
  return NextResponse.json({ message: 'Updated' });
}

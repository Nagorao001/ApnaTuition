import { NextResponse } from 'next/server';
import getDb from '@/lib/db';
import { getUserFromRequest } from '@/lib/auth';

export async function DELETE(request, { params }) {
  const user = getUserFromRequest(request);
  if (!user || user.role !== 'admin') return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
  const { id } = await params;
  const db = getDb();
  await db.query('DELETE FROM scores WHERE test_id = $1', [id]);
  await db.query('DELETE FROM tests WHERE id = $1', [id]);
  return NextResponse.json({ message: 'Deleted' });
}

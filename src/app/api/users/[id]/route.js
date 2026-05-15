import { NextResponse } from 'next/server';
import getDb from '@/lib/db';
import { getUserFromRequest } from '@/lib/auth';

export async function PUT(request, { params }) {
  const user = getUserFromRequest(request);
  if (!user || user.role !== 'admin') return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
  const { id } = await params;
  const db = getDb();
  const body = await request.json();
  const { name, grade, status } = body;
  await db.query(
    'UPDATE users SET name = COALESCE($1, name), grade = COALESCE($2, grade), status = COALESCE($3, status), updated_at = CURRENT_TIMESTAMP WHERE id = $4',
    [name, grade, status, id]
  );
  return NextResponse.json({ message: 'Updated' });
}

export async function DELETE(request, { params }) {
  const user = getUserFromRequest(request);
  if (!user || user.role !== 'admin') return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
  const { id } = await params;
  const db = getDb();
  await db.query("UPDATE users SET status = 'inactive' WHERE id = $1", [id]);
  return NextResponse.json({ message: 'Deactivated' });
}

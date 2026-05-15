import { NextResponse } from 'next/server';
import getDb from '@/lib/db';
import { getUserFromRequest } from '@/lib/auth';

export async function PUT(request, { params }) {
  const user = getUserFromRequest(request);
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  
  const { id } = await params;
  const db = getDb();
  
  // Ensure the user is the receiver before marking as read
  await db.query('UPDATE messages SET is_read = 1 WHERE id = $1 AND receiver_id = $2', [id, user.id]);
  
  return NextResponse.json({ message: 'Marked as read' });
}

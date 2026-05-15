import { NextResponse } from 'next/server';
import getDb from '@/lib/db';
import { getUserFromRequest } from '@/lib/auth';
import { v4 as uuidv4 } from 'uuid';

export async function GET(request) {
  const user = getUserFromRequest(request);
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  
  const db = getDb();
  let messagesRes;
  
  if (user.role === 'admin') {
    messagesRes = await db.query(`
      SELECT m.*, u.name as sender_name, u.photo_url as sender_photo
      FROM messages m
      JOIN users u ON m.sender_id = u.id
      ORDER BY m.created_at DESC
    `);
  } else {
    messagesRes = await db.query(`
      SELECT m.*, u.name as sender_name, u.photo_url as sender_photo
      FROM messages m
      JOIN users u ON m.sender_id = u.id
      WHERE m.sender_id = $1 OR m.receiver_id = $2
      ORDER BY m.created_at ASC
    `, [user.id, user.id]);
  }
  
  return NextResponse.json({ messages: messagesRes.rows });
}

export async function POST(request) {
  const user = getUserFromRequest(request);
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  
  const db = getDb();
  const { receiver_id, subject, body } = await request.json();
  
  let actual_receiver = receiver_id;
  if (receiver_id === 'admin') {
    const adminUserRes = await db.query("SELECT id FROM users WHERE role = 'admin' LIMIT 1");
    if (adminUserRes.rows[0]) actual_receiver = adminUserRes.rows[0].id;
  }
  
  if (!actual_receiver || !body) return NextResponse.json({ error: 'Receiver ID and body required' }, { status: 400 });
  
  const id = uuidv4();
  await db.query(`
    INSERT INTO messages (id, sender_id, receiver_id, subject, body, is_read)
    VALUES ($1, $2, $3, $4, $5, 0)
  `, [id, user.id, actual_receiver, subject || '', body]);
  
  return NextResponse.json({ id, message: 'Message sent' }, { status: 201 });
}

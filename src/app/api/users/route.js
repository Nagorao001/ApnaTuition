import { NextResponse } from 'next/server';
import getDb from '@/lib/db';
import { getUserFromRequest, hashPassword } from '@/lib/auth';
import { v4 as uuidv4 } from 'uuid';

export async function GET(request) {
  const user = getUserFromRequest(request);
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  const db = getDb();
  const { searchParams } = new URL(request.url);
  const grade = searchParams.get('grade');
  const status = searchParams.get('status');
  const search = searchParams.get('search');
  let query = 'SELECT id, name, email, student_id, grade, status, photo_url, created_at FROM users WHERE role = $1';
  const params = ['student'];
  let paramIndex = 2;
  if (grade) { query += ` AND grade = $${paramIndex++}`; params.push(grade); }
  if (status) { query += ` AND status = $${paramIndex++}`; params.push(status); }
  if (search) { query += ` AND (name ILIKE $${paramIndex} OR email ILIKE $${paramIndex} OR student_id ILIKE $${paramIndex++})`; params.push(`%${search}%`); }
  query += ' ORDER BY created_at DESC';
  
  const studentsRes = await db.query(query, params);
  const students = studentsRes.rows;
  
  const totalRes = await db.query('SELECT COUNT(*) as count FROM users WHERE role = $1', ['student']);
  const activeRes = await db.query("SELECT COUNT(*) as count FROM users WHERE role = $1 AND status = 'active'", ['student']);
  const pendingRes = await db.query("SELECT COUNT(*) as count FROM users WHERE role = $1 AND status = 'pending'", ['student']);
  
  return NextResponse.json({ 
    students, 
    total: parseInt(totalRes.rows[0].count, 10), 
    active: parseInt(activeRes.rows[0].count, 10), 
    pending: parseInt(pendingRes.rows[0].count, 10) 
  });
}

export async function POST(request) {
  const user = getUserFromRequest(request);
  if (!user || user.role !== 'admin') return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
  const db = getDb();
  const { name, email, grade, password, student_id } = await request.json();
  if (!name || !email || !student_id) return NextResponse.json({ error: 'Name, email, and Student ID required' }, { status: 400 });
  const existingRes = await db.query('SELECT id FROM users WHERE email = $1 OR student_id = $2', [email, student_id]);
  if (existingRes.rows.length > 0) return NextResponse.json({ error: 'Email or Student ID already exists' }, { status: 409 });
  const hash = await hashPassword(password || 'student123');
  const id = uuidv4();
  await db.query(
    'INSERT INTO users (id, name, email, student_id, role, password_hash, grade, status) VALUES ($1,$2,$3,$4,$5,$6,$7,$8)',
    [id, name, email, student_id, 'student', hash, grade || '', 'active']
  );
  return NextResponse.json({ id, name, email, student_id, grade, status: 'active' }, { status: 201 });
}

import { NextResponse } from 'next/server';
import getDb from '@/lib/db';
import { getUserFromRequest } from '@/lib/auth';
import { v4 as uuidv4 } from 'uuid';

export async function GET(request) {
  const user = getUserFromRequest(request);
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  const db = getDb();
  const { searchParams } = new URL(request.url);
  const studentId = searchParams.get('student_id');
  if (studentId) {
    const scoresRes = await db.query(`SELECT s.*, t.title as test_title, t.subject, t.type, t.date as test_date FROM scores s JOIN tests t ON s.test_id = t.id WHERE s.student_id = $1 ORDER BY s.graded_at DESC`, [studentId]);
    return NextResponse.json({ scores: scoresRes.rows });
  }
  const scoresRes = await db.query(`SELECT s.*, t.title as test_title, t.subject, t.type, u.name as student_name FROM scores s JOIN tests t ON s.test_id = t.id JOIN users u ON s.student_id = u.id ORDER BY s.graded_at DESC`);
  return NextResponse.json({ scores: scoresRes.rows });
}

export async function POST(request) {
  const user = getUserFromRequest(request);
  if (!user || user.role !== 'admin') return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
  const db = getDb();
  const { student_id, test_id, score, max_score, feedback } = await request.json();
  const id = uuidv4();
  await db.query(
    'INSERT INTO scores (id, student_id, test_id, score, max_score, feedback, status) VALUES ($1,$2,$3,$4,$5,$6,$7)',
    [id, student_id, test_id, score, max_score || 100, feedback || '', 'graded']
  );
  return NextResponse.json({ id }, { status: 201 });
}

import { NextResponse } from 'next/server';
import getDb from '@/lib/db';
import { getUserFromRequest } from '@/lib/auth';

export async function GET(request) {
  const user = getUserFromRequest(request);
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  const db = getDb();
  const stats = {};
  const totalStudentsRes = await db.query("SELECT COUNT(*) as c FROM users WHERE role = 'student'");
  stats.totalStudents = parseInt(totalStudentsRes.rows[0].c, 10);
  
  const activeStudentsRes = await db.query("SELECT COUNT(*) as c FROM users WHERE role = 'student' AND status = 'active'");
  stats.activeStudents = parseInt(activeStudentsRes.rows[0].c, 10);
  
  const totalNotesRes = await db.query('SELECT COUNT(*) as c FROM notes');
  stats.totalNotes = parseInt(totalNotesRes.rows[0].c, 10);
  
  const totalTestsRes = await db.query('SELECT COUNT(*) as c FROM tests');
  stats.totalTests = parseInt(totalTestsRes.rows[0].c, 10);
  
  const totalScoresRes = await db.query('SELECT COUNT(*) as c FROM scores');
  stats.totalScores = parseInt(totalScoresRes.rows[0].c, 10);
  
  const pendingAssignmentsRes = await db.query("SELECT COUNT(*) as c FROM scores WHERE status = 'pending'");
  stats.pendingAssignments = parseInt(pendingAssignmentsRes.rows[0].c, 10) + Math.floor(stats.totalTests * 0.6);
  
  const avgScoreRes = await db.query('SELECT AVG(score) as avg FROM scores');
  stats.avgScore = avgScoreRes.rows[0].avg ? Math.round(parseFloat(avgScoreRes.rows[0].avg) * 10) / 10 : 0;
  
  const recentActivityRes = await db.query(`SELECT a.*, u.name as user_name FROM activity_log a JOIN users u ON a.user_id = u.id ORDER BY a.created_at DESC LIMIT 10`);
  stats.recentActivity = recentActivityRes.rows;
  return NextResponse.json(stats);
}

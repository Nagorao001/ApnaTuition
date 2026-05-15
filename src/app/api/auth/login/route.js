import { NextResponse } from 'next/server';
import getDb, { initTables } from '@/lib/db';
import { comparePassword, generateToken } from '@/lib/auth';
import { seedDatabase } from '@/lib/seed';
import { rateLimit } from '@/lib/rate-limit';

export async function POST(request) {
  try {
    const ip = request.headers.get('x-forwarded-for') || '127.0.0.1';
    if (!rateLimit(ip)) {
      return NextResponse.json({ error: 'Too many requests. Please try again later.' }, { status: 429 });
    }

    const db = getDb();
    // Ensure tables exist in Postgres
    await initTables();
    
    // Auto-seed on first login attempt
    const adminCheck = await db.query('SELECT id FROM users WHERE role = $1', ['admin']);
    const adminExists = adminCheck.rows[0];
    if (!adminExists) { await seedDatabase(); }

    const { email, password } = await request.json();
    if (!email || !password) {
      return NextResponse.json({ error: 'Email and password required' }, { status: 400 });
    }
    const userRes = await db.query('SELECT * FROM users WHERE email = $1', [email]);
    const user = userRes.rows[0];
    if (!user) {
      return NextResponse.json({ error: 'Invalid credentials' }, { status: 401 });
    }
    if (user.status === 'inactive') {
      return NextResponse.json({ error: 'Account is deactivated' }, { status: 403 });
    }
    const valid = await comparePassword(password, user.password_hash);
    if (!valid) {
      return NextResponse.json({ error: 'Invalid credentials' }, { status: 401 });
    }
    const token = generateToken(user);
    const response = NextResponse.json({
      message: 'Login successful',
      role: user.role,
      name: user.name,
      theme_preference: user.theme_preference,
    });
    response.cookies.set('auth-token', token, {
      httpOnly: true, secure: false, sameSite: 'lax',
      maxAge: 60 * 60 * 24 * 7, path: '/',
    });
    return response;
  } catch (error) {
    console.error('Login error:', error);
    return NextResponse.json({ error: 'Server error' }, { status: 500 });
  }
}

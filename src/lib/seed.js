import getDb from './db.js';
import { hashPassword } from './auth.js';
import { v4 as uuidv4 } from 'uuid';

export async function seedDatabase() {
  const db = getDb();

  // Check if already seeded
  const existingAdminRes = await db.query('SELECT id FROM users WHERE role = $1', ['admin']);
  if (existingAdminRes.rows.length > 0) {
    console.log('Database already seeded. Skipping.');
    return;
  }

  console.log('Seeding database...');

  // --- Admin ---
  const adminId = uuidv4();
  const adminHash = await hashPassword('Kute@2910pk');
  await db.query(`
    INSERT INTO users (id, name, email, role, password_hash, status) 
    VALUES ($1, $2, $3, $4, $5, $6)
  `, [adminId, 'Prajwal Kute', 'kuteprajwal@gmail.com', 'admin', adminHash, 'active']);

  // --- Notes ---
  const notes = [
    { title: 'Algebra Formulas Chapter 4', subject: 'Mathematics', folder: 'Mathematics', grade: '10th Grade' },
    { title: 'Hamlet Character Analysis', subject: 'English Lit', folder: 'English Lit', grade: '11th Grade' },
    { title: 'Cell Structure Diagram', subject: 'Science', folder: 'Science', grade: '9th Grade' },
    { title: 'Quadratic Equations', subject: 'Mathematics', folder: 'Mathematics', grade: '10th Grade' },
    { title: 'Photosynthesis Process', subject: 'Science', folder: 'Science', grade: '10th Grade' },
    { title: 'Poetry Analysis Guide', subject: 'English Lit', folder: 'English Lit', grade: '10th Grade' },
    { title: 'Trigonometry Basics', subject: 'Mathematics', folder: 'Mathematics', grade: '9th Grade' },
    { title: 'Newton Laws of Motion', subject: 'Science', folder: 'Science', grade: '11th Grade' },
    { title: 'Essay Writing Structure', subject: 'English Lit', folder: 'English Lit', grade: '9th Grade' },
    { title: 'Geometry Theorems', subject: 'Mathematics', folder: 'Mathematics', grade: '10th Grade' },
    { title: 'Chemical Bonding', subject: 'Science', folder: 'Science', grade: '10th Grade' },
    { title: 'Shakespeare Sonnets', subject: 'English Lit', folder: 'English Lit', grade: '11th Grade' },
  ];

  for (const n of notes) {
    await db.query(`
      INSERT INTO notes (id, title, subject, folder, grade, file_path, file_name, file_size, assigned_to, uploaded_by) 
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)
    `, [uuidv4(), n.title, n.subject, n.folder, n.grade, null, null, 0, 'all', adminId]);
  }

  // --- Tests ---
  const testData = [
    { title: 'Algebra Basics', subject: 'Mathematics', type: 'weekly', duration: 45 },
    { title: 'Kinematics', subject: 'Physics', type: 'weekly', duration: 40 },
    { title: 'Core Sciences', subject: 'Science', type: 'monthly', duration: 90 },
    { title: 'English Literature', subject: 'English Lit', type: 'monthly', duration: 60 },
    { title: 'Geometry Fundamentals', subject: 'Mathematics', type: 'weekly', duration: 45 },
  ];

  for (const t of testData) {
    await db.query(`
      INSERT INTO tests (id, title, subject, type, duration, assigned_to, created_by) 
      VALUES ($1, $2, $3, $4, $5, $6, $7)
    `, [uuidv4(), t.title, t.subject, t.type, t.duration, 'all', adminId]);
  }

  // --- Games ---
  const games = [
    {
      title: 'Math Quest', subject: 'Mathematics', difficulty: 'medium',
      description: 'Embark on an epic journey to solve complex equations and save the geometric realm from chaos. Perfect for algebra and geometry practice.',
      url: 'https://www.mathplayground.com/math-games.html', icon: 'calculator',
    },
    {
      title: 'Grammar Hero', subject: 'Language Arts', difficulty: 'easy',
      description: 'Defeat syntax errors and punctuate your way to victory in this fast-paced typing and grammar challenge.',
      url: 'https://www.grammarninjas.com', icon: 'book',
    },
    {
      title: 'Logic Puzzles', subject: 'Critical Thinking', difficulty: 'hard',
      description: 'Test your spatial reasoning and deduction skills with a daily rotating set of mind-bending puzzles.',
      url: 'https://www.puzzle-nonograms.com', icon: 'puzzle',
    },
    {
      title: 'Lab Simulator', subject: 'Science', difficulty: 'medium',
      description: 'Conduct virtual chemistry experiments safely. Mix compounds and observe reactions in real-time.',
      url: 'https://phet.colorado.edu/sims/html/build-a-molecule/latest/build-a-molecule_all.html', icon: 'flask',
    },
  ];

  for (const g of games) {
    await db.query(`
      INSERT INTO games (id, title, subject, difficulty, description, url, type, icon, enabled) 
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8, 1)
    `, [uuidv4(), g.title, g.subject, g.difficulty, g.description, g.url, 'embed', g.icon]);
  }

  console.log('Database seeded successfully!');
  console.log('Admin: kuteprajwal@gmail.com / Kute@2910pk');
}

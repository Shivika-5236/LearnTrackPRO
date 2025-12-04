import * as SQLite from 'expo-sqlite';

// Open or create database
const db = SQLite.openDatabaseSync('learntrack.db');

// Initialize database with schema
export const initDatabase = () => {
  try {
    // Create users table
    db.execSync(`
      CREATE TABLE IF NOT EXISTS users (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        email TEXT UNIQUE NOT NULL,
        password TEXT NOT NULL,
        name TEXT NOT NULL,
        college TEXT NOT NULL,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP
      );
    `);

    // Create courses table
    db.execSync(`
      CREATE TABLE IF NOT EXISTS courses (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        user_id INTEGER NOT NULL,
        title TEXT NOT NULL,
        description TEXT,
        instructor TEXT,
        total_hours INTEGER,
        credits INTEGER,
        tag TEXT CHECK(tag IN ('Self', 'College')),
        progress INTEGER DEFAULT 0,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
      );
    `);

    // Create assignments table
    db.execSync(`
      CREATE TABLE IF NOT EXISTS assignments (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        course_id INTEGER NOT NULL,
        title TEXT NOT NULL,
        description TEXT,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (course_id) REFERENCES courses(id) ON DELETE CASCADE
      );
    `);

    // Create notes table
    db.execSync(`
      CREATE TABLE IF NOT EXISTS notes (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        course_id INTEGER NOT NULL,
        heading TEXT NOT NULL,
        content TEXT,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (course_id) REFERENCES courses(id) ON DELETE CASCADE
      );
    `);

    // Create projects table
    db.execSync(`
      CREATE TABLE IF NOT EXISTS projects (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        course_id INTEGER NOT NULL,
        name TEXT NOT NULL,
        tech_stack TEXT,
        details TEXT,
        pdf_url TEXT,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (course_id) REFERENCES courses(id) ON DELETE CASCADE
      );
    `);

    // Create tasks table
    db.execSync(`
      CREATE TABLE IF NOT EXISTS tasks (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        user_id INTEGER NOT NULL,
        title TEXT NOT NULL,
        details TEXT,
        deadline TEXT,
        priority TEXT CHECK(priority IN ('Low', 'Medium', 'High')),
        status TEXT CHECK(status IN ('Not started', 'Doing', 'Completed')),
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
      );
    `);

    // Create focus_blocks table
    db.execSync(`
      CREATE TABLE IF NOT EXISTS focus_blocks (\n        id INTEGER PRIMARY KEY AUTOINCREMENT,
        user_id INTEGER NOT NULL,
        title TEXT NOT NULL,
        details TEXT,
        day TEXT,
        date TEXT,
        time TEXT,
        duration INTEGER,
        color TEXT,
        is_active INTEGER DEFAULT 0,
        is_paused INTEGER DEFAULT 0,
        elapsed_time INTEGER DEFAULT 0,
        flagged_times TEXT,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
      );
    `);

    // Create study_sessions table
    db.execSync(`
      CREATE TABLE IF NOT EXISTS study_sessions (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        user_id INTEGER NOT NULL,
        course TEXT NOT NULL,
        duration TEXT,
        focus TEXT,
        logged_at TEXT,
        color TEXT,
        session_date TEXT,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
      );
    `);

    // Migration: Add new columns to focus_blocks if they don't exist
    try {
      // Check if columns exist by trying to select them
      const checkColumns = db.getFirstSync('SELECT is_active, is_paused, elapsed_time, flagged_times FROM focus_blocks LIMIT 1');
    } catch (error) {
      // Columns don't exist, add them
      console.log('Migrating focus_blocks table - adding new columns...');
      try {
        db.execSync('ALTER TABLE focus_blocks ADD COLUMN is_active INTEGER DEFAULT 0;');
      } catch (e) {
        // Column might already exist
      }
      try {
        db.execSync('ALTER TABLE focus_blocks ADD COLUMN is_paused INTEGER DEFAULT 0;');
      } catch (e) {
        // Column might already exist
      }
      try {
        db.execSync('ALTER TABLE focus_blocks ADD COLUMN elapsed_time INTEGER DEFAULT 0;');
      } catch (e) {
        // Column might already exist
      }
      try {
        db.execSync('ALTER TABLE focus_blocks ADD COLUMN flagged_times TEXT;');
      } catch (e) {
        // Column might already exist
      }
      console.log('Migration complete!');
    }

    console.log('Database initialized successfully');
  } catch (error) {
    console.error('Error initializing database:', error);
    throw error;
  }
};

// Database verification functions
export const getAllData = () => {
  try {
    const users = db.getAllSync('SELECT * FROM users');
    const courses = db.getAllSync('SELECT * FROM courses');
    const tasks = db.getAllSync('SELECT * FROM tasks');
    const focusBlocks = db.getAllSync('SELECT * FROM focus_blocks');
    const sessions = db.getAllSync('SELECT * FROM study_sessions');
    const assignments = db.getAllSync('SELECT * FROM assignments');
    const notes = db.getAllSync('SELECT * FROM notes');
    const projects = db.getAllSync('SELECT * FROM projects');

    return {
      users,
      courses,
      tasks,
      focusBlocks,
      sessions,
      assignments,
      notes,
      projects,
    };
  } catch (error) {
    console.error('Error getting all data:', error);
    return null;
  }
};

export const logDatabaseContents = () => {
  console.log('\n=============== DATABASE CONTENTS ===============');
  const data = getAllData();

  if (data) {
    console.log('\n📊 USERS:', data.users.length, 'records');
    console.log(JSON.stringify(data.users, null, 2));

    console.log('\n📚 COURSES:', data.courses.length, 'records');
    console.log(JSON.stringify(data.courses, null, 2));

    console.log('\n✅ TASKS:', data.tasks.length, 'records');
    console.log(JSON.stringify(data.tasks, null, 2));

    console.log('\n🎯 FOCUS BLOCKS:', data.focusBlocks.length, 'records');
    console.log(JSON.stringify(data.focusBlocks, null, 2));

    console.log('\n📖 STUDY SESSIONS:', data.sessions.length, 'records');
    console.log(JSON.stringify(data.sessions, null, 2));

    console.log('\n📝 ASSIGNMENTS:', data.assignments.length, 'records');
    console.log(JSON.stringify(data.assignments, null, 2));

    console.log('\n📓 NOTES:', data.notes.length, 'records');
    console.log(JSON.stringify(data.notes, null, 2));

    console.log('\n🚀 PROJECTS:', data.projects.length, 'records');
    console.log(JSON.stringify(data.projects, null, 2));

    console.log('\n===============================================\n');
  }
};

export default db;

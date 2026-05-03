import Database from 'better-sqlite3';
import path from 'path';
import { fileURLToPath } from 'url';
import fs from 'fs';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const dbPath = process.env.NODE_ENV === 'production'
  ? path.join(__dirname, 'data', 'data.db')
  : path.join(__dirname, 'data.db');

export const initDB = () => {
  fs.mkdirSync(path.dirname(dbPath), { recursive: true });
  const db = new Database(dbPath);

  // 创建表
  db.exec(`
    CREATE TABLE IF NOT EXISTS participants (
      id TEXT PRIMARY KEY,
      group_name TEXT,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,

      -- Pre-Survey
      writing_frequency TEXT,
      ai_tool_usage TEXT,
      ai_anxiety_baseline INTEGER,
      ai_detector_familiarity TEXT,

      -- 第一稿
      draft1_text TEXT,
      draft1_word_count INTEGER,
      draft1_start_time DATETIME,
      draft1_submit_time DATETIME,
      keystroke_log1 TEXT,

      -- 检测分数
      fake_ai_score1 INTEGER,
      fake_ai_score2 INTEGER,

      -- 第二稿
      draft2_text TEXT,
      draft2_word_count INTEGER,
      draft2_start_time DATETIME,
      draft2_submit_time DATETIME,
      keystroke_log2 TEXT,

      -- 问卷
      q1_changes TEXT,
      q_deleted_types TEXT,
      q2_ai_markers TEXT,
      q_detection_reaction TEXT,
      q3_restricted INTEGER,
      q_abandoned_content TEXT,
      q_authentic_draft TEXT,
      q4_daily_concern INTEGER,
      q5_other TEXT,
      questionnaire_submit_time DATETIME
    )
  `);

  return db;
};

export const getDB = () => {
  return new Database(dbPath);
};

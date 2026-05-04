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

  // 删除旧的数据库文件以重新初始化schema
  if (fs.existsSync(dbPath)) {
    fs.unlinkSync(dbPath);
  }

  const db = new Database(dbPath);

  // 创建表
  db.exec(`
    CREATE TABLE IF NOT EXISTS participants (
      id TEXT PRIMARY KEY,
      group_name TEXT,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,

      -- Pre-Survey
      pre_age INTEGER,
      pre_gender TEXT,
      pre_native_chinese TEXT,
      pre_writing_frequency TEXT,
      pre_writing_focus TEXT,
      pre_ai_tool_usage TEXT,
      pre_reader_concern INTEGER,
      pre_misjudgment_distress INTEGER,
      pre_detector_familiarity TEXT,
      pre_predicted_ai_score INTEGER,

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

      -- 问卷（共享字段）
      q1_changes TEXT,
      q2_abandoned TEXT,
      q3_ai_markers TEXT,
      q4_deleted_types TEXT,
      q6_restricted INTEGER,
      q7_revision_goal TEXT,
      q8_daily_concern INTEGER,
      q9_authentic_draft TEXT,
      q10_perceived_purpose TEXT,
      q11_other TEXT,

      -- 问卷（实验组专用）
      q5_detection_reaction TEXT,

      -- 问卷（控制组专用）
      q5_prompt_interpretation TEXT,
      q6_restriction_source TEXT,

      questionnaire_submit_time DATETIME
    )
  `);

  return db;
};

export const getDB = () => {
  return new Database(dbPath);
};

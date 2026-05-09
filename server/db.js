import Database from 'better-sqlite3';
import path from 'path';
import { fileURLToPath } from 'url';
import fs from 'fs';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const dbPath = process.env.NODE_ENV === 'production'
  ? path.join(__dirname, 'data', 'data.db')
  : path.join(__dirname, 'data.db');

// 完整列定义（用于增量迁移）。新增列只需在此追加，启动时会自动 ALTER TABLE。
const SCHEMA_COLUMNS = [
  // 基础
  ['group_name', 'TEXT'],

  // Pre-Survey
  ['pre_age', 'INTEGER'],
  ['pre_gender', 'TEXT'],
  ['pre_native_chinese', 'TEXT'],
  ['pre_writing_frequency', 'TEXT'],
  ['pre_writing_focus', 'TEXT'],
  ['pre_ai_tool_usage', 'TEXT'],
  ['pre_reader_concern', 'INTEGER'],
  ['pre_misjudgment_distress', 'INTEGER'],
  ['pre_detector_familiarity', 'TEXT'],
  ['pre_predicted_ai_score', 'INTEGER'],

  // 第一稿
  ['draft1_text', 'TEXT'],
  ['draft1_word_count', 'INTEGER'],
  ['draft1_start_time', 'DATETIME'],
  ['draft1_submit_time', 'DATETIME'],
  ['keystroke_log1', 'TEXT'],

  // 假检测分数
  ['fake_ai_score1', 'INTEGER'],
  ['fake_ai_score2', 'INTEGER'],

  // 第二稿
  ['draft2_text', 'TEXT'],
  ['draft2_word_count', 'INTEGER'],
  ['draft2_start_time', 'DATETIME'],
  ['draft2_submit_time', 'DATETIME'],
  ['keystroke_log2', 'TEXT'],

  // 退出问卷（共享字段）
  ['q1_changes', 'TEXT'],
  ['q2_abandoned', 'TEXT'],
  ['q3_ai_markers', 'TEXT'],
  ['q4_deleted_types', 'TEXT'],
  ['q6_restricted', 'INTEGER'],
  ['q7_revision_goal', 'TEXT'],
  ['q8_daily_concern', 'INTEGER'],
  ['q9_authentic_draft', 'TEXT'],
  ['q10_perceived_purpose', 'TEXT'],
  ['q11_other', 'TEXT'],

  // 退出问卷（实验组专用）
  ['q5_detection_reaction', 'TEXT'],

  // 退出问卷（控制组专用）
  ['q5_prompt_interpretation', 'TEXT'],
  ['q6_restriction_source', 'TEXT'],

  // 新增：机制分离题（实验组专用，1-7 Likert）
  ['q7b_motivation_accuracy', 'INTEGER'],
  ['q7c_motivation_stigma', 'INTEGER'],
  ['q7d_motivation_aesthetic', 'INTEGER'],
  ['q7e_motivation_compliance', 'INTEGER'],

  // 新增：funneled debriefing
  ['q10b_oddness', 'TEXT'],          // 两组共用，开放
  ['q10c_score_doubt', 'INTEGER'],   // 实验组专用，1-7 Likert
  ['q10d_doubt_impact', 'TEXT'],     // 实验组专用，条件显示（q10c >= 4）

  ['questionnaire_submit_time', 'DATETIME'],
];

export const initDB = () => {
  fs.mkdirSync(path.dirname(dbPath), { recursive: true });

  const db = new Database(dbPath);

  // 1) 第一次启动时建表（仅含主键、组别、创建时间；其余列由迁移补齐）
  db.exec(`
    CREATE TABLE IF NOT EXISTS participants (
      id TEXT PRIMARY KEY,
      group_name TEXT,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    )
  `);

  // 2) 增量迁移：补齐缺失列。已存在的列与现有数据一律保留。
  const existing = new Set(
    db.prepare('PRAGMA table_info(participants)').all().map(c => c.name)
  );

  for (const [name, def] of SCHEMA_COLUMNS) {
    if (!existing.has(name)) {
      db.exec(`ALTER TABLE participants ADD COLUMN ${name} ${def}`);
    }
  }

  return db;
};

export const getDB = () => {
  return new Database(dbPath);
};

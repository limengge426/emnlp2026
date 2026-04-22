import express from 'express';
import cors from 'cors';
import bodyParser from 'body-parser';
import { initDB, getDB } from './db.js';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

// 初始化数据库
initDB();

const app = express();
const PORT = 3001;
const ADMIN_KEY = 'research-admin-2025';

// 中间件
app.use(cors());
app.use(bodyParser.json({ limit: '10mb' }));

// 读取被试配置
const loadParticipants = () => {
  const filePath = path.join(__dirname, 'participants.json');
  return JSON.parse(fs.readFileSync(filePath, 'utf8'));
};

// 工具函数：统计字数（中文字符 + 英文单词）
const countWords = (text) => {
  let count = 0;
  // 中文字符
  const chineseChars = text.match(/[\u4e00-\u9fff]/g);
  if (chineseChars) {
    count += chineseChars.length;
  }
  // 英文单词
  const englishWords = text.match(/\b[a-zA-Z]+\b/g);
  if (englishWords) {
    count += englishWords.length;
  }
  return count;
};

// ============ API 端点 ============

// 获取被试信息
app.get('/api/participant/:id', (req, res) => {
  try {
    const participants = loadParticipants();
    const { id } = req.params;
    
    if (!participants[id]) {
      return res.status(404).json({ error: '被试编号不存在' });
    }
    
    const group = participants[id];
    res.json({ participantId: id, group });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// 提交第一稿
app.post('/api/submit/draft1', (req, res) => {
  try {
    const {
      participantId,
      group,
      draft1Text,
      draft1WordCount,
      draft1SubmitTime,
      draft1StartTime,
      keystrokeLog1
    } = req.body;

    const db = getDB();
    
    // 检查被试是否存在
    const stmt = db.prepare('SELECT id FROM participants WHERE id = ?');
    const existing = stmt.get(participantId);
    
    if (existing) {
      // 更新
      const updateStmt = db.prepare(`
        UPDATE participants 
        SET draft1_text = ?,
            draft1_word_count = ?,
            draft1_start_time = ?,
            draft1_submit_time = ?,
            keystroke_log1 = ?
        WHERE id = ?
      `);
      updateStmt.run(
        draft1Text,
        draft1WordCount,
        draft1StartTime,
        draft1SubmitTime,
        JSON.stringify(keystrokeLog1),
        participantId
      );
    } else {
      // 创建新记录
      const insertStmt = db.prepare(`
        INSERT INTO participants 
        (id, group_name, draft1_text, draft1_word_count, draft1_start_time, draft1_submit_time, keystroke_log1)
        VALUES (?, ?, ?, ?, ?, ?, ?)
      `);
      insertStmt.run(
        participantId,
        group,
        draft1Text,
        draft1WordCount,
        draft1StartTime,
        draft1SubmitTime,
        JSON.stringify(keystrokeLog1)
      );
    }
    
    res.json({ success: true, message: '第一稿已保存' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// 提交第二稿
app.post('/api/submit/draft2', (req, res) => {
  try {
    const {
      participantId,
      group,
      draft2Text,
      draft2WordCount,
      draft2SubmitTime,
      draft2StartTime,
      fakeAIScore1,
      fakeAIScore2,
      keystrokeLog2
    } = req.body;

    const db = getDB();
    
    const updateStmt = db.prepare(`
      UPDATE participants 
      SET draft2_text = ?,
          draft2_word_count = ?,
          draft2_start_time = ?,
          draft2_submit_time = ?,
          fake_ai_score1 = ?,
          fake_ai_score2 = ?,
          keystroke_log2 = ?
      WHERE id = ?
    `);
    
    updateStmt.run(
      draft2Text,
      draft2WordCount,
      draft2StartTime,
      draft2SubmitTime,
      fakeAIScore1,
      fakeAIScore2,
      JSON.stringify(keystrokeLog2),
      participantId
    );
    
    res.json({ success: true, message: '第二稿已保存' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// 提交问卷
app.post('/api/submit/questionnaire', (req, res) => {
  try {
    const {
      participantId,
      q1_changes,
      q2_aiMarkers,
      q3_restricted,
      q4_dailyConcern,
      q5_other
    } = req.body;

    const db = getDB();
    
    const updateStmt = db.prepare(`
      UPDATE participants 
      SET q1_changes = ?,
          q2_ai_markers = ?,
          q3_restricted = ?,
          q4_daily_concern = ?,
          q5_other = ?,
          questionnaire_submit_time = CURRENT_TIMESTAMP
      WHERE id = ?
    `);
    
    updateStmt.run(
      q1_changes,
      q2_aiMarkers,
      q3_restricted,
      q4_dailyConcern,
      q5_other || '',
      participantId
    );
    
    res.json({ success: true, message: '问卷已提交' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// 管理员：获取所有被试数据（需要密钥）
app.get('/api/admin/data', (req, res) => {
  try {
    const adminKey = req.headers['x-admin-key'];
    if (adminKey !== ADMIN_KEY) {
      return res.status(403).json({ error: '权限不足' });
    }

    const db = getDB();
    const stmts = db.prepare('SELECT * FROM participants ORDER BY created_at DESC');
    const data = stmts.all();
    
    res.json({ data });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// 管理员：导出 CSV
app.get('/api/admin/export', (req, res) => {
  try {
    const adminKey = req.headers['x-admin-key'] || req.query.key;
    if (adminKey !== ADMIN_KEY) {
      return res.status(403).json({ error: '权限不足' });
    }

    const db = getDB();
    const stmts = db.prepare('SELECT * FROM participants ORDER BY created_at DESC');
    const data = stmts.all();
    
    // 构建 CSV
    const headers = [
      'participantId',
      'group',
      'createdAt',
      'draft1WordCount',
      'draft1StartTime',
      'draft1SubmitTime',
      'draft1Text',
      'fakeAiScore1',
      'fakeAiScore2',
      'draft2WordCount',
      'draft2StartTime',
      'draft2SubmitTime',
      'draft2Text',
      'q1_changes',
      'q2_aiMarkers',
      'q3_restricted',
      'q4_dailyConcern',
      'q5_other',
      'questionnaireSubmitTime'
    ];

    const rows = data.map(row => [
      row.id,
      row.group_name,
      row.created_at,
      row.draft1_word_count || '',
      row.draft1_start_time || '',
      row.draft1_submit_time || '',
      `"${(row.draft1_text || '').replace(/"/g, '""')}"`,
      row.fake_ai_score1 || '',
      row.fake_ai_score2 || '',
      row.draft2_word_count || '',
      row.draft2_start_time || '',
      row.draft2_submit_time || '',
      `"${(row.draft2_text || '').replace(/"/g, '""')}"`,
      `"${(row.q1_changes || '').replace(/"/g, '""')}"`,
      `"${(row.q2_ai_markers || '').replace(/"/g, '""')}"`,
      row.q3_restricted || '',
      row.q4_daily_concern || '',
      `"${(row.q5_other || '').replace(/"/g, '""')}"`,
      row.questionnaire_submit_time || ''
    ]);

    const csv = [
      headers.join(','),
      ...rows.map(row => row.join(','))
    ].join('\n');

    res.setHeader('Content-Type', 'text/csv; charset=utf-8');
    res.setHeader('Content-Disposition', 'attachment; filename=research_data.csv');
    res.send('\ufeff' + csv); // BOM for Excel UTF-8
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// 生产环境：托管前端构建文件
if (process.env.NODE_ENV === 'production') {
  app.use(express.static(path.join(__dirname, '../client/dist')));
  app.get('*', (req, res) => {
    res.sendFile(path.join(__dirname, '../client/dist/index.html'));
  });
}

app.listen(PORT, () => {
  console.log(`后端服务运行在 http://localhost:${PORT}`);
});

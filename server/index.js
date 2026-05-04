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

// 提交pre-survey
app.post('/api/submit/presurvey', (req, res) => {
  try {
    const {
      participantId,
      pre_age,
      pre_gender,
      pre_native_chinese,
      pre_writing_frequency,
      pre_writing_focus,
      pre_ai_tool_usage,
      pre_reader_concern,
      pre_misjudgment_distress,
      pre_detector_familiarity,
      pre_predicted_ai_score
    } = req.body;

    const db = getDB();

    // 检查被试是否存在
    const stmt = db.prepare('SELECT id FROM participants WHERE id = ?');
    const existing = stmt.get(participantId);

    if (existing) {
      // 更新
      const updateStmt = db.prepare(`
        UPDATE participants
        SET pre_age = ?,
            pre_gender = ?,
            pre_native_chinese = ?,
            pre_writing_frequency = ?,
            pre_writing_focus = ?,
            pre_ai_tool_usage = ?,
            pre_reader_concern = ?,
            pre_misjudgment_distress = ?,
            pre_detector_familiarity = ?,
            pre_predicted_ai_score = ?
        WHERE id = ?
      `);
      updateStmt.run(
        pre_age,
        pre_gender,
        pre_native_chinese,
        pre_writing_frequency,
        pre_writing_focus,
        pre_ai_tool_usage,
        pre_reader_concern,
        pre_misjudgment_distress,
        pre_detector_familiarity,
        pre_predicted_ai_score,
        participantId
      );
    } else {
      // 创建新记录
      const insertStmt = db.prepare(`
        INSERT INTO participants
        (id, pre_age, pre_gender, pre_native_chinese, pre_writing_frequency, pre_writing_focus, pre_ai_tool_usage, pre_reader_concern, pre_misjudgment_distress, pre_detector_familiarity, pre_predicted_ai_score)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
      `);
      insertStmt.run(
        participantId,
        pre_age,
        pre_gender,
        pre_native_chinese,
        pre_writing_frequency,
        pre_writing_focus,
        pre_ai_tool_usage,
        pre_reader_concern,
        pre_misjudgment_distress,
        pre_detector_familiarity,
        pre_predicted_ai_score
      );
    }

    res.json({ success: true, message: 'Pre-survey已保存' });
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
      group,
      q1_changes,
      q2_abandoned,
      q3_ai_markers,
      q4_deleted_types,
      q5_detection_reaction,
      q5_prompt_interpretation,
      q6_restricted,
      q6_restriction_source,
      q7_revision_goal,
      q8_daily_concern,
      q9_authentic_draft,
      q10_perceived_purpose,
      q11_other
    } = req.body;

    // 按组别校验必填项
    const missing = [];
    if (!q1_changes || q1_changes.trim().length < 20) missing.push('q1_changes');
    if (!q2_abandoned || q2_abandoned.trim().length < 10) missing.push('q2_abandoned');
    if (!q3_ai_markers || q3_ai_markers.trim().length < 10) missing.push('q3_ai_markers');
    if (!q4_deleted_types || q4_deleted_types.length === 0) missing.push('q4_deleted_types');
    if (group === 'experimental' && !q5_detection_reaction) missing.push('q5_detection_reaction');
    if (group === 'control' && (!q5_prompt_interpretation || q5_prompt_interpretation.trim().length < 10)) missing.push('q5_prompt_interpretation');
    if (!q6_restricted) missing.push('q6_restricted');
    if (!q7_revision_goal) missing.push('q7_revision_goal');
    if (!q8_daily_concern) missing.push('q8_daily_concern');
    if (!q9_authentic_draft) missing.push('q9_authentic_draft');
    if (!q10_perceived_purpose || q10_perceived_purpose.trim().length < 10) missing.push('q10_perceived_purpose');

    if (missing.length > 0) {
      return res.status(400).json({ error: '必填项未填写', fields: missing });
    }

    const db = getDB();

    const updateStmt = db.prepare(`
      UPDATE participants
      SET q1_changes = ?,
          q2_abandoned = ?,
          q3_ai_markers = ?,
          q4_deleted_types = ?,
          q5_detection_reaction = ?,
          q5_prompt_interpretation = ?,
          q6_restricted = ?,
          q6_restriction_source = ?,
          q7_revision_goal = ?,
          q8_daily_concern = ?,
          q9_authentic_draft = ?,
          q10_perceived_purpose = ?,
          q11_other = ?,
          questionnaire_submit_time = CURRENT_TIMESTAMP
      WHERE id = ?
    `);

    updateStmt.run(
      q1_changes,
      q2_abandoned,
      q3_ai_markers,
      JSON.stringify(q4_deleted_types),
      group === 'experimental' ? q5_detection_reaction : null,
      group === 'control' ? q5_prompt_interpretation : null,
      q6_restricted,
      group === 'control' ? (q6_restriction_source || null) : null,
      q7_revision_goal,
      q8_daily_concern,
      q9_authentic_draft,
      q10_perceived_purpose,
      q11_other || null,
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
      'id',
      'group_name',
      'created_at',
      'pre_age',
      'pre_gender',
      'pre_native_chinese',
      'pre_writing_frequency',
      'pre_writing_focus',
      'pre_ai_tool_usage',
      'pre_reader_concern',
      'pre_misjudgment_distress',
      'pre_detector_familiarity',
      'pre_predicted_ai_score',
      'draft1_word_count',
      'draft1_start_time',
      'draft1_submit_time',
      'draft1_text',
      'fake_ai_score1',
      'fake_ai_score2',
      'draft2_word_count',
      'draft2_start_time',
      'draft2_submit_time',
      'draft2_text',
      'q1_changes',
      'q2_abandoned',
      'q3_ai_markers',
      'q4_deleted_types',
      'q5_detection_reaction',
      'q5_prompt_interpretation',
      'q6_restricted',
      'q6_restriction_source',
      'q7_revision_goal',
      'q8_daily_concern',
      'q9_authentic_draft',
      'q10_perceived_purpose',
      'q11_other',
      'questionnaire_submit_time'
    ];

    const rows = data.map(row => [
      row.id,
      row.group_name,
      row.created_at,
      row.pre_age || '',
      row.pre_gender || '',
      row.pre_native_chinese || '',
      row.pre_writing_frequency || '',
      row.pre_writing_focus || '',
      row.pre_ai_tool_usage || '',
      row.pre_reader_concern || '',
      row.pre_misjudgment_distress || '',
      row.pre_detector_familiarity || '',
      row.pre_predicted_ai_score || '',
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
      `"${(row.q2_abandoned || '').replace(/"/g, '""')}"`,
      `"${(row.q3_ai_markers || '').replace(/"/g, '""')}"`,
      row.q4_deleted_types || '',
      row.q5_detection_reaction || '',
      `"${(row.q5_prompt_interpretation || '').replace(/"/g, '""')}"`,
      row.q6_restricted || '',
      `"${(row.q6_restriction_source || '').replace(/"/g, '""')}"`,
      row.q7_revision_goal || '',
      row.q8_daily_concern || '',
      row.q9_authentic_draft || '',
      `"${(row.q10_perceived_purpose || '').replace(/"/g, '""')}"`,
      `"${(row.q11_other || '').replace(/"/g, '""')}"`,
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

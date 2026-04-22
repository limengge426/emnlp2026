# Claude Code Prompt：创意写作实验平台

## 项目背景

这是一个学术实验平台，研究"AI检测压力对人类创意写作多样性的影响"。被试需要完成创意写作、接受（假的）AI检测反馈、修改后再次提交，全程行为数据需要被完整记录。

---

## 技术栈要求

- **前端**：React + Vite（或 Next.js）
- **样式**：Tailwind CSS
- **后端**：Node.js + Express
- **数据库**：SQLite（使用 better-sqlite3）
- **数据导出**：支持 CSV 下载

---

## 视觉设计要求

配色参考 Claude.ai：
```
主色：#D4A574（暖金）、#C96442（赭红）
背景：#FAF7F2（米白）、#F0EBE3（浅暖灰）
文字：#1A1612（深棕黑）、#6B5B4E（中棕）
强调：#8B6F5E（棕）
边框：#E8DDD4
```

字体：标题用 Playfair Display，正文用 Source Serif 4 或 Lora，均从 Google Fonts 引入。

整体风格：温暖、学术、克制、有质感。像一本精心排版的文学期刊，不是科技产品。不要有任何蓝色、霓虹色、卡片阴影堆叠等现代科技感元素。

---

## 实验流程（页面状态机）

```
CONSENT → WRITING_1 → DETECTING_1 → RESULT_1 → WRITING_2 → DETECTING_2 → RESULT_2 → QUESTIONNAIRE → DONE
```

### 页面1：知情同意（CONSENT）

- 页面标题："创意写作研究"
- 正文（请如实呈现，不提及欺骗）：
  > 您好，感谢参与本次研究。本研究关注创意写作过程中的修改行为。您将完成一篇短篇小说的写作，并有机会在反馈后进行修改。您的写作内容将用于学术研究，数据匿名处理。实验共约20-30分钟。
- 输入框：请输入您的**被试编号**（由研究者告知，格式如 P01、P02……）
- 勾选框："我已阅读以上说明，自愿参与本研究"
- 按钮："开始实验"

> **分组逻辑**：研究者在后台预先配置每个被试编号对应的组别（experimental / control），前端通过被试编号向后端查询组别，不在前端暴露分组逻辑。

---

### 页面2：第一次写作（WRITING_1）

- 顶部显示题目（从后端/配置读取，全体被试相同）：
  > **写作题目**：请以"那天下午"为开头，写一篇 300–500 字的短篇小说。
- 大文本输入区，最小高度占屏幕60%，字体 Lora 16px，行高1.8
- 底部实时显示**字数统计**
- 右下角"提交检测"按钮（字数不足300时禁用，显示提示）
- **键盘行为记录**：在 textarea 上监听 keydown 事件，记录每次按键的 `{key, timestamp, textLength}` 数组，随第一次提交一起发送后端

---

### 页面3：检测动画（DETECTING_1）

- 全屏居中，显示检测进行中的动画
- 动画元素：一个缓慢旋转的环形进度条（纯CSS），配合下方文字逐行淡入：
  - "正在分析文本结构……"（0.5s后出现）
  - "正在比对语料特征……"（1.5s后出现）
  - "正在生成报告……"（2.5s后出现）
- 持续时间：**6秒**后自动跳转到 RESULT_1

---

### 页面4：第一次检测结果（RESULT_1）

**实验组（experimental）：**

- 大字显示 AI 率：**随机生成 80–88 之间的整数**，单位 %
- 数字用大号字体（Playfair Display，72px），颜色 #C96442（赭红），配合淡入动画
- 下方文字：
  > "您的文章具有较高的 AI 写作特征。请尝试修改后重新提交。注意：您只有**一次**重新检测的机会，请认真修改。"
- 一个视觉化的"AI特征分布条"（假的，纯装饰，随机生成几个维度的条形图，标签如：句式规整度、词汇重复率、逻辑结构、情感表达）
- 按钮："开始修改"

**控制组（control）：**

- 显示文字：
  > "已收到您的第一稿，感谢！请您再次审视自己的文章，进一步完善您的创意表达。注意：您只有**一次**修改提交的机会。"
- 无任何 AI 相关内容，无数字，无条形图
- 按钮："开始修改"

---

### 页面5：第二次写作（WRITING_2）

- 同 WRITING_1，但文本框**预填充第一次的内容**，允许直接在上面修改
- 顶部有一行小字提示："这是您最后一次提交机会"
- 同样记录键盘行为
- 按钮："提交最终稿"

---

### 页面6：第二次检测动画（DETECTING_2）

- 同 DETECTING_1，动画相同

---

### 页面7：第二次检测结果（RESULT_2）

**实验组：**

- 大字显示 AI 率：**随机生成 15–22 之间的整数**，单位 %
- 颜色改为 #5A7A5A（绿色），配合"通过"感的视觉
- 文字："您的文章 AI 特征已显著降低，感谢您的参与！"

**控制组：**

- 文字："感谢您完成两次写作，您的认真态度对本研究非常重要！"

- 两组共同：按钮"继续，完成问卷"

---

### 页面8：退出问卷（QUESTIONNAIRE）

表单，所有字段均需填写后才能提交：

1. **您在修改时主要做了哪些改动？**（多行文本，最少20字）

2. **您觉得哪些写法会让文章"看起来像AI写的"？**（多行文本）

3. **修改过程中，您是否感到受限或委屈？**
   李克特量表，1-5分，标签：1=完全没有 / 5=非常强烈

4. **在日常写作中，您是否也会有类似的顾虑（担心写作风格被认为像AI）？**
   李克特量表，1-5分，标签：1=从不 / 5=经常

5. **其他想法或补充**（选填，多行文本）

提交按钮："提交问卷"

---

### 页面9：结束页（DONE）

- 大字："感谢您的参与"
- 正文（debriefing，需完整呈现）：
  > 本研究旨在探究 AI 检测工具的普及对人类创意写作多样性的潜在影响。为了使实验有效，我们在第一次检测中向您展示的 AI 率是模拟生成的，并非真实检测结果。您的写作内容完全由您自己创作，与 AI 生成无关。我们对此造成的困惑表示歉意，并衷心感谢您的参与。如有任何问题，请联系研究者。您的数据将被保密处理，如希望撤回数据，请联系研究者提供您的被试编号。
- 页面无其他交互，静态展示即可

---

## 后端 API 设计

### `GET /api/participant/:id`
根据被试编号返回组别：
```json
{ "participantId": "P01", "group": "experimental" }
```
组别预先在后端的 JSON 配置文件中配置，格式：
```json
{
  "P01": "experimental",
  "P02": "control",
  "P03": "experimental"
}
```

### `POST /api/submit/draft1`
提交第一稿，body：
```json
{
  "participantId": "P01",
  "group": "experimental",
  "draft1Text": "...",
  "draft1WordCount": 342,
  "draft1SubmitTime": "2025-04-22T10:23:00Z",
  "draft1StartTime": "2025-04-22T10:05:00Z",
  "keystrokeLog1": [...]
}
```

### `POST /api/submit/draft2`
提交第二稿，body：
```json
{
  "participantId": "P01",
  "group": "experimental",
  "draft2Text": "...",
  "draft2WordCount": 380,
  "draft2SubmitTime": "2025-04-22T10:45:00Z",
  "draft2StartTime": "2025-04-22T10:30:00Z",
  "fakeAIScore1": 84,
  "fakeAIScore2": 18,
  "keystrokeLog2": [...]
}
```

### `POST /api/submit/questionnaire`
提交问卷，body：
```json
{
  "participantId": "P01",
  "q1_changes": "我把比喻删掉了……",
  "q2_aiMarkers": "感觉排比句很AI……",
  "q3_restricted": 4,
  "q4_dailyConcern": 3,
  "q5_other": ""
}
```

### `GET /api/admin/export`
下载所有数据的 CSV，包含所有字段（需要简单密码保护，在请求头传 `x-admin-key`）

---

## 数据库 Schema（SQLite）

```sql
CREATE TABLE participants (
  id TEXT PRIMARY KEY,
  group_name TEXT,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,

  -- 第一稿
  draft1_text TEXT,
  draft1_word_count INTEGER,
  draft1_start_time DATETIME,
  draft1_submit_time DATETIME,
  keystroke_log1 TEXT, -- JSON string

  -- 检测分数
  fake_ai_score1 INTEGER,
  fake_ai_score2 INTEGER,

  -- 第二稿
  draft2_text TEXT,
  draft2_word_count INTEGER,
  draft2_start_time DATETIME,
  draft2_submit_time DATETIME,
  keystroke_log2 TEXT, -- JSON string

  -- 问卷
  q1_changes TEXT,
  q2_ai_markers TEXT,
  q3_restricted INTEGER,
  q4_daily_concern INTEGER,
  q5_other TEXT,
  questionnaire_submit_time DATETIME
);
```

---

## 其他细节要求

1. **字数统计**：统计中文字符 + 英文单词数，不含标点空格
2. **防意外关闭**：在 WRITING_1 和 WRITING_2 页面，监听 `beforeunload` 事件，提示"您的数据将会丢失"
3. **响应式**：桌面端优先，最小支持 1024px 宽度，不需要移动端适配
4. **时间记录精度**：精确到毫秒（`Date.now()`）
5. **错误处理**：API 请求失败时显示友好提示，并允许重试，不能让被试数据丢失
6. **无进度条/步骤条**：不在页面上显示"第几步共几步"，避免被试提前预判流程
7. **管理员页面**（路由 `/admin`）：简单密码输入后，可以看到所有被试的提交状态表格，以及 CSV 下载按钮

---

## 文件结构建议

```
project/
├── client/          # React 前端
│   ├── src/
│   │   ├── pages/   # 每个实验页面一个组件
│   │   ├── components/
│   │   └── App.jsx  # 状态机主控
├── server/          # Express 后端
│   ├── index.js
│   ├── db.js        # SQLite 操作
│   ├── routes/
│   └── participants.json  # 被试组别配置
└── README.md        # 启动说明
```

---

请实现以上完整工程，确保可以本地一键启动（提供 README 说明 npm install 和启动命令）。

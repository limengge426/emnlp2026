# 创意写作实验平台

这是一个学术研究实验平台，用于研究"AI检测压力对人类创意写作多样性的影响"。

## 系统要求

- Node.js 16+ (推荐 18+)
- npm 8+

## 快速启动

### 1. 安装依赖

```bash
# 安装后端依赖
cd server
npm install

# 安装前端依赖
cd ../client
npm install
```

### 2. 配置被试

编辑 `server/participants.json`，配置被试编号和组别（experimental / control）：

```json
{
  "P01": "experimental",
  "P02": "control",
  "P03": "experimental"
}
```

### 3. 启动应用

**方法 A：使用启动脚本（推荐）**

从项目根目录：

```bash
# 在 macOS/Linux
./start.sh

# 在 Windows
start.bat
```

**方法 B：手动启动**

终端 1 - 启动后端：
```bash
cd server
npm start
```

终端 2 - 启动前端：
```bash
cd client
npm run dev
```

应用将在 `http://localhost:5173` 打开。

## 使用说明

### 被试流程

1. 访问 `http://localhost:5173`
2. 输入被试编号（如 P01）
3. 按照引导完成实验流程
4. 最后提交问卷，实验完成

### 管理员功能

访问 `http://localhost:5173/admin`，输入管理员密钥：`research-admin-2025`

管理员可以：
- 查看所有被试的提交状态
- 下载 CSV 格式的完整研究数据

## API 端点

所有 API 端点基于 `http://localhost:3001`

### 获取被试信息
```
GET /api/participant/:id
```

### 提交数据
```
POST /api/submit/draft1
POST /api/submit/draft2
POST /api/submit/questionnaire
```

### 管理员接口
```
GET /api/admin/data (需要 x-admin-key header)
GET /api/admin/export (需要 x-admin-key header)
```

## 数据存储

所有数据存储在 SQLite 数据库中：`server/data.db`

数据结构包括：
- 被试基本信息（编号、组别）
- 第一稿和第二稿的文本、字数、时间戳
- 键盘记录（用于分析修改行为）
- 假 AI 检测分数
- 问卷响应

## 项目结构

```
project/
├── client/                  # React 前端
│   ├── src/
│   │   ├── pages/          # 各实验页面组件
│   │   ├── App.jsx         # 主组件和状态机
│   │   ├── index.css       # 全局样式和动画
│   │   └── main.jsx        # 入口
│   ├── index.html
│   ├── vite.config.js
│   ├── tailwind.config.js
│   └── package.json
│
├── server/                  # Express 后端
│   ├── index.js            # API 主程序
│   ├── db.js               # SQLite 初始化
│   ├── participants.json   # 被试配置
│   └── package.json
│
├── start.sh                # 启动脚本 (macOS/Linux)
├── start.bat               # 启动脚本 (Windows)
└── README.md              # 此文件
```

## 技术栈

- **前端**：React 18 + Vite + Tailwind CSS
- **后端**：Express.js
- **数据库**：SQLite (better-sqlite3)
- **字体**：Playfair Display, Lora, Source Serif 4 (Google Fonts)
- **样式设计**：参考 Claude.ai，温暖学术风格

## 故障排除

### 后端无法启动
```
Error: Cannot find module 'better-sqlite3'
```
解决：在 `server` 目录运行 `npm install`

### 前端无法连接到后端
检查：
1. 后端是否运行在 `http://localhost:3001`
2. `client/vite.config.js` 中的代理设置是否正确

### 端口已被占用
修改配置：
- 后端（server/index.js）：修改 `const PORT = 3001`
- 前端（client/vite.config.js）：修改 `port: 5173`

## 注意事项

1. **数据隐私**：所有参与者数据都被妥善保存，管理员密钥请妥善保管
2. **时间记录**：系统精确记录每个按键的时间戳，用于分析修改行为
3. **浏览器兼容性**：建议使用现代浏览器（Chrome 90+, Firefox 88+, Safari 14+）
4. **本地开发**：此设置仅用于本地测试和小规模研究，生产部署需要额外的安全措施

## 联系方式

如有问题或建议，请联系研究团队。

---

版本：1.0.0  
最后更新：2026年4月

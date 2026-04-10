# 🎨 AI Vision Studio (你画我猜 · AI 版)

这是一个基于 Web 技术构建的高颜值交互式 AI 视觉项目。支持多种 AI 模型（本地 Ollama + 阿里云 Qwen），不仅可以玩传统的"你画我猜"，还能利用 AI 的视觉能力识别并描述你上传的任何图片。

## 🚀 版本演进记录

### v6.0 - 多模型支持 (当前版本)
**更新时间**：2026-04-11
- **多 AI 后端**：同时支持 Ollama 本地模型和阿里云 Qwen 云端模型。
- **前端模型选择器**：用户可自由切换模型，支持的模型包括：
    - **Ollama 本地**: `gemma3`、`qwen3`、`qwen2.5vl`
    - **阿里云 Qwen**: `qwen-vl-max`、`qwen-vl-plus`
- **安全性**：API 密钥通过 `.env` 文件管理，不会暴露到代码仓库。
- **智能路由**：后端自动判断模型类型，将请求路由到对应的 AI 服务。

### v5.1 - 自动化提升
**更新时间**：2026-04-10
- **自动 IP 识别**：后端 `server.js` 启动时会自动检测并显示局域网 IP，无需手动查询，真正实现"即开即连"。

### v5.0 - 后端集成与跨设备访问
**更新时间**：2026-04-10
- **引入 Node.js 后端**：使用 Express 搭建中转服务器，彻底解决浏览器跨域 (CORS) 限制。
- **项目重构**：将前端资源整理至 `public/` 文件夹，后端逻辑位于 `server.js`，更加规范。

### v4.0 - 工程化重构
**更新时间**：2026-04-10
- **代码组织**：将原本臃肿的单一 `index.html` 拆分为 `index.html` (结构)、`style.css` (样式) 和 `script.js` (逻辑)。
- **规范性**：提升了代码的可维护性和模块化程度，符合专业 Web 工程实践。

### v3.0 - AI Vision Studio
**更新时间**：2026-04-10
- **核心功能**：
    - **双模式架构**：引入 Tab 切换器，支持“画画猜猜”和“图片识别”两种模式。
    - **图片上传识别**：支持拖拽上传或点击选择图片。
    - **深度描述**：利用 AI 视觉能力对图片进行 100-200 字的详细中文描述（包括主体、环境、氛围）。
- **交互优化**：
    - 针对上传模式增加了图片预览、重新选择和独立的加载状态反馈。

### v2.0 - Glassmorphism UI 重构
- **视觉设计**：采用了现代的**玻璃拟态 (Glassmorphism)** 设计风格。
- **动态特效**：
    - 浮动光球背景动画。
    - 渐变色呼吸发光标题。
    - 按钮 Ripple 波纹反馈和 Hover 上浮动效。
- **用户体验**：
    - 新增 **Tooltip** 文字提示。
    - 支持 `Ctrl + Z` 键盘回退快捷键。
    - 增加绘制步数统计及猜测历史记录列表。

### v1.0 - 核心逻辑实现
- **画板系统**：实现了基础的 Canvas 绘图系统，支持多端（触屏+鼠标）操作。
- **撤销系统**：基于快照机制实现了 30 步以内的撤销 (Undo) 功能。
- **AI 集成**：通过 Fetch API 对接本地 Ollama 服务，使用 `gemma3` 模型进行简笔画识别。

---

## 🛠️ 环境配置及启动

### 1. 本地 AI 后端 (Ollama)
本项目依赖 [Ollama](https://ollama.com/) 作为本地 AI 推理后端：
1.  确保已安装 Ollama。
2.  下载视觉模型：`ollama run gemma3`。

### 2. 阿里云 Qwen (可选)
如需使用云端模型，需在项目根目录创建 `.env` 文件：
```bash
QWEN_API_KEY=你的阿里云API密钥
QWEN_BASE_URL=https://dashscope.aliyuncs.com/compatible-mode/v1
```

### 3. 启动项目
1.  确保已安装 [Node.js](https://nodejs.org/)。
2.  安装依赖：`npm install`
3.  启动服务端：`node server.js`
4.  在浏览器访问：`http://localhost:3000`。
5.  **手机访问**：在同一局域网下，直接打开终端里显示的 `http://<IP>:3000` 链接即可。

## 📦 技术栈
- **Frontend**: Vanilla HTML / CSS / Modern JavaScript
- **Backend**: Node.js / Express / Axios / dotenv
- **AI Support**: Ollama (Gemma3, Qwen3, Qwen2.5VL) + 阿里云 Qwen API (qwen-vl-max, qwen-vl-plus)

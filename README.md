# 🎨 AI Vision Studio (你画我猜 · AI 版)

这是一个基于 Web 技术和本地 AI (Ollama) 构建的高颜值交互式实验项目。不仅可以玩传统的“你画我猜”，还能利用 AI 的视觉能力识别并描述你上传的任何图片。

## 🚀 版本演进记录

### v3.0 - AI Vision Studio (当前版本)
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
本项目依赖 [Ollama](https://ollama.com/) 作为 AI 推理后端：
1.  确保已安装 Ollama。
2.  下载视觉模型：`ollama run gemma3`。
3.  **跨域配置 (重要)**：
    由于安全策略，需设置环境变量以允许本地网页访问。
    - Windows: 在系统环境变量中设置 `OLLAMA_ORIGINS` 为 `*`。
    - 重启 Ollama 以生效。

### 2. 启动网页
本项目为纯前端项目，但由于 CORS 限制，建议使用本地服务器启动：
- **方案 A**: 使用 VS Code **Live Server** 插件点击 "Go Live"。
- **方案 B**: 在终端运行 `npx serve .` 或 `python -m http.server 8080`。

## 📦 技术栈
- **Frontend**: Vanilla HTML / CSS / Modern JavaScript
- **Styling**: Vanilla CSS (Global Tokens, Flexbox, Animations)
- **AI Support**: Ollama API (Gemma 3)

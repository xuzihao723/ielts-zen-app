🚀 雅思禅 | IELTS Zen Ultra

雅思禅 (IELTS Zen) 是一款专为雅思考生（“烤鸭”）打造的沉浸式高级备考 Web 应用。它不仅提供科学的 7 天冲刺计划，还深度集成了 Gemini AI 导师、番茄专注时钟、手写涂鸦板以及无感云端同步功能。通过极具高级感的玻璃拟态 UI 和沉浸式体验，帮助你在冲考阶段保持绝对的专注与高效。

✨ 核心功能 (Features)

📊 全维度数据仪表盘 (Dashboard)

打卡连胜 (Streak) 记录与考试倒计时追踪（默认指向 2026-04-10）。

带有动态动画的每周总体进度可视化环形图。

首页每日刷新 Gemini AI 生成的专属振奋金句。

📅 智能周计划 & AI 导师 (Planner & AI Tutor)

7 天科学备考日程：覆盖听、说、读、写全方位的任务安排。

三态打卡系统：支持标记任务为“完成 ✅”、“跳过 ❌”或“待办”。

每日复盘与心情日历：使用 Emoji 记录当天备考心情，补充额外完成的任务。

🤖 AI 难点解析：记录学习难点时，可一键召唤 Gemini AI 导师，自动生成“地道雅思高分例句”或“写作拓展思路”。

🍅 沉浸式专注时钟 (Zen Timer)

内置经典的 25 分钟专注 / 5 分钟休息的番茄钟循环。

环境白噪音：提供“雨声 🌧️”、“咖啡馆 ☕️”、“白噪音 🌊”三种高质量环境音，一键进入心流状态。

🎨 自由手绘板 (Zen Canvas)

提供超大画布（支持设备触控与 Apple Pencil）。

适合临摹小作文趋势图、打草稿或默写生僻单词，支持一键下载导出。

🌙 极致暗黑模式 (Dark Mode)

支持亮色/暗色主题一键丝滑切换。

底层采用高级动态流体背景（Blob Animation）与玻璃拟态（Glassmorphism）设计，深夜备考同样舒适护眼。

☁️ 多端无感云同步 (Cloud Sync)

基于 Firebase 匿名登录架构，无需繁琐注册即可在多设备间同步数据。

自动归档引擎：每周一自动重置打卡状态，并将历史数据静默打包至云端 Archives，进度永不丢失。

🛠️ 技术栈 (Tech Stack)

前端框架: React 18 (无需构建工具，通过 Babel 实时编译)

样式体系: Tailwind CSS (利用 Utility-first 类名构建玻璃拟态与响应式布局)

后端服务 & 数据库: Firebase Authentication (匿名登录) + Firestore (实时数据库)

AI 接口: Google Generative AI (Gemini 2.5 Flash / 1.5 Flash API)

图标库: Lucide React

🚀 快速上手与配置 (Quick Start)

本项目采用免构建架构，克隆即可直接在浏览器或 GitHub Pages 中运行。

1. 配置 Firebase

前往 Firebase 控制台 创建一个新项目。

启用 Authentication 中的 匿名登录 (Anonymous)。

创建 Firestore Database，并将安全规则修改为仅允许已认证用户读写。

获取你的 Firebase Config，并替换 index.html 中的相应部分。

2. 配置 Gemini API Key

前往 Google AI Studio 申请一个免费的 API Key。

⚠️ 安全警告：由于本项目部署在纯前端，直接暴露 API Key 容易被 GitHub 安全扫描封禁。请使用“字符串拼接截断法”填入你的 Key：

// 在代码中找到这段并填入你自己的 Key 的两半
const keyPart1 = "AIzaSyB..."; // 你的 Key 的前半段
const keyPart2 = "...xyz123";  // 你的 Key 的后半段
const GEMINI_API_KEY = keyPart1 + keyPart2;


(注：建议在 Google Cloud 中为该 API Key 开启“HTTP 引荐来源网址”限制，仅允许你的 GitHub Pages 域名调用。)

3. 部署

将包含配置信息的 index.html 直接推送到 GitHub 仓库。

在仓库设置中开启 GitHub Pages (Source: main branch)。

等待 1-2 分钟，即可通过生成的 https://<your-username>.github.io/<repo-name> 网址访问你的专属备考应用！

💡 界面展示

https://xuzihao723.github.io/ielts-zen-app/

📄 许可证

MIT License.

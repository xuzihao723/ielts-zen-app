# Security policy · 安全策略

Security fixes target the latest `main` version. Older commits are unsupported.

## Credentials and data

- Never commit Gemini API keys or embed them in browser code. Splitting strings, Base64 encoding or frontend environment variables do not hide a credential.
- Use your own key in the ignored `.env` file for the optional local Node server. Public AI deployment requires a separately secured, authenticated backend.
- Earlier versions contained a Gemini credential. Repository history may retain it; its owner must revoke/rotate it and review provider usage. Removing it from current files is insufficient.
- Firebase web configuration identifies a public client project. Publish per-user Firestore rules; anonymous authentication alone does not isolate users.
- Anonymous accounts are specific to a browser profile. Clearing site data can lose account access. Learning data and JSON exports contain personal notes; keep backups private.
- External CDNs load code into the page. This is not a bundled offline application. Review dependency sources before deployment.

The AI proxy is loopback-only for personal local development. Its origin checks, body limits and request limit do not replace public-service authentication or quotas.

## Report a vulnerability

Do not post keys or private notes in public issues. Use **Security → Report a vulnerability** if private reporting is enabled. Otherwise use a private contact channel listed on the maintainer's GitHub profile. If none is listed, request a private reporting channel without disclosing vulnerability details.

Include the affected commit, reproduction steps without real secrets, expected/actual behavior and likely impact. No fixed response timeline is promised.

## 中文说明

安全修复仅面向 `main` 的最新版本。Gemini 密钥应保存在服务端，字符串拆分、编码或前端环境变量都不能保护密钥。旧版本已包含公开凭据，仓库历史仍可能保留；所有者需要在供应商控制台撤销或轮换密钥并检查调用记录。

Firebase 网页配置是公开客户端项目标识。请部署按用户 ID 隔离的 Firestore 规则；仅要求“已登录”不足以保护不同用户的数据。匿名登录不提供跨设备账户，清除浏览器数据可能失去账户访问权。请妥善保管笔记和备份。

本地 AI 代理只适合个人本机使用。公开部署需要独立的认证后端、配额与滥用防护。发现漏洞时优先使用 GitHub 私密漏洞报告；若未开启，使用维护者提供的私密联系方式，或先请求私密报告渠道，不要公开密钥、个人笔记或漏洞详情。

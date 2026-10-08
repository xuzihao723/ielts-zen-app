// Optional loopback-only development server. Public hosting needs an authenticated backend.
import { createServer } from 'node:http';
import { readFile } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';
import { resolve, dirname } from 'node:path';

const root = dirname(fileURLToPath(import.meta.url));
const assets = new Map([
  ['/', ['index.html', 'text/html; charset=utf-8']],
  ['/index.html', ['index.html', 'text/html; charset=utf-8']],
  ['/config.js', ['config.js', 'text/javascript; charset=utf-8']],
  ['/zen-core.js', ['zen-core.js', 'text/javascript; charset=utf-8']],
  ['/docs/images/dashboard.jpg', ['docs/images/dashboard.jpg', 'image/jpeg']],
  ['/docs/images/planner.jpg', ['docs/images/planner.jpg', 'image/jpeg']],
]);

export function createHandler({ apiKey = '', model = 'gemini-2.5-flash', fetchImpl = fetch } = {}) {
  // Global limit is sufficient for this single-user local server; no IP/header trust.
  let windowStart = Date.now();
  let requests = 0;
  return async (req, res) => {
    const send = (status, body) => {
      res.writeHead(status, { 'Content-Type': 'application/json; charset=utf-8', 'Cache-Control': 'no-store' });
      res.end(JSON.stringify(body));
    };
    try {
      const host = req.headers.host || '';
      if (!/^(localhost|127\.0\.0\.1)(:\d+)?$/.test(host)) return send(403, { error: '仅允许本机访问' });
      const url = new URL(req.url, `http://${host}`);
      if (url.pathname === '/api/advice') {
        if (req.method !== 'POST') return send(405, { error: '请使用 POST 请求' });
        if (req.headers.origin !== `http://${host}`) return send(403, { error: '请求来源不允许' });
        if (!(req.headers['content-type'] || '').startsWith('application/json')) return send(415, { error: '请发送 JSON 数据' });
        if (!apiKey) return send(503, { error: '请在服务端配置 GEMINI_API_KEY' });
        const chunks = [];
        let size = 0;
        for await (const chunk of req) {
          size += chunk.length;
          if (size > 16384) { send(413, { error: '笔记过长' }); req.resume(); return; }
          chunks.push(chunk);
        }
        let input;
        try { input = JSON.parse(Buffer.concat(chunks).toString('utf8')); } catch { return send(400, { error: 'JSON 格式无效' }); }
        if (!input || typeof input.note !== 'string' || !input.note.trim() || input.note.length > 4000) return send(400, { error: '请输入 1–4000 字的学习笔记' });
        if (Date.now() - windowStart >= 60000) { windowStart = Date.now(); requests = 0; }
        if (++requests > 5) return send(429, { error: '请求过于频繁，请一分钟后重试' });
        const taskType = ['词汇', '写作'].includes(input.taskType) ? input.taskType : '备考';
        const instruction = taskType === '词汇' ? '提供两个雅思例句并解释。' : taskType === '写作' ? '给出两个写作思路或替换词。' : '提供简短鼓励和学习指导。';
        const response = await fetchImpl(`https://generativelanguage.googleapis.com/v1beta/models/${encodeURIComponent(model)}:generateContent`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json', 'x-goog-api-key': apiKey },
          signal: AbortSignal.timeout(30000),
          body: JSON.stringify({
            contents: [{ parts: [{ text: `${instruction}用中文回答，120字以内。学生的${taskType}笔记：${input.note}` }] }],
            systemInstruction: { parts: [{ text: '你是一位雅思学习导师。建议仅作学习参考，不保证成绩。' }] },
            generationConfig: { maxOutputTokens: 2048 },
          }),
        });
        if (!response.ok) return send(response.status === 429 ? 429 : 502, { error: response.status === 429 ? 'AI 配额暂时不足，请稍后重试' : 'AI 服务请求失败，请检查服务端配置' });
        const data = await response.json();
        const text = data.candidates?.[0]?.content?.parts?.filter(part => !part.thought && typeof part.text === 'string').map(part => part.text).join('\n');
        if (!text) return send(502, { error: 'AI 未返回文字，请调整笔记后重试' });
        return send(200, { text });
      }
      if (!['GET', 'HEAD'].includes(req.method)) return send(405, { error: 'Method not allowed' });
      const asset = assets.get(url.pathname);
      if (!asset) return send(404, { error: 'Not found' });
      const content = await readFile(resolve(root, asset[0]));
      res.writeHead(200, { 'Content-Type': asset[1], 'Cache-Control': 'no-cache', 'X-Content-Type-Options': 'nosniff' });
      res.end(req.method === 'HEAD' ? undefined : content);
    } catch (error) {
      if (!res.headersSent) send(error.name === 'TimeoutError' ? 504 : 500, { error: '服务暂不可用，请稍后重试' });
      else res.end();
    }
  };
}

if (process.argv[1] && resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  const port = Number(process.env.PORT || 8080);
  const server = createServer(createHandler({ apiKey: process.env.GEMINI_API_KEY, model: process.env.GEMINI_MODEL || 'gemini-2.5-flash' }));
  server.listen(port, '127.0.0.1', () => console.log(`IELTS Zen: http://127.0.0.1:${port}`));
}

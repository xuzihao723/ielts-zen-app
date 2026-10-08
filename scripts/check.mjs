import { readFile } from 'node:fs/promises';
import Babel from '@babel/standalone';

const html = await readFile(new URL('../index.html', import.meta.url), 'utf8');
const jsx = html.match(/<script type="text\/babel"[^>]*>([\s\S]*?)<\/script>/)?.[1];
if (!jsx) throw new Error('Missing application script');
Babel.transform(jsx, { presets: ['react'], sourceType: 'module' });
for (const name of ['README.md', 'README.zh-CN.md']) {
  const markdown = await readFile(new URL(`../${name}`, import.meta.url), 'utf8');
  for (const match of markdown.matchAll(/\]\(([^)]+)\)/g)) {
    const target = match[1].split('#')[0];
    if (target && !/^(https?:|mailto:)/.test(target)) await readFile(new URL(`../${target}`, import.meta.url));
  }
}
if (/AIza[\w-]{20,}|keyPart[12]|GEMINI_API_KEY/.test(html)) throw new Error('Browser source contains a key or legacy key configuration');
console.log('JSX compilation, README local links and browser key checks passed.');

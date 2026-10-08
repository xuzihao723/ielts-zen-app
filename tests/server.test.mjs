import test from 'node:test';
import assert from 'node:assert/strict';
import { createServer } from 'node:http';
import { createHandler } from '../server.mjs';

async function withServer(options, run) {
  const server = createServer(createHandler(options));
  await new Promise(resolve => server.listen(0, '127.0.0.1', resolve));
  const url = `http://127.0.0.1:${server.address().port}`;
  const post = (body, headers = {}) => fetch(`${url}/api/advice`, { method: 'POST', headers: { Origin: url, 'Content-Type': 'application/json', ...headers }, body: typeof body === 'string' ? body : JSON.stringify(body) });
  try { await run({ url, post }); } finally { await new Promise(resolve => server.close(resolve)); }
}
test('static server serves app but cannot expose secrets or repository files', async () => {
  await withServer({}, async ({ url, post }) => {
    assert.equal((await fetch(url)).status, 200);
    for (const path of ['/.env', '/server.mjs', '/package.json', '/.git/config', '/%2e%2e/.env']) assert.equal((await fetch(url + path)).status, 404);
    assert.equal((await post({ note: 'test' })).status, 503);
    assert.equal((await post({ note: 'test' }, { Origin: 'https://other.example' })).status, 403);
  });
});
test('proxy validates input, returns text, hides key and limits requests', async () => {
  const calls = [];
  await withServer({ apiKey: 'test-key', fetchImpl: async (...args) => { calls.push(args); return Response.json({ candidates: [{ content: { parts: [{ thought: true, text: 'internal' }, { text: 'Try this example.' }, { text: 'Keep practising.' }] } }] }); } }, async ({ post }) => {
    assert.equal((await post('bad json')).status, 400);
    assert.equal((await post({ note: '' })).status, 400);
    assert.equal((await post({ note: 'a'.repeat(4001) })).status, 400);
    assert.equal((await post({ note: 'a'.repeat(17000) })).status, 413);
    const response = await post({ note: 'word use', taskType: '词汇' });
    assert.equal(response.status, 200);
    assert.deepEqual(await response.json(), { text: 'Try this example.\nKeep practising.' });
    assert.equal(calls[0][1].headers['x-goog-api-key'], 'test-key');
    assert.ok(!calls[0][0].includes('test-key'));
    assert.ok(JSON.parse(calls[0][1].body).contents[0].parts[0].text.includes('word use'));
    for (let i = 0; i < 4; i++) assert.equal((await post({ note: 'test' })).status, 200);
    assert.equal((await post({ note: 'test' })).status, 429);
  });
});
test('upstream failures and blocked output become useful responses without provider secrets', async () => {
  for (const [fetchImpl, expected] of [
    [async () => Response.json({ error: 'secret details' }, { status: 403 }), 502],
    [async () => Response.json({}, { status: 429 }), 429],
    [async () => Response.json({ promptFeedback: { blockReason: 'SAFETY' } }), 502],
    [async () => { throw new DOMException('timeout', 'TimeoutError'); }, 504],
  ]) await withServer({ apiKey: 'test-key', fetchImpl }, async ({ post }) => {
    const response = await post({ note: 'test' });
    assert.equal(response.status, expected);
    assert.ok(!(await response.text()).includes('secret details'));
  });
});

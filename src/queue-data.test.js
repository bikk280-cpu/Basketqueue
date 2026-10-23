import test from 'node:test';
import assert from 'node:assert/strict';
import { normalizeQueueData, encodeShareData, decodeShareData } from './queue-data.js';

const fixture = () => ({
  teamA: { name: '🏀 ทีมเอ', wins: 1 },
  teamB: { name: 'ทีมบี', wins: 0 },
  rest: null,
  queue: [{ name: 'ทีมซี + / & ?', wins: 0 }],
});

test('Unicode and URL punctuation survive a complete share URL round trip', () => {
  const data = fixture();
  const params = new URLSearchParams({ shareData: encodeShareData(data) });
  const url = new URL('https://example.com/Basketqueue/?' + params);
  assert.deepEqual(decodeShareData(url.searchParams.get('shareData')), { ...data, log: [], history: [] });
});

test('Reject malformed data before replacing the current queue', () => {
  for (const value of ['', '!', 'e30=', 'bnVsbA==', 'W10=']) {
    assert.throws(() => decodeShareData(value));
  }
  for (const value of [
    { ...fixture(), teamA: { name: 42, wins: 0 } },
    { ...fixture(), teamB: { name: 'B', wins: -1 } },
    { ...fixture(), teamB: { name: 'B', wins: '1' } },
    { ...fixture(), queue: [null] },
    { ...fixture(), queue: {} },
    { ...fixture(), rest: undefined },
  ]) assert.throws(() => normalizeQueueData(value));
});

test('Empty courts can be saved, shared, and restored', () => {
  const data = { ...fixture(), teamA: null, teamB: null, queue: [] };
  assert.deepEqual(decodeShareData(encodeShareData(data)), { ...data, log: [], history: [] });
});

test('Old placeholder teams are removed and real waiting teams fill vacancies', () => {
  const data = normalizeQueueData({ ...fixture(), teamA: { name: 'รอทีม...', wins: 0 },
    queue: [{ name: 'รอทีม...', wins: 0 }, { name: 'C', wins: 0 }] });
  assert.equal(data.teamA.name, 'C');
  assert.deepEqual(data.queue, []);
});

test('Validate saved undo snapshots as well as the current queue', () => {
  assert.throws(() => normalizeQueueData({ ...fixture(), history: [{}] }));
  const data = normalizeQueueData({ ...fixture(), history: [{ ...fixture(), teamA: null, queue: [] }] });
  assert.equal(data.history[0].teamA, null);
});

test('A transfer does not import logs or undo history', () => {
  const payload = { ...fixture(), log: [{ msg: 'private log', time: '12:00' }], history: [{}] };
  const raw = Buffer.from(JSON.stringify(payload)).toString('base64');
  assert.deepEqual(decodeShareData(raw), { ...fixture(), log: [], history: [] });
});

test('Restore old resting team format without a wins property', () => {
  const data = normalizeQueueData({ ...fixture(), rest: { name: 'Rest' } });
  assert.deepEqual(data.rest, { name: 'Rest', wins: 0 });
});

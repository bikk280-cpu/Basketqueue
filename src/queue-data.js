function team(value, allowEmpty = false) {
  if (value === null && allowEmpty) return null;
  if (!value || typeof value !== 'object' || Array.isArray(value) ||
      typeof value.name !== 'string' || !value.name.trim()) {
    throw new Error('Invalid team');
  }
  // Older saves represented an empty court as a real team with this name.
  if (value.name === 'รอทีม...') return null;
  const wins = value.wins ?? 0;
  if (!Number.isInteger(wins) || wins < 0 || wins > 1) throw new Error('Invalid wins');
  return { name: value.name.trim(), wins };
}

function snapshot(value) {
  if (!value || typeof value !== 'object' || !Array.isArray(value.queue)) {
    throw new Error('Invalid queue');
  }
  let teamA = team(value.teamA, true);
  let teamB = team(value.teamB, true);
  const rest = team(value.rest, true);
  const queue = value.queue.map(item => team(item)).filter(Boolean);
  if (!teamA && queue.length) teamA = { ...queue.shift(), wins: 0 };
  if (!teamB && queue.length) teamB = { ...queue.shift(), wins: 0 };
  const log = value.log ?? [];
  if (!Array.isArray(log) || log.some(item => !item ||
      typeof item.msg !== 'string' || typeof item.time !== 'string')) {
    throw new Error('Invalid log');
  }
  return { teamA, teamB, rest, queue, log: log.slice(0, 30).map(({ msg, time }) => ({ msg, time })) };
}

export function normalizeQueueData(value) {
  const normalized = snapshot(value);
  const history = value.history ?? [];
  if (!Array.isArray(history)) throw new Error('Invalid history');
  return { ...normalized, history: history.slice(-20).map(snapshot) };
}

export function encodeShareData(value) {
  const { teamA, teamB, rest, queue } = normalizeQueueData(value);
  const bytes = new TextEncoder().encode(JSON.stringify({ teamA, teamB, rest, queue }));
  let binary = '';
  for (const byte of bytes) binary += String.fromCharCode(byte);
  return btoa(binary);
}

export function decodeShareData(value) {
  if (typeof value !== 'string' || !value) throw new Error('Missing share data');
  const bytes = Uint8Array.from(atob(value), char => char.charCodeAt(0));
  const decoded = JSON.parse(new TextDecoder('utf-8', { fatal: true }).decode(bytes));
  // A transfer contains current teams only; do not import another device's history.
  const normalized = normalizeQueueData({ ...decoded, log: [], history: [] });
  return normalized;
}

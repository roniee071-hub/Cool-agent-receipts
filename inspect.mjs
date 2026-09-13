import fs from 'fs';
const content = fs.readFileSync('../../src/client.ts', 'utf8');
const lines = content.split('\n');
const start = lines.findIndex(l => l.includes('metadata_hash'));
console.log(lines.slice(Math.max(0, start - 15), start + 15).join('\n'));

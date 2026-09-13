import fs from 'fs';
const content = fs.readFileSync('../../src/client.ts', 'utf8');
const lines = content.split('\n');
const start = lines.findIndex(l => l.includes('async record('));
console.log(lines.slice(start, start + 40).join('\n'));

const response = await fetch('http://localhost:3001/api/execute-payment', { method: 'POST' });
const data = await response.json();
console.log('Execution result:', JSON.stringify(data.evidence.record, null, 2));

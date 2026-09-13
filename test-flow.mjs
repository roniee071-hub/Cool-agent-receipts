const response = await fetch('http://localhost:3001/api/execute-payment', { method: 'POST' });
const data = await response.json();
console.log('Execution result:', !!data.evidence);

const tampered = JSON.parse(JSON.stringify(data.evidence));
tampered.record.event.payloads.amount = 25000;

const verifyRes = await fetch('http://localhost:3001/api/verify', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({ evidence: tampered })
});
const verifyData = await verifyRes.json();
console.log('Verification with tampered data:', verifyData.verified);

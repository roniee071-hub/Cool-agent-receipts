async function run() {
  console.log("=== 1. Execute Payment (Generate Receipt) ===");
  const resExecute = await fetch('http://localhost:3001/api/execute-payment', { method: 'POST' });
  const dataExecute = await resExecute.json();
  const originalReceipt = dataExecute;
  console.log("Record ID:", originalReceipt.recordId);
  console.log("Execution ID:", originalReceipt.executionId);
  console.log("Receipt generated.");

  console.log("\n=== 2. Verify Untouched Evidence ===");
  const resVerify1 = await fetch('http://localhost:3001/api/verify', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ evidence: originalReceipt.evidence }),
  });
  const dataVerify1 = await resVerify1.json();
  console.log("Verification Result:", dataVerify1.verified);
  console.log("Details ok:", dataVerify1.details?.ok);

  console.log("\n=== 3. Tamper Evidence (Flip last char of metadata_hash) ===");
  let tamperedEvidence = JSON.parse(JSON.stringify(originalReceipt.evidence));
  if (tamperedEvidence.record?.event?.metadata_hash) {
      let h = tamperedEvidence.record.event.metadata_hash;
      let lastChar = h.slice(-1);
      let newLastChar = lastChar === '0' ? '1' : '0';
      tamperedEvidence.record.event.metadata_hash = h.slice(0, -1) + newLastChar;
      console.log("Original Hash:", h);
      console.log("Tampered Hash:", tamperedEvidence.record.event.metadata_hash);
  }

  console.log("\n=== 4. Verify Tampered Evidence ===");
  const resVerify2 = await fetch('http://localhost:3001/api/verify', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ evidence: tamperedEvidence }),
  });
  const dataVerify2 = await resVerify2.json();
  console.log("Verification Result:", dataVerify2.verified);
  if (!dataVerify2.verified) {
      console.log("Rejection Reason:", JSON.stringify(dataVerify2.details?.checks?.signature, null, 2));
  }
}

run().catch(console.error);

import { CooL, verifyEvidence } from 'cool-nwc';

async function run() {
  console.log("1. Generating actual receipt...");
  const cool = new CooL({ applicationId: 'hackathon-mvp-agent' });
  const evidenceObj = await cool.record({
    type: 'payment',
    executionId: 'exec-test',
    metadata: { 
      agent: 'Procurement Agent v3',
      vendor: 'Acme Supplies',
      purpose: 'Office inventory',
      amount: 2500
    }
  });

  console.log("2. Verifying untouched receipt...");
  let verdict = await verifyEvidence(evidenceObj.evidence);
  console.log("3. Verification succeeds?", verdict.ok);

  console.log("4. Tampering with evidence...");
  let tampered = JSON.parse(JSON.stringify(evidenceObj.evidence));
  
  // Try tampering the metadata itself
  if (tampered.record?.event?.metadata) {
      tampered.record.event.metadata.amount = 9999;
  }
  
  console.log("5. Verifying tampered evidence...");
  try {
      verdict = await verifyEvidence(tampered);
      console.log("6. Verification succeeds (should fail)?", verdict.ok);
      console.log("Verdict details:", verdict);
  } catch (err) {
      console.log("6. Verification genuinely failed with error:", err.message);
  }
}

run().catch(console.error);

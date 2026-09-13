import { CooL, verifyEvidence } from 'cool-nwc';

async function run() {
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

  let verdict = await verifyEvidence(evidenceObj.evidence);
  console.log("Untouched valid?", verdict.ok);

  let tampered = JSON.parse(JSON.stringify(evidenceObj.evidence));
  if (tampered.record?.event?.metadata_hash) {
      tampered.record.event.metadata_hash = tampered.record.event.metadata_hash.replace('a', 'b').replace('1', '2');
  }
  
  try {
      verdict = await verifyEvidence(tampered);
      console.log("Tampered valid?", verdict.ok);
      if(!verdict.ok) console.log("Failed due to:", verdict);
  } catch (err) {
      console.log("Error:", err.message);
  }
}

run().catch(console.error);

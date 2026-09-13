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

  let tampered = JSON.parse(JSON.stringify(evidenceObj.evidence));
  if (tampered.record?.event?.metadata_hash) {
      // proper tamper: modify the last character to a valid hex
      let h = tampered.record.event.metadata_hash;
      let lastChar = h.slice(-1);
      let newLastChar = lastChar === '0' ? '1' : '0';
      tampered.record.event.metadata_hash = h.slice(0, -1) + newLastChar;
  }
  
  let verdict = await verifyEvidence(tampered);
  console.log("Tampered valid?", verdict.ok);
  if(!verdict.ok) console.log("Failed due to:", verdict.checks.signature);
}

run().catch(console.error);

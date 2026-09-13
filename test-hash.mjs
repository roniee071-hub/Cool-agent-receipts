import { CooL, saltedCommit, canonicalCbor } from "cool-nwc";
const cool = new CooL({ applicationId: "test" });
const metadata = { vendor: "Acme Supplies" };
const payloads = { amount: 2500 };

const record = await cool.record({
  type: "payment",
  executionId: "exec-1",
  metadata,
  payloads
});

const ev = record.evidence.record.event;
console.log("metadata_hash:", ev.metadata_hash);
console.log("metadata_salt:", ev.metadata_salt);

const rawData = canonicalCbor({ metadata, payloads });
const hash = saltedCommit(rawData, ev.metadata_salt);
console.log("computed_hash:", hash);
await cool.close();

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
const hashCbor = saltedCommit(ev.metadata_salt, canonicalCbor({ metadata, payloads }));
const hashJson = saltedCommit(ev.metadata_salt, JSON.stringify({ metadata, payloads }));
console.log("metadata_hash:", ev.metadata_hash);
console.log("hashCbor:", hashCbor);
console.log("hashJson:", hashJson);
await cool.close();

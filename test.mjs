import { CooL, verifyEvidence } from "cool-nwc";
const cool = new CooL({ applicationId: "test" });
const record = await cool.record({
  type: "payment",
  executionId: "exec-1",
  metadata: { vendor: "Acme Supplies" },
  payloads: { amount: 2500 }
});
console.log(JSON.stringify(record, null, 2));
await cool.close();

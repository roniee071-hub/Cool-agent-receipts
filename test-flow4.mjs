import { CooL } from "cool-nwc";
const cool = new CooL({ applicationId: "test" });
console.log(Object.getOwnPropertyNames(Object.getPrototypeOf(cool)));
await cool.close();

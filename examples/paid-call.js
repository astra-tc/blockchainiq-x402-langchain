// Makes one real paid call ($0.01 USDC on Base) through the LangChain tool.
// AGENT_PRIVATE_KEY=0x... node examples/paid-call.js
import { privateKeyToAccount } from "viem/accounts";
import { createBlockchainIQTool } from "../src/index.js";

const account = privateKeyToAccount(process.env.AGENT_PRIVATE_KEY);
const tool = createBlockchainIQTool({ signer: account, maxPerCall: 0.01 });
const out = JSON.parse(await tool.invoke({ resource: "brief" }));
console.log(JSON.stringify(out.data, null, 2).slice(0, 1500));
console.log("settlement:", out.settlement);

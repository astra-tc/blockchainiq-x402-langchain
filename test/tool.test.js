import { test } from "node:test";
import assert from "node:assert/strict";
import { createBlockchainIQTool, createPayFetch, buildUrl } from "../src/index.js";
import { mockFetch, testSigner } from "./testlib.js";

test("buildUrl", () => {
  assert.equal(buildUrl("brief"), "https://www.blockchainiq.co/api/x402/v1/brief");
  assert.equal(buildUrl("event-risk", { days: 3 }), "https://www.blockchainiq.co/api/x402/v1/event-risk?days=3");
  assert.throws(() => buildUrl("nope"));
});

test("pays a $0.01 402 and returns data + settlement", async () => {
  const s = await testSigner();
  const t = createBlockchainIQTool({ payFetch: createPayFetch(s, { fetchImpl: mockFetch(10000) }) });
  const out = JSON.parse(await t.invoke({ resource: "brief" }));
  assert.equal(out.settlement.transaction, "0xabc");
  assert.equal(out.data.coins[0].symbol, "btc");
  assert.equal(s.signed, 1);
});

test("refuses a payment above the per-call cap without signing", async () => {
  const s = await testSigner();
  const t = createBlockchainIQTool({ payFetch: createPayFetch(s, { fetchImpl: mockFetch(1000000) }) }); // $1
  await assert.rejects(() => t.invoke({ resource: "brief" }));
  assert.equal(s.signed, 0);
});

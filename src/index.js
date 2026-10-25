import { tool } from "@langchain/core/tools";
import { z } from "zod";
import { createPayFetch, callBlockchainIQ, DEFAULT_MAX_PER_CALL } from "./core.js";
export * from "./core.js";

/**
 * LangChain tool for Blockchain IQ's pay-per-call crypto data API (x402, USDC on Base).
 * @param {object} o
 * @param {object} [o.signer] viem account (address + signTypedData)
 * @param {Function} [o.payFetch] pre-built paying fetch (overrides signer)
 * @param {number} [o.maxPerCall] refuse any single payment above this many USD (default 0.05)
 */
export function createBlockchainIQTool({ signer, payFetch, maxPerCall = DEFAULT_MAX_PER_CALL, onSettlement } = {}) {
  const pf = payFetch ?? createPayFetch(signer, { maxPerCall });
  return tool(
    async ({ resource, days }) => {
      const { data, settlement } = await callBlockchainIQ(pf, resource, { days });
      if (settlement && onSettlement) onSettlement(settlement);
      return JSON.stringify({ data, settlement });
    },
    {
      name: "blockchainiq_crypto_data",
      description:
        "Paid crypto market data from Blockchain IQ via x402 (USDC on Base). " +
        "resource='brief' ($0.01): BTC/ETH/SOL/XRP prices and moves, events in next 48h, risk flags. " +
        "resource='event-risk' ($0.05): US macro releases, central bank decisions, Treasury auctions and crypto/regulatory milestones, `days` ahead (default 7). Market data only, not investment advice.",
      schema: z.object({
        resource: z.enum(["brief", "event-risk"]).describe("Which resource to buy"),
        days: z.number().int().min(1).max(30).optional().describe("event-risk look-ahead in days"),
      }),
    },
  );
}

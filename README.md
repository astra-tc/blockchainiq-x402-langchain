# blockchainiq-x402-langchain

A [LangChain](https://js.langchain.com) tool for [Blockchain IQ](https://www.blockchainiq.co/agents)'s pay-per-call crypto data API. No account or API key: the tool pays each request in USDC on Base using the [x402](https://x402.org) standard (a gasless EIP-3009 transfer authorization signed by your agent wallet).

| resource | price | returns |
|---|---|---|
| `brief` | $0.01 | BTC/ETH/SOL/XRP prices and 24h/7d/30d moves, scheduled events in the next 48h, short risk flags |
| `event-risk` | $0.05 | US data releases, central bank decisions, Treasury auctions, crypto/regulatory milestones (`days` ahead, default 7) |

Prices come from the live catalogue at https://www.blockchainiq.co/api/x402/v1.

## Install

```bash
git clone https://github.com/astratc/blockchainiq-x402-langchain && cd blockchainiq-x402-langchain
npm install
```

## Use

```js
import { privateKeyToAccount } from "viem/accounts";
import { createBlockchainIQTool } from "./src/index.js";

const tool = createBlockchainIQTool({
  signer: privateKeyToAccount(process.env.AGENT_PRIVATE_KEY), // wallet with a little USDC on Base
  maxPerCall: 0.05, // refuse any single payment above $0.05 (default)
});

const out = JSON.parse(await tool.invoke({ resource: "brief" }));
console.log(out.data, out.settlement.transaction);

// or hand it to an agent: createAgent({ model, tools: [tool] }) / model.bindTools([tool])
```

The tool returns JSON `{ data, settlement }`, where `settlement` is the decoded `PAYMENT-RESPONSE` header (payer, network, transaction hash).

## Safety

- Only Base mainnet (`eip155:8453`) `exact` payments are registered.
- A per-call spend cap (default $0.05) is enforced by the x402 client before anything is signed; the tests check that an over-cap 402 is refused with zero signatures.
- Never commit your private key; pass it via the environment.

## Paid call example

```bash
AGENT_PRIVATE_KEY=0x... npm run example   # one $0.01 call to brief
```

Verified run (25 Oct 2026): settlement tx [`0x5c72508be592d854888575a0c4b7b579994dc4fb1e485a002669c5ad7bc5536a`](https://basescan.org/tx/0x5c72508be592d854888575a0c4b7b579994dc4fb1e485a002669c5ad7bc5536a).

## Tests

`npm test` runs offline against a mock x402 server with a throwaway key (no funds needed).

## License

MIT. Market data and analysis only, not investment advice. Not affiliated with Blockchain IQ.

const b64 = (o) => Buffer.from(JSON.stringify(o)).toString("base64");
export function req(amount) {
  return {
    x402Version: 2, error: "Payment required",
    resource: { url: "https://www.blockchainiq.co/api/x402/v1/brief", mimeType: "application/json" },
    accepts: [{ scheme: "exact", network: "eip155:8453", amount: String(amount),
      asset: "0x833589fCD6eDb6E08f4c7C32D4f71b54bdA02913", payTo: "0x617dA9383fbA67e86137BC4924b8b7E400fB7C9e",
      maxTimeoutSeconds: 300, extra: { name: "USD Coin", version: "2" } }],
  };
}
/** Mock server: 402 until a payment header arrives, then 200 + PAYMENT-RESPONSE. */
export function mockFetch(amount, calls = []) {
  return async (input, init) => {
    const r = input instanceof Request ? input : new Request(input, init);
    calls.push(r.url);
    const paid = r.headers.get("payment-signature") || r.headers.get("x-payment");
    if (!paid) return new Response(JSON.stringify({ error: "Payment required" }), { status: 402, headers: { "payment-required": b64(req(amount)) } });
    return new Response(JSON.stringify({ data: { coins: [{ symbol: "btc", price: 1 }] } }), {
      status: 200, headers: { "content-type": "application/json",
        "payment-response": b64({ success: true, transaction: "0xabc", network: "eip155:8453", payer: "0x1" }) } });
  };
}
export async function testSigner() {
  const { privateKeyToAccount, generatePrivateKey } = await import("viem/accounts");
  const acct = privateKeyToAccount(generatePrivateKey());
  const s = { address: acct.address, signed: 0, signTypedData: async (td) => { s.signed++; return acct.signTypedData(td); } };
  return s;
}

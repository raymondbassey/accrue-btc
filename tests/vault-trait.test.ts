import { describe, it, expect } from "vitest";

describe("vault-trait", () => {
  it("trait contract deploys successfully", () => {
    const contracts = simnet.getContractsInterfaces();
    expect(contracts.has(`${simnet.deployer}.vault-trait`)).toBe(true);
  });
});

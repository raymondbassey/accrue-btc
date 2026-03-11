import { describe, expect, it } from "vitest";
import { Cl } from "@stacks/transactions";

const accounts = simnet.getAccounts();
const deployer = accounts.get("deployer")!;
const wallet1 = accounts.get("wallet_1")!;
const wallet2 = accounts.get("wallet_2")!;
const wallet3 = accounts.get("wallet_3")!;

const vaultContract = "accrue-vault";
const tokenContract = "vault-token";
const sbtcContract = "SM3VDXK3WZZSA84XXFKAFAF15NNZX32CTSG82JFQ4.sbtc-token";

// Helper: set up the vault-token to authorize the vault contract
function setupVaultAuth() {
  const vaultPrincipal = `${deployer}.${vaultContract}`;
  simnet.callPublicFn(tokenContract, "set-vault-address", [Cl.principal(vaultPrincipal)], deployer);
}

// Helper: fund the vault contract with sBTC (simulates yield earnings)
function fundVault(from: string, amount: number) {
  const vaultPrincipal = `${deployer}.${vaultContract}`;
  simnet.callPublicFn(
    sbtcContract, "transfer",
    [Cl.uint(amount), Cl.principal(from), Cl.principal(vaultPrincipal), Cl.none()],
    from
  );
}

describe("accrue-vault", () => {
  // --- Initial state ---
  describe("initial state", () => {
    it("starts with zero total assets", () => {
      const { result } = simnet.callReadOnlyFn(vaultContract, "get-total-assets", [], deployer);
      expect(result).toBeOk(Cl.uint(0));
    });

    it("starts with zero shares for any address", () => {
      const { result } = simnet.callReadOnlyFn(
        vaultContract, "get-shares-of", [Cl.principal(wallet1)], deployer
      );
      expect(result).toBeOk(Cl.uint(0));
    });

    it("returns correct vault info on init", () => {
      const { result } = simnet.callReadOnlyFn(vaultContract, "get-vault-info", [], deployer);
      const tuple = (result as any).value;
      expect(tuple).toBeTuple({
        "total-assets": Cl.uint(0),
        "total-shares": Cl.uint(0),
        "deposit-cap": Cl.uint(1000000000),
        "paused": Cl.bool(false),
        "strategist": Cl.principal(deployer),
      });
    });
  });

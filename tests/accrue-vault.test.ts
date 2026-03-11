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
// --- Admin functions ---
  describe("admin functions", () => {
    it("owner can pause the vault", () => {
      const { result } = simnet.callPublicFn(vaultContract, "set-paused", [Cl.bool(true)], deployer);
      expect(result).toBeOk(Cl.bool(true));
    });

    it("non-owner cannot pause the vault", () => {
      const { result } = simnet.callPublicFn(vaultContract, "set-paused", [Cl.bool(true)], wallet1);
      expect(result).toBeErr(Cl.uint(200));
    });

    it("owner can set deposit cap", () => {
      const { result } = simnet.callPublicFn(
        vaultContract, "set-deposit-cap", [Cl.uint(5000000000)], deployer
      );
      expect(result).toBeOk(Cl.bool(true));
    });

    it("non-owner cannot set deposit cap", () => {
      const { result } = simnet.callPublicFn(
        vaultContract, "set-deposit-cap", [Cl.uint(5000000000)], wallet1
      );
      expect(result).toBeErr(Cl.uint(200));
    });

    it("owner can set strategist", () => {
      const { result } = simnet.callPublicFn(
        vaultContract, "set-strategist", [Cl.principal(wallet1)], deployer
      );
      expect(result).toBeOk(Cl.bool(true));
    });

    it("non-owner cannot set strategist", () => {
      const { result } = simnet.callPublicFn(
        vaultContract, "set-strategist", [Cl.principal(wallet1)], wallet2
      );
      expect(result).toBeErr(Cl.uint(200));
    });
  });

  // --- Deposit ---
  // Note: wallets are pre-funded with sbtc_balance = 1_000_000_000 in Devnet.toml
  describe("deposit", () => {
    it("first deposit mints 1:1 shares", () => {
      setupVaultAuth();

      const { result } = simnet.callPublicFn(
        vaultContract, "deposit", [Cl.uint(100000000)], wallet1
      );
      expect(result).toBeOk(Cl.uint(100000000));

      const { result: assets } = simnet.callReadOnlyFn(vaultContract, "get-total-assets", [], deployer);
      expect(assets).toBeOk(Cl.uint(100000000));

      const { result: shares } = simnet.callReadOnlyFn(
        vaultContract, "get-shares-of", [Cl.principal(wallet1)], deployer
      );
      expect(shares).toBeOk(Cl.uint(100000000));

      const { result: dep } = simnet.callReadOnlyFn(
        vaultContract, "get-deposit-of", [Cl.principal(wallet1)], deployer
      );
      expect(dep).toBeOk(Cl.uint(100000000));
    });

    it("second deposit mints proportional shares", () => {
      setupVaultAuth();

      simnet.callPublicFn(vaultContract, "deposit", [Cl.uint(100000000)], wallet1);

      const { result } = simnet.callPublicFn(
        vaultContract, "deposit", [Cl.uint(50000000)], wallet2
      );
      expect(result).toBeOk(Cl.uint(50000000));
    });

    it("rejects deposit of zero", () => {
      setupVaultAuth();
      const { result } = simnet.callPublicFn(
        vaultContract, "deposit", [Cl.uint(0)], wallet1
      );
      expect(result).toBeErr(Cl.uint(201));
    });

    it("rejects deposit when vault is paused", () => {
      setupVaultAuth();
      simnet.callPublicFn(vaultContract, "set-paused", [Cl.bool(true)], deployer);

      const { result } = simnet.callPublicFn(
        vaultContract, "deposit", [Cl.uint(100000000)], wallet1
      );
      expect(result).toBeErr(Cl.uint(204));
    });

    it("rejects deposit exceeding cap", () => {
      setupVaultAuth();
      simnet.callPublicFn(vaultContract, "set-deposit-cap", [Cl.uint(1000)], deployer);

      const { result } = simnet.callPublicFn(
        vaultContract, "deposit", [Cl.uint(5000)], wallet1
      );
      expect(result).toBeErr(Cl.uint(205));
    });

    it("allows multiple deposits from same user", () => {
      setupVaultAuth();

      simnet.callPublicFn(vaultContract, "deposit", [Cl.uint(100000000)], wallet1);
      const { result } = simnet.callPublicFn(vaultContract, "deposit", [Cl.uint(50000000)], wallet1);
      expect(result).toBeOk(Cl.uint(50000000));

      const { result: dep } = simnet.callReadOnlyFn(
        vaultContract, "get-deposit-of", [Cl.principal(wallet1)], deployer
      );
      expect(dep).toBeOk(Cl.uint(150000000));
    });
  });

  // --- Withdraw ---
  describe("withdraw", () => {
    it("withdraws full deposit when no yield", () => {
      setupVaultAuth();
      simnet.callPublicFn(vaultContract, "deposit", [Cl.uint(100000000)], wallet1);

      const { result } = simnet.callPublicFn(
        vaultContract, "withdraw", [Cl.uint(100000000)], wallet1
      );
      expect(result).toBeOk(Cl.uint(100000000));

      const { result: assets } = simnet.callReadOnlyFn(vaultContract, "get-total-assets", [], deployer);
      expect(assets).toBeOk(Cl.uint(0));

      const { result: shares } = simnet.callReadOnlyFn(
        vaultContract, "get-shares-of", [Cl.principal(wallet1)], deployer
      );
      expect(shares).toBeOk(Cl.uint(0));
    });

    it("partial withdrawal returns proportional assets", () => {
      setupVaultAuth();
      simnet.callPublicFn(vaultContract, "deposit", [Cl.uint(100000000)], wallet1);

      const { result } = simnet.callPublicFn(
        vaultContract, "withdraw", [Cl.uint(50000000)], wallet1
      );
      expect(result).toBeOk(Cl.uint(50000000));

      const { result: shares } = simnet.callReadOnlyFn(
        vaultContract, "get-shares-of", [Cl.principal(wallet1)], deployer
      );
      expect(shares).toBeOk(Cl.uint(50000000));
    });

    it("rejects withdraw of zero shares", () => {
      setupVaultAuth();
      const { result } = simnet.callPublicFn(
        vaultContract, "withdraw", [Cl.uint(0)], wallet1
      );
      expect(result).toBeErr(Cl.uint(201));
    });

    it("rejects withdraw of more shares than owned", () => {
      setupVaultAuth();
      simnet.callPublicFn(vaultContract, "deposit", [Cl.uint(100000000)], wallet1);

      const { result } = simnet.callPublicFn(
        vaultContract, "withdraw", [Cl.uint(200000000)], wallet1
      );
      expect(result).toBeErr(Cl.uint(202));
    });

    it("rejects withdraw when vault is paused", () => {
      setupVaultAuth();
      simnet.callPublicFn(vaultContract, "deposit", [Cl.uint(100000000)], wallet1);
      simnet.callPublicFn(vaultContract, "set-paused", [Cl.bool(true)], deployer);

      const { result } = simnet.callPublicFn(
        vaultContract, "withdraw", [Cl.uint(100000000)], wallet1
      );
      expect(result).toBeErr(Cl.uint(204));
    });
  });
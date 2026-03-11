import { describe, expect, it, beforeEach } from "vitest";
import { Cl } from "@stacks/transactions";

const accounts = simnet.getAccounts();
const deployer = accounts.get("deployer")!;
const wallet1 = accounts.get("wallet_1")!;
const wallet2 = accounts.get("wallet_2")!;

const contractName = "vault-token";

describe("vault-token", () => {
  // --- SIP-010 metadata ---
  describe("SIP-010 metadata", () => {
    it("returns the correct token name", () => {
      const { result } = simnet.callReadOnlyFn(contractName, "get-name", [], deployer);
      expect(result).toBeOk(Cl.stringAscii("AccrueBTC Share"));
    });

    it("returns the correct token symbol", () => {
      const { result } = simnet.callReadOnlyFn(contractName, "get-symbol", [], deployer);
      expect(result).toBeOk(Cl.stringAscii("aBTC"));
    });

    it("returns 8 decimals", () => {
      const { result } = simnet.callReadOnlyFn(contractName, "get-decimals", [], deployer);
      expect(result).toBeOk(Cl.uint(8));
    });

    it("returns the token URI", () => {
      const { result } = simnet.callReadOnlyFn(contractName, "get-token-uri", [], deployer);
      expect(result).toBeOk(Cl.some(Cl.stringUtf8("https://accruebtc.com/metadata.json")));
    });

    it("starts with zero total supply", () => {
      const { result } = simnet.callReadOnlyFn(contractName, "get-total-supply", [], deployer);
      expect(result).toBeOk(Cl.uint(0));
    });

    it("starts with zero balance for any address", () => {
      const { result } = simnet.callReadOnlyFn(
        contractName, "get-balance", [Cl.principal(wallet1)], deployer
      );
      expect(result).toBeOk(Cl.uint(0));
    });
  });

  // --- Access control ---
  describe("access control", () => {
    it("allows deployer to set vault address", () => {
      const { result } = simnet.callPublicFn(
        contractName, "set-vault-address", [Cl.principal(wallet1)], deployer
      );
      expect(result).toBeOk(Cl.bool(true));
    });

    it("rejects non-deployer from setting vault address", () => {
      const { result } = simnet.callPublicFn(
        contractName, "set-vault-address", [Cl.principal(wallet2)], wallet1
      );
      expect(result).toBeErr(Cl.uint(100)); // ERR_NOT_AUTHORIZED
    });

    it("rejects mint-shares from non-vault caller", () => {
      const { result } = simnet.callPublicFn(
        contractName, "mint-shares", [Cl.uint(1000), Cl.principal(wallet1)], wallet1
      );
      expect(result).toBeErr(Cl.uint(100)); // ERR_NOT_AUTHORIZED
    });

    it("rejects burn-shares from non-vault caller", () => {
      const { result } = simnet.callPublicFn(
        contractName, "burn-shares", [Cl.uint(1000), Cl.principal(wallet1)], wallet1
      );
      expect(result).toBeErr(Cl.uint(100)); // ERR_NOT_AUTHORIZED
    });
  });

  // --- Mint and burn (via vault address) ---
  describe("mint and burn via authorized vault", () => {
    it("mints shares when called by authorized vault address", () => {
      // Set wallet1 as the vault address
      simnet.callPublicFn(contractName, "set-vault-address", [Cl.principal(wallet1)], deployer);

      // wallet1 (acting as vault) mints shares to wallet2
      const { result } = simnet.callPublicFn(
        contractName, "mint-shares", [Cl.uint(5000), Cl.principal(wallet2)], wallet1
      );
      expect(result).toBeOk(Cl.bool(true));

      // Verify balance
      const { result: balance } = simnet.callReadOnlyFn(
        contractName, "get-balance", [Cl.principal(wallet2)], deployer
      );
      expect(balance).toBeOk(Cl.uint(5000));

      // Verify total supply
      const { result: supply } = simnet.callReadOnlyFn(contractName, "get-total-supply", [], deployer);
      expect(supply).toBeOk(Cl.uint(5000));
    });

    it("burns shares when called by authorized vault address", () => {
      simnet.callPublicFn(contractName, "set-vault-address", [Cl.principal(wallet1)], deployer);
      simnet.callPublicFn(contractName, "mint-shares", [Cl.uint(5000), Cl.principal(wallet2)], wallet1);

      const { result } = simnet.callPublicFn(
        contractName, "burn-shares", [Cl.uint(2000), Cl.principal(wallet2)], wallet1
      );
      expect(result).toBeOk(Cl.bool(true));

      const { result: balance } = simnet.callReadOnlyFn(
        contractName, "get-balance", [Cl.principal(wallet2)], deployer
      );
      expect(balance).toBeOk(Cl.uint(3000));
    });
  });

  // --- SIP-010 transfer ---
  describe("SIP-010 transfer", () => {
    it("allows token owner to transfer shares", () => {
      // Setup: mint shares to wallet1
      simnet.callPublicFn(contractName, "set-vault-address", [Cl.principal(deployer)], deployer);
      simnet.callPublicFn(contractName, "mint-shares", [Cl.uint(10000), Cl.principal(wallet1)], deployer);

      // wallet1 transfers to wallet2
      const { result } = simnet.callPublicFn(
        contractName, "transfer",
        [Cl.uint(3000), Cl.principal(wallet1), Cl.principal(wallet2), Cl.none()],
        wallet1
      );
      expect(result).toBeOk(Cl.bool(true));

      const { result: b1 } = simnet.callReadOnlyFn(contractName, "get-balance", [Cl.principal(wallet1)], deployer);
      expect(b1).toBeOk(Cl.uint(7000));

      const { result: b2 } = simnet.callReadOnlyFn(contractName, "get-balance", [Cl.principal(wallet2)], deployer);
      expect(b2).toBeOk(Cl.uint(3000));
    });

    it("rejects transfer from non-owner", () => {
      simnet.callPublicFn(contractName, "set-vault-address", [Cl.principal(deployer)], deployer);
      simnet.callPublicFn(contractName, "mint-shares", [Cl.uint(10000), Cl.principal(wallet1)], deployer);

      // wallet2 tries to transfer wallet1's tokens
      const { result } = simnet.callPublicFn(
        contractName, "transfer",
        [Cl.uint(3000), Cl.principal(wallet1), Cl.principal(wallet2), Cl.none()],
        wallet2
      );
      expect(result).toBeErr(Cl.uint(101)); // ERR_NOT_TOKEN_OWNER
    });

    it("rejects transfer of more than balance", () => {
      simnet.callPublicFn(contractName, "set-vault-address", [Cl.principal(deployer)], deployer);
      simnet.callPublicFn(contractName, "mint-shares", [Cl.uint(1000), Cl.principal(wallet1)], deployer);

      const { result } = simnet.callPublicFn(
        contractName, "transfer",
        [Cl.uint(5000), Cl.principal(wallet1), Cl.principal(wallet2), Cl.none()],
        wallet1
      );
      expect(result).toBeErr(Cl.uint(1)); // ft-transfer? insufficient balance
    });
  });
});

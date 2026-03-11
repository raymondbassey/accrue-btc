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
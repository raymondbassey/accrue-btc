;; title: vault-trait
;; version: 1.0.0
;; summary: Interface definition for AccrueBTC vault
;; description: Defines the public API that any AccrueBTC vault implementation must satisfy.

(define-trait vault-trait
  (
    ;; Deposit sBTC into the vault, returns shares minted
    (deposit (uint) (response uint uint))

    ;; Withdraw sBTC by burning shares, returns sBTC amount
    (withdraw (uint) (response uint uint))

    ;; Get total sBTC held by the vault
    (get-total-assets () (response uint uint))
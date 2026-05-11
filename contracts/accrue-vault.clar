;; title: accrue-vault
;; version: 1.0.0
;; summary: AccrueBTC - non-custodial sBTC yield vault
;; description: Users deposit sBTC, receive proportional share tokens (aBTC),
;;   and can withdraw their sBTC plus any accrued yield at any time.
;;   Yield is added to the vault by an authorized strategist.

(impl-trait .vault-trait.vault-trait)
;; --- Constants ---
(define-constant CONTRACT_OWNER tx-sender)
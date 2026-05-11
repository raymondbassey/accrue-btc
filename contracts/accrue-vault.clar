;; title: accrue-vault
;; version: 1.0.0
;; summary: AccrueBTC - non-custodial sBTC yield vault
;; description: Users deposit sBTC, receive proportional share tokens (aBTC),
;;   and can withdraw their sBTC plus any accrued yield at any time.
;;   Yield is added to the vault by an authorized strategist.

(impl-trait .vault-trait.vault-trait)

;; --- Constants ---
(define-constant CONTRACT_OWNER tx-sender)
(define-constant PRECISION u100000000) ;; 1e8, matches sBTC 8 decimals

(define-constant ERR_NOT_AUTHORIZED (err u200))
(define-constant ERR_ZERO_AMOUNT (err u201))
(define-constant ERR_INSUFFICIENT_SHARES (err u202))
(define-constant ERR_INSUFFICIENT_ASSETS (err u203))
(define-constant ERR_VAULT_PAUSED (err u204))
(define-constant ERR_DEPOSIT_CAP_REACHED (err u205))
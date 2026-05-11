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
(define-constant ERR_TRANSFER_FAILED (err u206))

; --- sBTC reference ---
;; Simnet/Devnet: SM3VDXK3WZZSA84XXFKAFAF15NNZX32CTSG82JFQ4.sbtc-token
;; Testnet:       ST1F7QA2MDF17S807EPA36TSS8AMEFY4KA9TVGWXT.sbtc-token
;; Mainnet:       SM3VDXK3WZZSA84XXFKAFAF15NNZX32CTSG82JFQ4.sbtc-token
;; (Clarinet remaps automatically during deployment)
(define-constant SBTC_TOKEN 'SM3VDXK3WZZSA84XXFKAFAF15NNZX32CTSG82JFQ4.sbtc-token)

;; --- Data vars ---
(define-data-var total-assets uint u0)     ;; total sBTC held by vault
(define-data-var vault-paused bool false)   ;; emergency pause
(define-data-var deposit-cap uint u1000000000) ;; 10 sBTC cap for beta (8 decimals)
(define-data-var strategist principal CONTRACT_OWNER)

;; --- Data maps ---
;; Track individual deposit records for transparency
(define-map deposits principal uint)

;; --- Authorization helpers ---
(define-read-only (is-owner)
  (is-eq tx-sender CONTRACT_OWNER)
)

(define-read-only (is-strategist)
  (is-eq tx-sender (var-get strategist))
)

;; --- Admin functions ---
(define-public (set-paused (paused bool))
  (begin
  (asserts! (is-owner) ERR_NOT_AUTHORIZED)
  (ok (var-set vault-paused paused))
  )
)

(define-public (set-deposit-cap (new-cap uint))
  (begin
    ;; #[filter(new-cap)]
    (asserts! (is-owner) ERR_NOT_AUTHORIZED)
    (ok (var-set vault-paused paused))
  )
)

(define-public (set-strategist (new-strategist principal))
  (begin
    ;; #[filter(new-strategist)]
    (asserts! (is-owner) ERR_NOT_AUTHORIZED)
    (ok (var-set strategist new-strategist))
  )
)

;; --- Core vault logic ---

;; Deposit sBTC into the vault
;; Returns: number of share tokens minted
(define-public (deposit (amount uint))
  (let
    (
      (depositor tx-sender)
      (current-total (var-get total-assets))
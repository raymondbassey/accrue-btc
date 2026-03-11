;; title: vault-token
;; version: 1.0.0
;; summary: SIP-010 share token for AccrueBTC vault
;; description: Represents a depositor's proportional share of the vault's sBTC holdings.
;;   Only the vault contract can mint and burn share tokens.

;; SIP-010 trait reference:
;; Simnet/Devnet: SP3FBR2AGK5H9QBDH3EEN6DF8EK8JY7RX8QJ5SVTE.sip-010-trait-ft-standard
;; Testnet:       ST1NXBK3K5YYMD6FD41MVNP3JS1GABZ8TRVX023PT.sip-010-trait-ft-standard
;; (Clarinet remaps automatically during deployment)
(impl-trait 'SP3FBR2AGK5H9QBDH3EEN6DF8EK8JY7RX8QJ5SVTE.sip-010-trait-ft-standard.sip-010-trait)

;; --- Token definition ---
(define-fungible-token accrue-share)

;; --- Constants ---
(define-constant CONTRACT_OWNER tx-sender)
(define-constant ERR_NOT_AUTHORIZED (err u100))
(define-constant ERR_NOT_TOKEN_OWNER (err u101))

(define-constant TOKEN_NAME "AccrueBTC Share")
(define-constant TOKEN_SYMBOL "aBTC")
(define-constant TOKEN_DECIMALS u8) ;; matches sBTC precision
(define-constant TOKEN_URI u"https://accruebtc.com/metadata.json")

;; --- Data vars ---
;; The vault contract principal authorized to mint/burn
(define-data-var vault-address principal CONTRACT_OWNER)

;; --- Authorization ---
(define-read-only (is-vault-caller)
  (is-eq contract-caller (var-get vault-address))
)

;; Allow contract owner to set the vault address (one-time setup)
(define-public (set-vault-address (new-vault principal))
  (begin
    ;; #[filter(new-vault)]
    (asserts! (is-eq tx-sender CONTRACT_OWNER) ERR_NOT_AUTHORIZED)
    (ok (var-set vault-address new-vault))
  )
)

;; --- Vault-only functions ---
;; Mint shares to a depositor (only callable by vault contract)
(define-public (mint-shares (amount uint) (recipient principal))
  (begin
    ;; #[filter(amount, recipient)]
    (asserts! (is-vault-caller) ERR_NOT_AUTHORIZED)
    (ft-mint? accrue-share amount recipient)
  )
)

;; Burn shares from a withdrawer (only callable by vault contract)
(define-public (burn-shares (amount uint) (owner principal))
  (begin
    ;; #[filter(amount, owner)]
    (asserts! (is-vault-caller) ERR_NOT_AUTHORIZED)
    (ft-burn? accrue-share amount owner)
  )
)

;; --- SIP-010 Interface ---
(define-public (transfer
    (amount uint)
    (sender principal)
    (recipient principal)
    (memo (optional (buff 34)))
  )
  (begin
    ;; #[filter(amount, recipient)]
    (asserts! (or (is-eq tx-sender sender) (is-eq contract-caller sender))
      ERR_NOT_TOKEN_OWNER
    )
    (try! (ft-transfer? accrue-share amount sender recipient))
    (match memo to-print (print to-print) 0x)
    (ok true)
  )
)

(define-read-only (get-name)
  (ok TOKEN_NAME)
)

(define-read-only (get-symbol)
  (ok TOKEN_SYMBOL)
)

(define-read-only (get-decimals)
  (ok TOKEN_DECIMALS)
)

(define-read-only (get-balance (who principal))
  (ok (ft-get-balance accrue-share who))
)

(define-read-only (get-total-supply)
  (ok (ft-get-supply accrue-share))
)

(define-read-only (get-token-uri)
  (ok (some TOKEN_URI))
)


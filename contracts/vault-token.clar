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
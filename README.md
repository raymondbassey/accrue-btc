# AccrueBTC

**Deposit sBTC. Accrue yield. Stay sovereign.**

AccrueBTC is a non-custodial sBTC yield vault built on Stacks using Clarity 4. Users deposit sBTC and receive proportional share tokens (aBTC). An authorized strategist reports yield, increasing the value of each share over time. Users can withdraw their original deposit plus accrued yield at any time.

## Architecture

```
┌─────────────────────────────────────────────────┐
│                  AccrueBTC Vault                │
│                                                 │
│  User deposits sBTC ──► Mint aBTC shares        │
│  Strategist reports yield ──► Share value grows  │
│  User burns aBTC shares ──► Withdraw sBTC+yield │
└─────────────────────────────────────────────────┘
```

### Contracts

| Contract | Description |
|----------|-------------|
| `vault-trait` | Interface definition for vault implementations |
| `vault-token` | SIP-010 compliant share token (aBTC) representing proportional vault ownership |
| `accrue-vault` | Core vault logic: deposit, withdraw, yield reporting, admin controls |

### Key Features

- **Non-custodial** - Users maintain sovereignty over their sBTC through transparent smart contract logic
- **Proportional shares** - aBTC tokens represent fair, proportional ownership of the vault's total assets
- **Yield accrual** - Strategist-reported yield increases share value for all depositors
- **Admin controls** - Emergency pause, configurable deposit cap, and strategist role management
- **SIP-010 compliant** - Share tokens follow the standard fungible token interface

## Getting Started

### Prerequisites

- [Clarinet](https://docs.hiro.so/stacks/clarinet) v3.11+
- Node.js 18+

### Setup

```bash
npm install
```

### Check Contracts

```bash
clarinet check
```

### Run Tests

```bash
npm test
```

### Interactive Console

```bash
clarinet console
```

## Usage

### Deposit sBTC

```clarity
(contract-call? .accrue-vault deposit u100000000) ;; Deposit 1 sBTC
```

### Check Your Shares

```clarity
(contract-call? .accrue-vault get-shares-of tx-sender)
```

### Withdraw

```clarity
(contract-call? .accrue-vault withdraw u100000000) ;; Burn 100M shares
```

### Check Vault Info

```clarity
(contract-call? .accrue-vault get-vault-info)
```

## Deployment

### Testnet

Update `settings/Testnet.toml` with your mnemonic, then:

```bash
clarinet deployments generate --testnet
clarinet deployments apply --testnet
```

Clarinet automatically remaps contract addresses between simnet, testnet, and mainnet.

## Testing

44 unit tests covering:

- **vault-trait** - Deployment verification
- **vault-token** - SIP-010 metadata, access control, mint/burn, transfers
- **accrue-vault** - Initial state, admin functions, deposits, withdrawals, yield reporting, full lifecycle

## License

MIT

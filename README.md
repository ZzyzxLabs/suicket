# CalHacks 12.0 NFT Ticket System

A blockchain-based ticket system built on Sui for CalHacks 12.0. This dApp allows users to mint NFT tickets, view them with QR codes, and scan them for event check-in - all without a separate backend.

## Features

- **Mint NFT Tickets**: Free minting with a 50-ticket supply cap
- **My Tickets**: View your owned tickets with auto-generated QR codes
- **QR Scanner**: Scan tickets to verify validity and prevent double-use
- **On-Chain Status**: All ticket status is stored on the blockchain (fraud-proof)
- **No Backend**: 100% decentralized - all logic runs on Sui Move smart contracts

## Tech Stack

- [Sui Move](https://docs.sui.io/guides/developer/first-app/write-package) - Smart contracts
- [React](https://react.dev/) + [TypeScript](https://www.typescriptlang.org/) - Frontend
- [Vite](https://vitejs.dev/) - Build tooling
- [Radix UI](https://www.radix-ui.com/) - UI components
- [@mysten/dapp-kit](https://sdk.mystenlabs.com/dapp-kit) - Sui wallet integration
- [qrcode.react](https://www.npmjs.com/package/qrcode.react) - QR code generation
- [html5-qrcode](https://www.npmjs.com/package/html5-qrcode) - QR code scanning
- [pnpm](https://pnpm.io/) - Package management

---

## Quick Start

### Prerequisites

- [Node.js](https://nodejs.org/) (v18+)
- [pnpm](https://pnpm.io/) package manager
- [Sui CLI](https://docs.sui.io/build/install) installed and configured

### Installation

1. Clone the repository and install dependencies:

```bash
pnpm install
```

2. Set up Sui CLI for devnet (or testnet):

```bash
# Create devnet environment
sui client new-env --alias devnet --rpc https://fullnode.devnet.sui.io:443
sui client switch --env devnet

# Create a new wallet address if needed
sui client new-address secp256k1
sui client switch --address 0xYOUR_ADDRESS

# Get devnet SUI tokens
# Visit: https://faucet.sui.io
```

---

## Deployment

### Step 1: Deploy Move Contract

Navigate to the Move package directory and publish:

```bash
cd move/suicket
sui client publish --gas-budget 100000000
```

**Important:** Save the following from the output:

1. **Package ID** - Look for `"packageId"` in the published objects
2. **EventCounter Object ID** - Look for the shared object with type `EventCounter`

Example output:
```
Published Objects:
  PackageID: 0xabcd1234...
  SharedObject EventCounter: 0xef567890...
```

### Step 2: Configure Frontend

1. Copy the environment template:

```bash
cp .env.example .env
```

2. Edit `.env` and fill in your deployment values:

```env
VITE_PACKAGE_ID=0xYOUR_PACKAGE_ID_HERE
VITE_COUNTER_ID=0xYOUR_COUNTER_ID_HERE
```

### Step 3: Run the dApp

Start the development server:

```bash
pnpm dev
```

The app will be available at `http://localhost:5173`

---

## Usage

### For Attendees

1. **Connect Wallet**: Click "Connect" in the top right
2. **Mint Ticket**: Go to the "Mint" page and click "Mint Ticket"
3. **View Ticket**: Navigate to "My Tickets" to see your NFT with QR code
4. **Check-In**: Show your QR code at the event entrance

### For Event Staff

1. Open the "Scanner" page
2. Click "Start Scanner" to activate camera
3. Point camera at attendee's QR code
4. System automatically verifies on-chain:
   - ✅ **Green** = Valid ticket (first use)
   - ❌ **Red** = Already used or invalid

---

## Project Structure

```
suicket/
├── move/suicket/              # Sui Move smart contracts
│   ├── sources/
│   │   └── suicket.move       # Ticket NFT contract
│   └── Move.toml              # Package config
├── src/
│   ├── App.tsx                # Main app with routing
│   ├── MintTicket.tsx         # Minting page
│   ├── MyTickets.tsx          # Ticket display with QR codes
│   ├── Scanner.tsx            # QR scanner for check-in
│   ├── types.ts               # TypeScript types
│   ├── constants.ts           # Package/Counter IDs
│   └── networkConfig.ts       # Network configuration
├── .env.example               # Environment template
└── README.md                  # This file
```

---

## Smart Contract Overview

### Structs

**EventCounter** (Shared Object)
- Tracks total minted tickets
- Max supply: 50

**Ticket** (NFT)
- `ticket_number`: Sequential number (1-50)
- `owner`: Current owner address
- `status`: 0 = Valid, 1 = Used

### Functions

**`mint_ticket(counter, ctx)`**
- Mints a new ticket NFT
- Aborts if supply cap reached

**`use_ticket(ticket, ctx)`**
- Marks ticket as "used"
- Only owner can call
- Prevents double-use

**`transfer_ticket(ticket, recipient, ctx)`**
- Transfers ticket to new owner
- Updates owner field

---

## Testing

### Move Contract Tests

Run the built-in unit tests:

```bash
cd move/suicket
sui move test
```

Tests cover:
- ✅ Minting within supply cap
- ✅ Supply cap enforcement
- ✅ Ticket usage (single use)
- ✅ Double-use prevention
- ✅ Owner-only usage restriction
- ✅ Ticket transfers

### Manual Frontend Testing

1. Mint a ticket
2. Check it appears in "My Tickets"
3. Verify QR code displays
4. Scan QR code with scanner
5. Mark ticket as used
6. Try scanning again (should show "Already Used")

---

## Troubleshooting

**"Counter ID not configured"**
- Make sure you've created `.env` and filled in `VITE_COUNTER_ID`

**"Transaction failed: Insufficient gas"**
- Request more SUI from the faucet

**"Camera permission denied"**
- Grant camera access in browser settings for QR scanning

**TypeScript errors after install**
- Run `pnpm install` again
- Make sure you're using Node.js v18+

---

## Production Deployment

For mainnet deployment:

1. Switch to mainnet:
```bash
sui client switch --env mainnet
```

2. Publish contract (costs real SUI):
```bash
cd move/suicket
sui client publish --gas-budget 100000000
```

3. Update [src/constants.ts](src/constants.ts):
```ts
export const MAINNET_COUNTER_PACKAGE_ID = "0xYOUR_MAINNET_PACKAGE";
export const MAINNET_COUNTER_ID = "0xYOUR_MAINNET_COUNTER";
```

4. Build for production:
```bash
pnpm build
```

5. Deploy the `dist/` folder to your hosting service (Vercel, Netlify, etc.)

---

## Demo Script

See [DEMO_SCRIPT.md](DEMO_SCRIPT.md) for a 2-minute presentation walkthrough for judges.

---

## License

MIT

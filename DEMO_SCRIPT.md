# CalHacks 12.0 NFT Ticket System - Demo Script

## 2-Minute Judge Presentation

---

### Setup (30 seconds before judges arrive)

**Pre-Demo Checklist:**
- [ ] Open browser to `http://localhost:5173`
- [ ] Connect Sui wallet (ensure wallet has devnet SUI)
- [ ] Mint 1 test ticket to show in wallet
- [ ] Have phone ready with camera for scanning demo
- [ ] Open blockchain explorer tab (optional: to show on-chain data)

---

## Live Demo Flow

### [0:00-0:30] Introduction & Minting

**Script:**
> "This is a blockchain ticketing system for CalHacks that runs entirely on Sui - no backend needed. Let me show you how it works."

**Actions:**
1. Point to the **Mint** page showing "X/50 tickets remaining"
2. Click **"Mint Ticket"** button
3. While transaction processes: "This is calling a Move smart contract to mint an NFT ticket"
4. Show success message with transaction digest
5. Click **"My Tickets"** navigation button

**Key Points to Mention:**
- Free minting (no payment for MVP)
- 50-ticket supply cap enforced by smart contract
- Each ticket is a unique NFT on Sui blockchain

---

### [0:30-1:00] Ticket Display & QR Code

**Script:**
> "Here's my ticket. Every ticket is an NFT with a unique QR code."

**Actions:**
1. Show ticket card with:
   - Ticket number (#1, #2, etc.)
   - Green "Valid" status badge
   - QR code (auto-generated from object ID)
2. Point to QR code: "This encodes the ticket's blockchain object ID"
3. Hover/click to enlarge QR code (if implemented)

**Key Points to Mention:**
- Each QR code is unique to the ticket's on-chain object ID
- Status badge shows real-time blockchain state
- Anyone with a Sui wallet can view and verify ownership

---

### [1:00-1:30] Scanning & Verification

**Script:**
> "Now let's simulate event check-in using the QR scanner."

**Actions:**
1. Click **"Scanner"** navigation button
2. Click **"Start Scanner"** to activate camera
3. Show camera view on screen (if possible)
4. Scan the QR code from desktop with phone OR use second browser window
5. Show result screen:
   - Green checkmark
   - "✅ VALID TICKET"
   - Ticket number displayed
6. Say: "The scanner just verified this ticket on-chain in real-time"

**Key Points to Mention:**
- Scanner queries Sui blockchain directly (no backend API)
- Instant verification of ticket validity
- Shows ticket owner address (provable ownership)

---

### [1:30-2:00] Fraud Prevention Demo

**Script:**
> "Here's the key feature: fraud prevention. Watch what happens if I try to use the same ticket twice."

**Actions:**
1. Go back to **"My Tickets"** page
2. Click **"Mark as Used"** button on the scanned ticket
3. Wait for transaction to confirm
4. Show status badge change from 🟢 "Valid" to 🔴 "Used"
5. Go to **Scanner** page again
6. Scan the same QR code
7. Show red error screen:
   - Red X
   - "❌ ALREADY USED"
   - "This ticket has already been checked in"

**Key Points to Mention:**
- Status is stored on blockchain (can't be faked)
- Smart contract prevents double-use
- Anyone can verify ticket status independently

---

## Closing Statement (5-10 seconds)

**Script:**
> "This is completely decentralized - all the logic runs on Sui Move smart contracts with zero backend infrastructure. The entire check-in system is fraud-proof and transparent."

---

## Backup Talking Points

If judges ask questions, be ready to discuss:

### Technical Implementation
- **Move Contract**: EventCounter shared object + Ticket NFT struct
- **Frontend**: React + TypeScript with Sui dApp Kit
- **QR Generation**: qrcode.react library encoding object IDs
- **QR Scanning**: html5-qrcode with camera access

### Security Features
- Max supply enforced by smart contract assertion
- Only ticket owner can mark as used
- Status check prevents double redemption
- All data immutable on blockchain

### Scalability
- Current: 50 tickets (hardcoded for demo)
- Production: Configurable supply cap
- Could add: Dynamic pricing, multiple event types, transfer restrictions

### Why Sui?
- Fast finality (~400ms)
- Low transaction costs
- Object-centric model perfect for NFTs
- Built-in wallet infrastructure

---

## Troubleshooting During Demo

**If minting fails:**
- "Looks like we need more gas - let me request from the faucet"
- Have faucet tab ready: `https://faucet.sui.io`

**If scanner won't start:**
- "Camera permissions - let me grant access"
- Use second browser window to show QR instead

**If network is slow:**
- "We're on devnet which can be slower than mainnet"
- Explain while waiting: "In production, Sui has sub-second finality"

**If browser crashes:**
- Have backup video recording ready
- Or use blockchain explorer to show on-chain state

---

## Post-Demo Q&A Prep

**Expected Questions:**

**Q: "What prevents fake QR codes?"**
A: The QR code is just the object ID. Scanner queries the blockchain directly - if the object doesn't exist or isn't a valid Ticket, it's rejected.

**Q: "What about offline scanning?"**
A: Current version requires internet. Could add offline mode with batch verification later.

**Q: "Can tickets be transferred?"**
A: Yes! We have a `transfer_ticket` function. Owners can send tickets to other addresses.

**Q: "How much does this cost?"**
A: On Sui devnet it's free. On mainnet, minting costs <$0.01 in gas fees.

**Q: "Why blockchain instead of a database?"**
A: Three reasons: (1) No backend to maintain, (2) Provable scarcity/ownership, (3) Impossible to counterfeit tickets.

---

## Success Metrics

**Demo is successful if judges understand:**
1. ✅ Tickets are NFTs on Sui blockchain
2. ✅ QR codes enable real-world check-in
3. ✅ On-chain status prevents fraud
4. ✅ No backend/database needed
5. ✅ System is fully decentralized

---

## Emergency Fallback

If live demo completely fails, have these ready:

1. **Screenshots** of each page (Mint, My Tickets, Scanner)
2. **Video recording** of full flow
3. **Sui Explorer link** showing deployed contract
4. **Code walkthrough** of key Move functions

---

## One-Sentence Pitch

"A fully decentralized ticketing system where NFTs on Sui blockchain replace traditional tickets, with QR codes for scanning and on-chain status to prevent fraud - all without any backend infrastructure."

---

Good luck! 🚀

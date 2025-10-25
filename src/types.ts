// CHANGED: Added TypeScript types for ticket NFT system

export interface TicketData {
  objectId: string;
  ticketNumber: number;
  status: 0 | 1;  // 0 = Valid, 1 = Used
  owner: string;
}

export interface EventCounterData {
  objectId: string;
  minted: number;
}

export const TICKET_STATUS = {
  VALID: 0 as const,
  USED: 1 as const,
};

export const MAX_SUPPLY = 50;

// CHANGED: Added TypeScript types for ticket NFT system

export interface TicketData {
  objectId: string;
  ticketNumber: number;
  status: 0 | 1;  // 0 = Valid, 1 = Used
  owner: string;
  eventId: string;
  eventName: string;
  imageUrl: string;
}

export interface EventCounterData {
  objectId: string;
  minted: number;
}

export interface EventData {
  objectId: string;
  name: string;
  description: string;
  date: string;
  location: string;
  maxSupply: number;
  minted: number;
  price: number; // in SUI
  imageUrl: string;
}

export const TICKET_STATUS = {
  VALID: 0 as const,
  USED: 1 as const,
};

export const MAX_SUPPLY = 50;

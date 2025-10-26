// CHANGED: Updated to support ticket NFT system
// These will be populated after deploying the Move contract
export const DEVNET_COUNTER_PACKAGE_ID = import.meta.env.VITE_PACKAGE_ID || "0xTODO";
export const DEVNET_SUICKET_PACKAGE_ID = import.meta.env.VITE_PACKAGE_ID || "0xTODO";
export const TESTNET_SUICKET_PACKAGE_ID = "0xb39d59a6d0b23f40b192852852cc526385f77c27e6e7553c5a4e4b22d67c859d";
export const MAINNET_COUNTER_PACKAGE_ID = "0xTODO";
export const MAINNET_SUICKET_PACKAGE_ID = "0xTODO";

// Shared EventCounter object ID (set after deployment)
export const DEVNET_COUNTER_ID = import.meta.env.VITE_COUNTER_ID || "";
export const TESTNET_COUNTER_ID = "";
export const MAINNET_COUNTER_ID = "";

// Maximum ticket supply
export const MAX_SUPPLY = 50;

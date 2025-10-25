// CHANGED: Updated to support ticket NFT system
// These will be populated after deploying the Move contract
export const DEVNET_COUNTER_PACKAGE_ID = import.meta.env.VITE_PACKAGE_ID || "0xTODO";
export const TESTNET_SUICKET_PACKAGE_ID = "0x349027fd90cee4de6148900d6ad649e6813b9d13eada6405c9a6d72f8b12a4cd";
export const MAINNET_COUNTER_PACKAGE_ID = "0xTODO";

// Shared EventCounter object ID (set after deployment)
export const DEVNET_COUNTER_ID = import.meta.env.VITE_COUNTER_ID || "";
export const TESTNET_COUNTER_ID = "";
export const MAINNET_COUNTER_ID = "";

// Maximum ticket supply
export const MAX_SUPPLY = 50;

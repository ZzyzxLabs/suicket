// CHANGED: Updated to support ticket NFT system
// These will be populated after deploying the Move contract
export const DEVNET_COUNTER_PACKAGE_ID =
  import.meta.env.VITE_PACKAGE_ID || "0xTODO";
export const DEVNET_SUICKET_PACKAGE_ID =
  import.meta.env.VITE_PACKAGE_ID || "0xTODO";
export const TESTNET_SUICKET_PACKAGE_ID =
  "0x929f3a3d421ebb4af0859bf77f21fd7fbfbb131a7691d02076f3d797c378a1b1";
export const MAINNET_COUNTER_PACKAGE_ID = "0xTODO";
export const MAINNET_SUICKET_PACKAGE_ID = "0xTODO";

// Shared EventCounter object ID (set after deployment)
export const DEVNET_COUNTER_ID = import.meta.env.VITE_COUNTER_ID || "";
export const TESTNET_COUNTER_ID = "";
export const MAINNET_COUNTER_ID = "";

// Maximum ticket supply
export const MAX_SUPPLY = 50;

// CHANGED: Updated to support ticket NFT system
// These will be populated after deploying the Move contract
export const DEVNET_COUNTER_PACKAGE_ID =
  import.meta.env.VITE_PACKAGE_ID || "0xTODO";
export const DEVNET_SUICKET_PACKAGE_ID =
  import.meta.env.VITE_PACKAGE_ID || "0xTODO";
export const TESTNET_SUICKET_PACKAGE_ID =
  "0x8a30e1f335750591b9ad7c4a12f287e62f623e38faa6cec9ee857840b13af0eb";
export const MAINNET_COUNTER_PACKAGE_ID = "0xTODO";
export const MAINNET_SUICKET_PACKAGE_ID = "0xTODO";

// Shared EventCounter object ID (set after deployment)
export const DEVNET_COUNTER_ID = import.meta.env.VITE_COUNTER_ID || "";
export const TESTNET_COUNTER_ID = "";
export const MAINNET_COUNTER_ID = "";

// Maximum ticket supply
export const MAX_SUPPLY = 50;

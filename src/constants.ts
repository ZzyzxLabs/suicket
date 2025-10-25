// CHANGED: Updated to support ticket NFT system
// These will be populated after deploying the Move contract
export const DEVNET_COUNTER_PACKAGE_ID = import.meta.env.VITE_PACKAGE_ID || "0xTODO";
export const TESTNET_COUNTER_PACKAGE_ID = "0xcc1c038714632d823156064946e63665c056551a5796aaf0582789ed125a3e94";
export const MAINNET_COUNTER_PACKAGE_ID = "0xTODO";

// Shared EventCounter object ID (set after deployment)
export const DEVNET_COUNTER_ID = import.meta.env.VITE_COUNTER_ID || "";
export const TESTNET_COUNTER_ID = "";
export const MAINNET_COUNTER_ID = "";

// Maximum ticket supply
export const MAX_SUPPLY = 50;

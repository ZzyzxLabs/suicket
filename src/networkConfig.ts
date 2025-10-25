// CHANGED: Added counterId to network config for ticket system
import { getFullnodeUrl } from "@mysten/sui/client";
import {
  DEVNET_COUNTER_PACKAGE_ID,
  TESTNET_SUICKET_PACKAGE_ID,
  MAINNET_COUNTER_PACKAGE_ID,
  DEVNET_COUNTER_ID,
  TESTNET_COUNTER_ID,
  MAINNET_COUNTER_ID,
} from "./constants.ts";
import { createNetworkConfig } from "@mysten/dapp-kit";

const { networkConfig, useNetworkVariable, useNetworkVariables } =
  createNetworkConfig({
    devnet: {
      url: getFullnodeUrl("devnet"),
      variables: {
        counterPackageId: DEVNET_COUNTER_PACKAGE_ID,
        counterId: DEVNET_COUNTER_ID,
        graphqlUrl: "https://sui-devnet.mystenlabs.com/graphql",
      },
    },
    testnet: {
      url: getFullnodeUrl("testnet"),
      variables: {
        suicketPackageId: TESTNET_SUICKET_PACKAGE_ID,
        graphqlUrl: "https://graphql.testnet.sui.io/graphql",
      },
    },
    mainnet: {
      url: getFullnodeUrl("mainnet"),
      variables: {
        counterPackageId: MAINNET_COUNTER_PACKAGE_ID,
        counterId: MAINNET_COUNTER_ID,
        graphqlUrl: "https://sui-mainnet.mystenlabs.com/graphql",
      },
    },
  });

export { useNetworkVariable, useNetworkVariables, networkConfig };

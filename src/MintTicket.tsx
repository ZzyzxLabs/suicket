// CHANGED: New component for minting tickets
import { useState } from "react";
import {
  useCurrentAccount,
  useSignAndExecuteTransaction,
  useSuiClient,
  useSuiClientQuery,
} from "@mysten/dapp-kit";
import { Transaction } from "@mysten/sui/transactions";
import { Button, Container, Flex, Heading, Text, Card } from "@radix-ui/themes";
import { useNetworkVariable } from "./networkConfig";
import ClipLoader from "react-spinners/ClipLoader";
import { MAX_SUPPLY } from "./types";

export function MintTicket() {
  const counterPackageId = useNetworkVariable("counterPackageId");
  const counterId = useNetworkVariable("counterId");
  const suiClient = useSuiClient();
  const currentAccount = useCurrentAccount();
  const { mutate: signAndExecute } = useSignAndExecuteTransaction();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string>("");
  const [success, setSuccess] = useState<string>("");

  // Query the EventCounter to get minted count
  const { data: counterData, refetch } = useSuiClientQuery(
    "getObject",
    {
      id: counterId,
      options: {
        showContent: true,
      },
    },
    {
      enabled: !!counterId,
    }
  );

  // Extract minted count from counter data
  const getMintedCount = (): number => {
    if (!counterData?.data?.content) return 0;
    if (counterData.data.content.dataType !== "moveObject") return 0;
    const fields = counterData.data.content.fields as { minted: string };
    return parseInt(fields.minted, 10);
  };

  const mintedCount = getMintedCount();
  const remainingTickets = MAX_SUPPLY - mintedCount;

  const handleMint = () => {
    if (!currentAccount) {
      setError("Please connect your wallet first");
      return;
    }

    if (!counterId) {
      setError("Counter ID not configured. Please check your .env file");
      return;
    }

    setIsLoading(true);
    setError("");
    setSuccess("");

    const tx = new Transaction();

    // Call mint_ticket function
    tx.moveCall({
      arguments: [tx.object(counterId)],
      target: `${counterPackageId}::suicket::mint_ticket`,
    });

    signAndExecute(
      {
        transaction: tx,
      },
      {
        onSuccess: async (result) => {
          await suiClient.waitForTransaction({ digest: result.digest });
          setSuccess(`Ticket minted successfully! Digest: ${result.digest}`);
          setIsLoading(false);
          // Refetch counter to update UI
          refetch();
        },
        onError: (err) => {
          setError(`Transaction failed: ${err.message}`);
          setIsLoading(false);
        },
      }
    );
  };

  if (!counterId) {
    return (
      <Container>
        <Card>
          <Flex direction="column" gap="4" align="center" py="6">
            <Heading size="6">Configuration Required</Heading>
            <Text color="red">
              Please deploy the Move contract and set VITE_COUNTER_ID in your .env file
            </Text>
          </Flex>
        </Card>
      </Container>
    );
  }

  return (
    <Container>
      <Flex direction="column" gap="4" py="6">
        <Heading size="8" align="center">
          CalHacks 12.0 NFT Tickets
        </Heading>

        <Card>
          <Flex direction="column" gap="4" p="4">
            <Heading size="4">Mint Your Ticket</Heading>

            <Flex direction="column" gap="2">
              <Text size="6" weight="bold">
                {remainingTickets} / {MAX_SUPPLY} Tickets Remaining
              </Text>
              <Text size="2" color="gray">
                Each ticket is a unique NFT on the Sui blockchain
              </Text>
            </Flex>

            <Button
              size="3"
              onClick={handleMint}
              disabled={isLoading || remainingTickets <= 0 || !currentAccount}
              style={{ cursor: isLoading ? "wait" : "pointer" }}
            >
              {isLoading ? (
                <Flex align="center" gap="2">
                  <ClipLoader size={20} color="white" />
                  <Text>Minting...</Text>
                </Flex>
              ) : remainingTickets <= 0 ? (
                "Sold Out"
              ) : !currentAccount ? (
                "Connect Wallet First"
              ) : (
                "Mint Ticket"
              )}
            </Button>

            {success && (
              <Card style={{ backgroundColor: "var(--green-3)" }}>
                <Text color="green" size="2">
                  {success}
                </Text>
              </Card>
            )}

            {error && (
              <Card style={{ backgroundColor: "var(--red-3)" }}>
                <Text color="red" size="2">
                  {error}
                </Text>
              </Card>
            )}
          </Flex>
        </Card>

        <Card>
          <Flex direction="column" gap="2" p="4">
            <Heading size="3">How it works</Heading>
            <Text size="2">1. Connect your Sui wallet</Text>
            <Text size="2">2. Click "Mint Ticket" to receive your NFT</Text>
            <Text size="2">3. View your ticket in "My Tickets"</Text>
            <Text size="2">4. Scan QR code at the event for check-in</Text>
          </Flex>
        </Card>
      </Flex>
    </Container>
  );
}

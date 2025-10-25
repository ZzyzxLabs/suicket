// CHANGED: New component for minting tickets
import { useState } from "react";
import {
  useCurrentAccount,
  useSignAndExecuteTransaction,
  useSuiClient,
} from "@mysten/dapp-kit";
import { Transaction } from "@mysten/sui/transactions";
import { Button, Container, Flex, Heading, Text, Card, Grid, Badge } from "@radix-ui/themes";
import { useNetworkVariable } from "./networkConfig";
import ClipLoader from "react-spinners/ClipLoader";
import { EventData } from "./types";

// Hardcoded event placeholders - will be replaced with on-chain data later
const MOCK_EVENTS: EventData[] = [
  {
    objectId: "0x1", // placeholder
    name: "CalHacks 12.0",
    description: "UC Berkeley's premier hackathon. Join us for 36 hours of hacking, workshops, and fun!",
    date: "November 15-17, 2025",
    location: "UC Berkeley, CA",
    maxSupply: 500,
    minted: 247,
    price: 0, // Free event
    imageUrl: "https://via.placeholder.com/400x200/4A90E2/FFFFFF?text=CalHacks+12.0",
  },
  {
    objectId: "0x2",
    name: "Web3 Summit SF",
    description: "The largest Web3 conference in San Francisco. Learn about the latest in blockchain technology.",
    date: "December 1-3, 2025",
    location: "Moscone Center, SF",
    maxSupply: 1000,
    minted: 856,
    price: 0.5,
    imageUrl: "https://via.placeholder.com/400x200/9B59B6/FFFFFF?text=Web3+Summit",
  },
  {
    objectId: "0x3",
    name: "Sui Developer Meetup",
    description: "Monthly meetup for Sui developers. Network, share ideas, and build together.",
    date: "November 20, 2025",
    location: "Sui Foundation Office, Palo Alto",
    maxSupply: 50,
    minted: 12,
    price: 0,
    imageUrl: "https://via.placeholder.com/400x200/E74C3C/FFFFFF?text=Sui+Meetup",
  },
  {
    objectId: "0x4",
    name: "NFT Art Exhibition",
    description: "Exclusive NFT art showcase featuring top digital artists from around the world.",
    date: "January 10-12, 2026",
    location: "SFMOMA, San Francisco",
    maxSupply: 200,
    minted: 200,
    price: 1.0,
    imageUrl: "https://via.placeholder.com/400x200/F39C12/FFFFFF?text=NFT+Exhibition",
  },
];

export function MintTicket() {
  const counterPackageId = useNetworkVariable("counterPackageId");
  const counterId = useNetworkVariable("counterId");
  const suiClient = useSuiClient();
  const currentAccount = useCurrentAccount();
  const { mutate: signAndExecute } = useSignAndExecuteTransaction();
  const [mintingEventId, setMintingEventId] = useState<string>("");
  const [error, setError] = useState<string>("");
  const [success, setSuccess] = useState<string>("");

  // TODO: Replace with actual on-chain query
  // const { data, isPending, error } = useSuiClientQuery(...)
  const events = MOCK_EVENTS;

  const handleMint = (event: EventData) => {
    if (!currentAccount) {
      setError("Please connect your wallet first");
      return;
    }

    if (!counterId) {
      setError("Counter ID not configured. Please check your .env file");
      return;
    }

    setMintingEventId(event.objectId);
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
          setSuccess(`Ticket minted successfully for ${event.name}!`);
          setMintingEventId("");
          // TODO: Refetch events when using real on-chain data
        },
        onError: (err) => {
          setError(`Transaction failed: ${err.message}`);
          setMintingEventId("");
        },
      }
    );
  };

  return (
    <Container>
      <Flex direction="column" gap="4" py="6">
        <Heading size="8" align="center">
          Browse Events
        </Heading>

        <Text size="2" color="gray" align="center">
          Mint NFT tickets for upcoming events on the Sui blockchain
        </Text>

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

        <Grid columns={{ initial: "1", md: "2" }} gap="4">
          {events.map((event) => {
            const remainingTickets = event.maxSupply - event.minted;
            const isSoldOut = remainingTickets <= 0;
            const isMinting = mintingEventId === event.objectId;

            return (
              <Card key={event.objectId}>
                <Flex direction="column" gap="3">
                  {event.imageUrl && (
                    <img
                      src={event.imageUrl}
                      alt={event.name}
                      style={{
                        width: "100%",
                        height: "200px",
                        objectFit: "cover",
                        borderRadius: "var(--radius-3)",
                      }}
                    />
                  )}

                  <Flex direction="column" gap="3" p="4">
                    <Flex justify="between" align="start">
                      <Heading size="5">{event.name}</Heading>
                      <Badge color={isSoldOut ? "red" : "green"} size="2">
                        {isSoldOut ? "Sold Out" : `${remainingTickets} left`}
                      </Badge>
                    </Flex>

                    <Text size="2" color="gray">
                      {event.description}
                    </Text>

                    <Flex direction="column" gap="1">
                      <Text size="2" weight="bold">
                        📅 {event.date}
                      </Text>
                      <Text size="2" weight="bold">
                        📍 {event.location}
                      </Text>
                      <Text size="2" weight="bold">
                        💰 {event.price === 0 ? "Free" : `${event.price} SUI`}
                      </Text>
                    </Flex>

                    <Flex direction="column" gap="1">
                      <Text size="1" color="gray">
                        {event.minted} / {event.maxSupply} tickets minted
                      </Text>
                    </Flex>

                    <Button
                      size="3"
                      onClick={() => handleMint(event)}
                      disabled={isMinting || isSoldOut || !currentAccount}
                      style={{ cursor: isMinting ? "wait" : "pointer" }}
                    >
                      {isMinting ? (
                        <Flex align="center" gap="2">
                          <ClipLoader size={20} color="white" />
                          <Text>Minting...</Text>
                        </Flex>
                      ) : isSoldOut ? (
                        "Sold Out"
                      ) : !currentAccount ? (
                        "Connect Wallet First"
                      ) : (
                        `Mint Ticket${event.price > 0 ? ` (${event.price} SUI)` : ""}`
                      )}
                    </Button>
                  </Flex>
                </Flex>
              </Card>
            );
          })}
        </Grid>

        <Card>
          <Flex direction="column" gap="2" p="4">
            <Heading size="3">How it works</Heading>
            <Text size="2">1. Connect your Sui wallet</Text>
            <Text size="2">2. Browse events and click "Mint Ticket"</Text>
            <Text size="2">3. View your tickets in "My Tickets"</Text>
            <Text size="2">4. Scan QR code at the event for check-in</Text>
          </Flex>
        </Card>
      </Flex>
    </Container>
  );
}

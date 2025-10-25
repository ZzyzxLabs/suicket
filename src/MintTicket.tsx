// CHANGED: New component for minting tickets
import { useState, useEffect } from "react";
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
import { SuiGraphQLClient } from "@mysten/sui/graphql";
import { graphql } from "@mysten/sui/graphql/schemas/2024.4";

interface EventNode {
  address: string;
  asMoveObject: {
    contents: {
      json: any;
    };
  };
}

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
    imageUrl: "https://www.calhacks.io/_next/image?url=%2F_next%2Fstatic%2Fmedia%2Fvenue.23cd35e2.png&w=1920&q=75&dpl=dpl_DaRXX3rkH31BWwSqUuqF3A6SN4Lr",
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
    imageUrl: "data:image/webp;base64,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",
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
    imageUrl: "https://aggregator.walrus-testnet.walrus.space/v1/blobs/TaHm0PAkMCjuVRplHtLZiLNR5p2-PuS9ahPxVXTJUKQ",
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
    imageUrl: "https://aggregator.walrus-testnet.walrus.space/v1/blobs/93ai28-CcxctOY7P-Y57YV-nGkmQXh9svMfhpIuyOT4",
  },
];

export function MintTicket() {
  const graphqlUrl = useNetworkVariable("graphqlUrl");
  const suicketPackageId = useNetworkVariable("suicketPackageId");
  const suiClient = useSuiClient();
  const currentAccount = useCurrentAccount();
  const { mutate: signAndExecute } = useSignAndExecuteTransaction();

  const [events, setEvents] = useState<EventData[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [mintingEventId, setMintingEventId] = useState<string>("");
  const [success, setSuccess] = useState<string>("");

  const fetchEvents = async () => {
    try {
      const client = new SuiGraphQLClient({ url: graphqlUrl });

      const query = graphql(`
        query GetEvents($type: String!) {
          objects(filter: { type: $type }) {
            nodes {
              address
              asMoveObject {
                contents {
                  json
                }
              }
            }
          }
        }
      `);

      const result = await client.query({
        query,
        variables: {
          type: `${suicketPackageId}::main::Event`,
        },
      });

      console.log("GraphQL Query Result:", result);
      console.log("Objects data:", result.data?.objects);
      console.log("Nodes:", result.data?.objects?.nodes);

      if (result.data?.objects) {
        const nodes = result.data.objects.nodes as EventNode[];
        console.log("Parsed nodes:", nodes);

        const parsedEvents: EventData[] = nodes
          .map((node) => {
            const json = node.asMoveObject?.contents?.json;
            console.log("Processing node:", node.address);
            console.log("JSON contents:", json);

            if (!json) {
              console.log("No JSON found for node:", node.address);
              return null;
            }

            const event = {
              objectId: node.address,
              name: json.event_name || "",
              description: json.event_description || "",
              date: "", // Not in the current schema
              location: "", // Not in the current schema
              maxSupply: parseInt(json.max_ticket_supply || "0", 10),
              minted: parseInt(json.ticket_sold || "0", 10),
              price: parseFloat(json.price || "0") / 1_000_000_000, // Convert MIST to SUI
              imageUrl: json.image_url || "",
            };

            console.log("Parsed event:", event);
            return event;
          })
          .filter((e): e is EventData => e !== null);

        console.log("Final parsed events:", parsedEvents);
        console.log("Using mock events?", parsedEvents.length === 0);

        setEvents(parsedEvents.length > 0 ? parsedEvents : MOCK_EVENTS);
      } else {
        setEvents(MOCK_EVENTS);
      }

      setError(null);
    } catch (err) {
      console.error("Error fetching events:", err);
      setError(err instanceof Error ? err.message : "Failed to load events");
      setEvents(MOCK_EVENTS); // Fallback to mock events on error
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchEvents();
  }, [graphqlUrl, suicketPackageId]);

  const handleMint = (event: EventData) => {
    if (!currentAccount) {
      setError("Please connect your wallet first");
      return;
    }

    // if (!counterId) {
    //   setError("Counter ID not configured. Please check your .env file");
    //   return;
    // }

    setMintingEventId(event.objectId);
    setError("");
    setSuccess("");

    const tx = new Transaction();

    // Call mint_ticket function
    tx.moveCall({
      target: `${suicketPackageId}::main::buy_ticket`,
      arguments: [tx.object(event.objectId)],
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

  if (loading) {
    return (
      <Container>
        <Flex justify="center" align="center" py="9">
          <ClipLoader size={50} />
        </Flex>
      </Container>
    );
  }

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

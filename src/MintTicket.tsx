// CHANGED: New component for minting tickets
import { useState, useEffect } from "react";
import {
  useCurrentAccount,
  useSignAndExecuteTransaction,
  useSuiClient,
} from "@mysten/dapp-kit";
import { coinWithBalance, Transaction, Inputs } from "@mysten/sui/transactions";
import { ZkSendLinkBuilder } from "@mysten/zksend";

import {
  Button,
  Container,
  Flex,
  Heading,
  Text,
  Card,
  Grid,
} from "@radix-ui/themes";
import { useNetworkVariable } from "./networkConfig";
import ClipLoader from "react-spinners/ClipLoader";
import { EventData } from "./types";
import { SuiGraphQLClient } from "@mysten/sui/graphql";
import { graphql } from "@mysten/sui/graphql/schemas/2024.4";
import {
  Calendar,
  MapPin,
  DollarSign,
  Ticket,
  CheckCircle2,
  AlertCircle,
  Info,
  XCircle,
  Wallet
} from "lucide-react";

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
    description:
      "UC Berkeley's premier hackathon. Join us for 36 hours of hacking, workshops, and fun!",
    date: "November 15-17, 2025",
    location: "UC Berkeley, CA",
    maxSupply: 500,
    minted: 247,
    price: 0, // Free event
    imageUrl:
      "https://www.calhacks.io/_next/image?url=%2F_next%2Fstatic%2Fmedia%2Fvenue.23cd35e2.png&w=1920&q=75&dpl=dpl_DaRXX3rkH31BWwSqUuqF3A6SN4Lr",
  },
  {
    objectId: "0x2",
    name: "Web3 Summit SF",
    description:
      "The largest Web3 conference in San Francisco. Learn about the latest in blockchain technology.",
    date: "December 1-3, 2025",
    location: "Moscone Center, SF",
    maxSupply: 1000,
    minted: 856,
    price: 0.5,
    imageUrl:
      "data:image/webp;base64,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",
  },
  {
    objectId: "0x3",
    name: "Sui Developer Meetup",
    description:
      "Monthly meetup for Sui developers. Network, share ideas, and build together.",
    date: "November 20, 2025",
    location: "Sui Foundation Office, Palo Alto",
    maxSupply: 50,
    minted: 12,
    price: 0,
    imageUrl:
      "https://aggregator.walrus-testnet.walrus.space/v1/blobs/TaHm0PAkMCjuVRplHtLZiLNR5p2-PuS9ahPxVXTJUKQ",
  },
  {
    objectId: "0x4",
    name: "NFT Art Exhibition",
    description:
      "Exclusive NFT art showcase featuring top digital artists from around the world.",
    date: "January 10-12, 2026",
    location: "SFMOMA, San Francisco",
    maxSupply: 200,
    minted: 200,
    price: 1.0,
    imageUrl:
      "https://aggregator.walrus-testnet.walrus.space/v1/blobs/93ai28-CcxctOY7P-Y57YV-nGkmQXh9svMfhpIuyOT4",
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

  const handleMint = async (event: EventData) => {
    if (!currentAccount) {
      setError("Please connect your wallet first");
      return;
    }

    try {
      const tx = new Transaction();

      const [coin] = tx.splitCoins(tx.gas, [
        tx.pure("u64", event.price * 1_000_000_000),
      ]);

      const [ticket] = tx.moveCall({
        target: `${suicketPackageId}::main::buy_ticket`,
        arguments: [coin, tx.object(event.objectId)],
      });

      tx.transferObjects([ticket], currentAccount.address);

      signAndExecute(
        {
          transaction: tx,
        },
        {
          onSuccess: async (result) => {
            await suiClient.waitForTransaction({ digest: result.digest });
            setSuccess(`Ticket minted successfully for ${event.name}!`);
            setMintingEventId("");
          },
          onError: (err) => {
            setError(`Transaction failed: ${err.message}`);
            setMintingEventId("");
          },
        },
      );
    } catch (err: any) {
      setError(`Failed to prepare transaction: ${err.message}`);
      setMintingEventId("");
    }
  };

  const buyMultipleTickets = async (
    event: EventData,
    quantity: number,
    emails: string[],
  ) => {
    if (quantity > event.maxSupply || quantity !== emails.length) {
      setError("Invalid input");
      return;
    }

    try {
      const tx = new Transaction();
      const totalPrice = event.price * quantity * 1_000_000_000; // Convert to MIST

      const [coin] = tx.splitCoins(tx.gas, [tx.pure("u64", totalPrice)]);

      // Call buy_ticket multiple times in a single transaction
      const links = [];
      for (let i = 0; i < quantity; i++) {
        const link = new ZkSendLinkBuilder({
          sender: currentAccount?.address ?? "",
          network: "testnet",
        });
        let ticket = tx.moveCall({
          target: `${suicketPackageId}::main::buy_ticket`,
          arguments: [coin, tx.object(event.objectId)],
        });

        link.addClaimableObjectRef(ticket, `${suicketPackageId}::main::Ticket`);
        await link.createSendTransaction({
          transaction: tx,
        });
        links.push(link);
      }

      const urls = links.map((link) => link.getLink());
      console.log(urls);

      signAndExecute(
        {
          transaction: tx,
        },
        {
          onSuccess: async (result) => {
            await suiClient.waitForTransaction({ digest: result.digest });
            setSuccess(
              `${quantity} tickets minted successfully for ${event.name}!`,
            );
            setMintingEventId("");
          },
          onError: (err) => {
            setError(`Transaction failed: ${err.message}`);
            setMintingEventId("");
          },
        },
      );
    } catch (err: any) {
      setError(`Failed to prepare transaction: ${err.message}`);
      setMintingEventId("");
    }
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
          <Card
            className="suicket-fade-in"
            style={{
              backgroundColor: "var(--suicket-success-50)",
              border: "1px solid var(--suicket-success-300)",
              boxShadow: "var(--suicket-shadow-md)",
            }}
          >
            <Flex align="center" gap="2">
              <CheckCircle2 size={16} style={{ color: "var(--suicket-success-600)" }} />
              <Text style={{ color: "var(--suicket-success-700)" }} size="2" weight="medium">
                {success}
              </Text>
            </Flex>
          </Card>
        )}

        {error && (
          <Card
            className="suicket-fade-in"
            style={{
              backgroundColor: "var(--suicket-error-50)",
              border: "1px solid var(--suicket-error-300)",
              boxShadow: "var(--suicket-shadow-md)",
            }}
          >
            <Flex align="center" gap="2">
              <AlertCircle size={16} style={{ color: "var(--suicket-error-600)" }} />
              <Text style={{ color: "var(--suicket-error-700)" }} size="2" weight="medium">
                {error}
              </Text>
            </Flex>
          </Card>
        )}

        <Grid
          columns={{ initial: "1", sm: "1", md: "2", lg: "2", xl: "3" }}
          gap={{ initial: "3", md: "4" }}
          style={{ width: "100%" }}
        >
          {events.map((event) => {
            const remainingTickets = event.maxSupply - event.minted;
            const isSoldOut = remainingTickets <= 0;
            const isMinting = mintingEventId === event.objectId;

            return (
              <Card
                key={event.objectId}
                className="suicket-card-hover suicket-fade-in"
                style={{
                  background: "var(--suicket-bg-primary)",
                  border: "none",
                  boxShadow: "var(--suicket-shadow-lg)",
                  overflow: "hidden",
                  position: "relative",
                }}
              >
                <Flex direction="column" gap="0">
                  {/* Image with Gradient Overlay */}
                  {event.imageUrl && (
                    <div
                      style={{
                        width: "100%",
                        height: "clamp(180px, 40vw, 240px)",
                        overflow: "hidden",
                        position: "relative",
                      }}
                    >
                      <img
                        src={event.imageUrl}
                        alt={event.name}
                        style={{
                          width: "100%",
                          height: "100%",
                          objectFit: "cover",
                        }}
                      />
                      {/* Gradient overlay for better text contrast */}
                      <div
                        style={{
                          position: "absolute",
                          bottom: 0,
                          left: 0,
                          right: 0,
                          height: "50%",
                          background: "linear-gradient(to top, rgba(0,0,0,0.6), transparent)",
                          pointerEvents: "none",
                        }}
                      />
                      {/* Sold out badge */}
                      {isSoldOut && (
                        <div
                          style={{
                            position: "absolute",
                            top: "16px",
                            right: "16px",
                            background: "var(--suicket-error-500)",
                            color: "white",
                            padding: "8px 20px",
                            borderRadius: "var(--suicket-radius-full)",
                            fontWeight: "700",
                            fontSize: "0.875rem",
                            boxShadow: "0 4px 12px rgba(239, 68, 68, 0.4)",
                            letterSpacing: "0.05em",
                          }}
                        >
                          SOLD OUT
                        </div>
                      )}
                      {/* Ticket count badge on image */}
                      {!isSoldOut && (
                        <div
                          style={{
                            position: "absolute",
                            top: "16px",
                            right: "16px",
                            background: remainingTickets <= 10
                              ? "var(--suicket-warning-500)"
                              : "var(--suicket-success-500)",
                            color: "white",
                            padding: "6px 14px",
                            borderRadius: "var(--suicket-radius-full)",
                            fontWeight: "700",
                            fontSize: "0.75rem",
                            boxShadow: "var(--suicket-shadow-md)",
                            display: "flex",
                            alignItems: "center",
                            gap: "4px",
                          }}
                        >
                          <Ticket size={14} />
                          <span>{remainingTickets} left</span>
                        </div>
                      )}
                    </div>
                  )}

                  {/* Ticket stub design accent */}
                  <div
                    style={{
                      height: "8px",
                      background: isSoldOut
                        ? "var(--suicket-neutral-300)"
                        : "var(--suicket-gradient-primary)",
                    }}
                  />

                  <Flex direction="column" gap="4" p="5">
                    {/* Title Section */}
                    <div>
                      <Heading
                        size="6"
                        style={{
                          color: "var(--suicket-text-primary)",
                          fontWeight: "700",
                          letterSpacing: "-0.02em",
                          marginBottom: "8px",
                          lineHeight: "1.2",
                        }}
                      >
                        {event.name}
                      </Heading>
                      <Text
                        size="2"
                        style={{
                          color: "var(--suicket-text-secondary)",
                          lineHeight: "1.6",
                          display: "-webkit-box",
                          WebkitLineClamp: "2",
                          WebkitBoxOrient: "vertical",
                          overflow: "hidden",
                        }}
                      >
                        {event.description}
                      </Text>
                    </div>

                    {/* Event Metadata */}
                    {(event.date || event.location) && (
                      <Flex
                        direction="column"
                        gap="2"
                        p="3"
                        style={{
                          background: "var(--suicket-bg-secondary)",
                          borderRadius: "var(--suicket-radius-md)",
                          border: "1px solid var(--suicket-border-light)",
                        }}
                      >
                        {event.date && (
                          <Flex align="center" gap="3">
                            <div
                              style={{
                                display: "flex",
                                alignItems: "center",
                                justifyContent: "center",
                                width: "32px",
                                height: "32px",
                                borderRadius: "var(--suicket-radius-sm)",
                                background: "var(--suicket-primary-100)",
                              }}
                            >
                              <Calendar size={16} style={{ color: "var(--suicket-primary-600)" }} />
                            </div>
                            <Text size="2" weight="medium" style={{ color: "var(--suicket-text-primary)" }}>
                              {event.date}
                            </Text>
                          </Flex>
                        )}
                        {event.location && (
                          <Flex align="center" gap="3">
                            <div
                              style={{
                                display: "flex",
                                alignItems: "center",
                                justifyContent: "center",
                                width: "32px",
                                height: "32px",
                                borderRadius: "var(--suicket-radius-sm)",
                                background: "var(--suicket-accent-100)",
                              }}
                            >
                              <MapPin size={16} style={{ color: "var(--suicket-accent-600)" }} />
                            </div>
                            <Text size="2" weight="medium" style={{ color: "var(--suicket-text-primary)" }}>
                              {event.location}
                            </Text>
                          </Flex>
                        )}
                      </Flex>
                    )}

                    {/* Divider */}
                    <div style={{ height: "1px", background: "var(--suicket-border-light)" }} />

                    {/* Price and Stats */}
                    <Flex justify="between" align="center">
                      <div>
                        <Text
                          size="1"
                          weight="medium"
                          style={{
                            color: "var(--suicket-text-tertiary)",
                            textTransform: "uppercase",
                            letterSpacing: "0.05em",
                            marginBottom: "4px",
                            display: "block",
                          }}
                        >
                          Price
                        </Text>
                        <Flex align="center" gap="2">
                          <DollarSign
                            size={20}
                            style={{
                              color: event.price === 0 ? "var(--suicket-success-600)" : "var(--suicket-primary-600)",
                            }}
                          />
                          <Text
                            size="5"
                            weight="bold"
                            style={{
                              color: event.price === 0 ? "var(--suicket-success-600)" : "var(--suicket-primary-600)",
                              letterSpacing: "-0.01em",
                            }}
                          >
                            {event.price === 0 ? "FREE" : `${event.price} SUI`}
                          </Text>
                        </Flex>
                      </div>
                      <div style={{ textAlign: "right" }}>
                        <Text
                          size="1"
                          weight="medium"
                          style={{
                            color: "var(--suicket-text-tertiary)",
                            textTransform: "uppercase",
                            letterSpacing: "0.05em",
                            marginBottom: "4px",
                            display: "block",
                          }}
                        >
                          Tickets Sold
                        </Text>
                        <Flex align="center" gap="2" justify="end">
                          <Ticket size={16} style={{ color: "var(--suicket-accent-600)" }} />
                          <Text
                            size="4"
                            weight="bold"
                            style={{ color: "var(--suicket-text-primary)", fontFamily: "var(--font-mono)" }}
                          >
                            {event.minted} / {event.maxSupply}
                          </Text>
                        </Flex>
                      </div>
                    </Flex>

                    {/* Enhanced Progress Bar */}
                    <div>
                      <Flex justify="between" align="center" mb="2">
                        <Text size="1" weight="medium" style={{ color: "var(--suicket-text-tertiary)" }}>
                          Progress
                        </Text>
                        <Text
                          size="1"
                          weight="bold"
                          style={{
                            color: isSoldOut
                              ? "var(--suicket-error-600)"
                              : remainingTickets <= 10
                              ? "var(--suicket-warning-600)"
                              : "var(--suicket-success-600)",
                          }}
                        >
                          {Math.round((event.minted / event.maxSupply) * 100)}%
                        </Text>
                      </Flex>
                      <div
                        style={{
                          width: "100%",
                          height: "8px",
                          background: "var(--suicket-neutral-200)",
                          borderRadius: "var(--suicket-radius-full)",
                          overflow: "hidden",
                          position: "relative",
                        }}
                      >
                        <div
                          style={{
                            width: `${(event.minted / event.maxSupply) * 100}%`,
                            height: "100%",
                            background: isSoldOut
                              ? "var(--suicket-error-500)"
                              : remainingTickets <= 10
                              ? "var(--suicket-gradient-accent)"
                              : "var(--suicket-gradient-primary)",
                            borderRadius: "var(--suicket-radius-full)",
                            transition: "width var(--suicket-transition-slow)",
                            position: "relative",
                            overflow: "hidden",
                          }}
                        >
                          {/* Shimmer effect */}
                          <div
                            style={{
                              position: "absolute",
                              top: 0,
                              left: 0,
                              right: 0,
                              bottom: 0,
                              background: "linear-gradient(90deg, transparent, rgba(255, 255, 255, 0.3), transparent)",
                              animation: "shimmer 2s infinite",
                            }}
                          />
                        </div>
                      </div>
                    </div>

                    {/* CTA Button */}
                    <Button
                      size="4"
                      onClick={() => handleMint(event)}
                      disabled={isMinting || isSoldOut || !currentAccount}
                      style={{
                        cursor: isMinting ? "wait" : "pointer",
                        background: isSoldOut
                          ? "var(--suicket-neutral-400)"
                          : !currentAccount
                          ? "var(--suicket-neutral-500)"
                          : "var(--suicket-gradient-primary)",
                        color: "white",
                        border: "none",
                        fontWeight: "700",
                        fontSize: "1rem",
                        boxShadow: !isSoldOut && currentAccount ? "var(--suicket-shadow-blue)" : "none",
                        transition: "all var(--suicket-transition-fast)",
                        letterSpacing: "0.02em",
                      }}
                    >
                      {isMinting ? (
                        <Flex align="center" gap="2">
                          <ClipLoader size={20} color="white" />
                          <Text>Processing...</Text>
                        </Flex>
                      ) : isSoldOut ? (
                        <Flex align="center" gap="2">
                          <XCircle size={20} />
                          <Text>Sold Out</Text>
                        </Flex>
                      ) : !currentAccount ? (
                        <Flex align="center" gap="2">
                          <Wallet size={20} />
                          <Text>Connect Wallet</Text>
                        </Flex>
                      ) : (
                        <Flex align="center" gap="2">
                          <Ticket size={20} />
                          <Text>
                            {event.price > 0 ? `Buy for ${event.price} SUI` : "Get Free Ticket"}
                          </Text>
                        </Flex>
                      )}
                    </Button>
                  </Flex>
                </Flex>
              </Card>
            );
          })}
        </Grid>

        <Card
          style={{
            background: "var(--suicket-bg-primary)",
            border: "2px solid var(--suicket-primary-300)",
            boxShadow: "var(--suicket-shadow-md)",
          }}
        >
          <Flex direction="column" gap="4" p="5">
            <Flex align="center" gap="2">
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  width: "40px",
                  height: "40px",
                  borderRadius: "var(--suicket-radius-md)",
                  background: "var(--suicket-primary-100)",
                }}
              >
                <Info size={20} style={{ color: "var(--suicket-primary-600)" }} />
              </div>
              <Heading size="5" style={{ color: "var(--suicket-text-primary)", fontWeight: "700" }}>
                How it works
              </Heading>
            </Flex>
            <Flex direction="column" gap="3">
              <Flex align="start" gap="3">
                <div
                  style={{
                    minWidth: "28px",
                    height: "28px",
                    borderRadius: "var(--suicket-radius-full)",
                    background: "var(--suicket-primary-500)",
                    color: "white",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    fontWeight: "700",
                    fontSize: "0.875rem",
                  }}
                >
                  1
                </div>
                <Text size="3" weight="medium" style={{ color: "var(--suicket-text-primary)", paddingTop: "2px" }}>
                  Connect your Sui wallet
                </Text>
              </Flex>
              <Flex align="start" gap="3">
                <div
                  style={{
                    minWidth: "28px",
                    height: "28px",
                    borderRadius: "var(--suicket-radius-full)",
                    background: "var(--suicket-primary-500)",
                    color: "white",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    fontWeight: "700",
                    fontSize: "0.875rem",
                  }}
                >
                  2
                </div>
                <Text size="3" weight="medium" style={{ color: "var(--suicket-text-primary)", paddingTop: "2px" }}>
                  Browse events and click "Buy Ticket"
                </Text>
              </Flex>
              <Flex align="start" gap="3">
                <div
                  style={{
                    minWidth: "28px",
                    height: "28px",
                    borderRadius: "var(--suicket-radius-full)",
                    background: "var(--suicket-primary-500)",
                    color: "white",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    fontWeight: "700",
                    fontSize: "0.875rem",
                  }}
                >
                  3
                </div>
                <Text size="3" weight="medium" style={{ color: "var(--suicket-text-primary)", paddingTop: "2px" }}>
                  View your tickets in "My Tickets"
                </Text>
              </Flex>
              <Flex align="start" gap="3">
                <div
                  style={{
                    minWidth: "28px",
                    height: "28px",
                    borderRadius: "var(--suicket-radius-full)",
                    background: "var(--suicket-primary-500)",
                    color: "white",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    fontWeight: "700",
                    fontSize: "0.875rem",
                  }}
                >
                  4
                </div>
                <Text size="3" weight="medium" style={{ color: "var(--suicket-text-primary)", paddingTop: "2px" }}>
                  Scan QR code at the event for check-in
                </Text>
              </Flex>
            </Flex>
          </Flex>
        </Card>
      </Flex>
    </Container>
  );
}

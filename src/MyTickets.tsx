// CHANGED: New component for displaying owned tickets
import { useState } from "react";
import {
  useCurrentAccount,
  useSignAndExecuteTransaction,
  useSuiClient,
  useSuiClientQuery,
} from "@mysten/dapp-kit";
import { Transaction } from "@mysten/sui/transactions";
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
import { TicketData, TICKET_STATUS } from "./types";
import {
  Ticket,
  CheckCircle2,
  XCircle,
  AlertCircle,
  RefreshCw,
  Wallet,
  Hash,
  ExternalLink
} from "lucide-react";

export function MyTickets() {
  const suicketPackageId = useNetworkVariable("suicketPackageId");
  const suiClient = useSuiClient();
  const currentAccount = useCurrentAccount();
  const { mutate: signAndExecute } = useSignAndExecuteTransaction();
  const [loadingTicketId, setLoadingTicketId] = useState<string>("");
  const [actionError, setActionError] = useState<string>("");

  // Use the query hook to fetch tickets
  const { data, isPending, error, refetch } = useSuiClientQuery(
    "getOwnedObjects",
    {
      owner: currentAccount?.address!,
      filter: {
        StructType: `${suicketPackageId}::main::Ticket`,
      },
      options: {
        showContent: true,
        showType: true,
      },
    },
    {
      enabled: !!currentAccount?.address,
    }
  );

  console.log("Tickets query data:", data);
  console.log("Tickets data array:", data?.data);

  // Parse ticket data
  const tickets: TicketData[] =
    data?.data
      .map((item) => {
        console.log("Processing ticket item:", item);
        console.log("Item content:", item.data?.content);

        if (!item.data?.content || item.data.content.dataType !== "moveObject") {
          console.log("No valid content for item:", item.data?.objectId);
          return null;
        }

        const fields = item.data.content.fields as any;
        console.log("Ticket fields:", fields);

        const ticket = {
          objectId: item.data.objectId,
          ticketNumber: parseInt(fields.ticket_number || "0", 10),
          status: (fields.status || 0) as 0 | 1,
          owner: fields.owner || "",
          eventId: fields.event_id || "",
          eventName: fields.event_name || "",
          imageUrl: fields.image_url || "",
        };

        console.log("Parsed ticket:", ticket);
        return ticket;
      })
      .filter((t): t is TicketData => t !== null) || [];

  console.log("Final tickets array:", tickets);

  const handleUseTicket = (ticketId: string) => {
    setLoadingTicketId(ticketId);
    setActionError("");

    const tx = new Transaction();

    // Call use_ticket function
    tx.moveCall({
      arguments: [tx.object(ticketId)],
      target: `${suicketPackageId}::main::use_ticket`,
    });

    signAndExecute(
      {
        transaction: tx,
      },
      {
        onSuccess: async (result) => {
          await suiClient.waitForTransaction({ digest: result.digest });
          setLoadingTicketId("");
          // Refresh tickets
          refetch();
        },
        onError: (err) => {
          setActionError(`Failed to mark as used: ${err.message}`);
          setLoadingTicketId("");
        },
      }
    );
  };

  if (!currentAccount) {
    return (
      <Container>
        <Card
          style={{
            background: "var(--suicket-bg-primary)",
            border: "1px solid var(--suicket-border-light)",
          }}
        >
          <Flex direction="column" gap="4" align="center" py="8">
            <Wallet size={48} style={{ color: "var(--suicket-primary-500)" }} />
            <Heading size="6" style={{ color: "var(--suicket-text-primary)" }}>
              Please Connect Your Wallet
            </Heading>
            <Text style={{ color: "var(--suicket-text-secondary)" }}>
              You need to connect your wallet to view your tickets
            </Text>
          </Flex>
        </Card>
      </Container>
    );
  }

  if (isPending) {
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
          My Tickets
        </Heading>

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
                Error loading tickets: {error.message}
              </Text>
            </Flex>
          </Card>
        )}

        {actionError && (
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
                {actionError}
              </Text>
            </Flex>
          </Card>
        )}

        {tickets.length === 0 ? (
          <Card
            style={{
              background: "var(--suicket-bg-primary)",
              border: "1px solid var(--suicket-border-light)",
            }}
          >
            <Flex direction="column" gap="4" align="center" py="8">
              <Ticket size={48} style={{ color: "var(--suicket-neutral-400)" }} />
              <Heading size="4" style={{ color: "var(--suicket-text-primary)" }}>
                No Tickets Yet
              </Heading>
              <Text style={{ color: "var(--suicket-text-secondary)" }}>
                Go to the Buy Tickets page to get your first ticket!
              </Text>
            </Flex>
          </Card>
        ) : (
          <Grid
            columns={{ initial: "1", sm: "1", md: "2", lg: "3" }}
            gap={{ initial: "4", md: "5" }}
            style={{ width: "100%" }}
          >
            {tickets.map((ticket) => (
              <Card
                key={ticket.objectId}
                className="suicket-card-hover suicket-fade-in"
                style={{
                  background: "var(--suicket-bg-primary)",
                  border: "none",
                  boxShadow: ticket.status === TICKET_STATUS.VALID
                    ? "0 8px 24px rgba(14, 165, 233, 0.15)"
                    : "0 4px 12px rgba(0, 0, 0, 0.1)",
                  overflow: "hidden",
                  position: "relative",
                }}
              >
                {/* Ticket Header with Gradient */}
                <div
                  style={{
                    height: "8px",
                    background: ticket.status === TICKET_STATUS.VALID
                      ? "var(--suicket-gradient-primary)"
                      : "var(--suicket-neutral-400)",
                  }}
                />

                <Flex direction="column" gap="0">
                  {/* Event Image */}
                  {ticket.imageUrl && (
                    <div
                      style={{
                        width: "100%",
                        height: "200px",
                        overflow: "hidden",
                        position: "relative",
                      }}
                    >
                      <img
                        src={ticket.imageUrl}
                        alt={ticket.eventName}
                        style={{
                          width: "100%",
                          height: "100%",
                          objectFit: "cover",
                          filter: ticket.status === TICKET_STATUS.VALID ? "none" : "grayscale(100%)",
                        }}
                      />
                      {/* Gradient Overlay */}
                      <div
                        style={{
                          position: "absolute",
                          bottom: 0,
                          left: 0,
                          right: 0,
                          height: "60%",
                          background: "linear-gradient(to top, rgba(0,0,0,0.8), transparent)",
                        }}
                      />
                      {/* Status Badge */}
                      <Flex
                        align="center"
                        gap="2"
                        style={{
                          position: "absolute",
                          top: "16px",
                          right: "16px",
                          background: ticket.status === TICKET_STATUS.VALID
                            ? "var(--suicket-success-500)"
                            : "var(--suicket-neutral-700)",
                          color: "white",
                          padding: "8px 16px",
                          borderRadius: "var(--suicket-radius-full)",
                          fontWeight: "700",
                          fontSize: "0.875rem",
                          boxShadow: "0 4px 12px rgba(0, 0, 0, 0.3)",
                          letterSpacing: "0.05em",
                        }}
                      >
                        {ticket.status === TICKET_STATUS.VALID ? (
                          <>
                            <CheckCircle2 size={16} />
                            <span>VALID</span>
                          </>
                        ) : (
                          <>
                            <XCircle size={16} />
                            <span>USED</span>
                          </>
                        )}
                      </Flex>
                    </div>
                  )}

                  {/* Ticket Content */}
                  <Flex direction="column" gap="4" p="5">
                    {/* Event Name & Ticket Number */}
                    <Flex direction="column" gap="2">
                      <Heading
                        size="6"
                        style={{
                          color: "var(--suicket-text-primary)",
                          fontWeight: "700",
                          letterSpacing: "-0.02em",
                          lineHeight: "1.2",
                        }}
                      >
                        {ticket.eventName}
                      </Heading>
                      <Flex align="center" gap="2">
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
                          <Hash size={16} style={{ color: "var(--suicket-primary-600)" }} />
                        </div>
                        <Text
                          size="3"
                          weight="bold"
                          style={{
                            color: "var(--suicket-primary-600)",
                            fontFamily: "var(--font-mono)",
                          }}
                        >
                          Ticket #{ticket.ticketNumber}
                        </Text>
                      </Flex>
                    </Flex>

                    {/* Ticket Object ID */}
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
                      <Flex align="center" justify="between">
                        <Text
                          size="1"
                          weight="medium"
                          style={{
                            color: "var(--suicket-text-tertiary)",
                            textTransform: "uppercase",
                            letterSpacing: "0.05em",
                          }}
                        >
                          Ticket ID
                        </Text>
                        <a
                          href={`https://suiscan.xyz/testnet/object/${ticket.objectId}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          style={{
                            display: "flex",
                            alignItems: "center",
                            gap: "4px",
                            color: "var(--suicket-primary-600)",
                            textDecoration: "none",
                            fontSize: "0.75rem",
                            fontWeight: "500",
                          }}
                        >
                          <span>View</span>
                          <ExternalLink size={12} />
                        </a>
                      </Flex>
                      <Text
                        size="2"
                        style={{
                          color: "var(--suicket-text-secondary)",
                          wordBreak: "break-all",
                          fontFamily: "var(--font-mono)",
                          fontSize: "0.75rem",
                        }}
                      >
                        {ticket.objectId}
                      </Text>
                    </Flex>

                    {/* Check-in Button */}
                    {ticket.status === TICKET_STATUS.VALID && (
                      <Button
                        size="4"
                        onClick={() => handleUseTicket(ticket.objectId)}
                        disabled={loadingTicketId === ticket.objectId}
                        style={{
                          background: "var(--suicket-gradient-primary)",
                          color: "white",
                          border: "none",
                          fontWeight: "700",
                          fontSize: "1rem",
                          boxShadow: "var(--suicket-shadow-blue)",
                          transition: "all var(--suicket-transition-fast)",
                          letterSpacing: "0.02em",
                        }}
                      >
                        {loadingTicketId === ticket.objectId ? (
                          <Flex align="center" gap="2">
                            <ClipLoader size={20} color="white" />
                            <Text>Processing...</Text>
                          </Flex>
                        ) : (
                          <Flex align="center" gap="2">
                            <CheckCircle2 size={20} />
                            <Text>Check-in at Event</Text>
                          </Flex>
                        )}
                      </Button>
                    )}

                    {/* Used Ticket Message */}
                    {ticket.status === TICKET_STATUS.USED && (
                      <Flex
                        align="center"
                        gap="2"
                        p="3"
                        style={{
                          background: "var(--suicket-neutral-100)",
                          borderRadius: "var(--suicket-radius-md)",
                          border: "1px solid var(--suicket-neutral-300)",
                        }}
                      >
                        <XCircle size={16} style={{ color: "var(--suicket-neutral-600)" }} />
                        <Text size="2" weight="medium" style={{ color: "var(--suicket-neutral-700)" }}>
                          This ticket has been used
                        </Text>
                      </Flex>
                    )}
                  </Flex>
                </Flex>
              </Card>
            ))}
          </Grid>
        )}

        <Button
          size="2"
          variant="outline"
          onClick={() => refetch()}
          style={{
            border: "1px solid var(--suicket-border-medium)",
            color: "var(--suicket-text-primary)",
          }}
        >
          <Flex align="center" gap="2">
            <RefreshCw size={16} />
            <Text>Refresh Tickets</Text>
          </Flex>
        </Button>
      </Flex>
    </Container>
  );
}

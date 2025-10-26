// CHANGED: New component for displaying owned tickets with QR codes
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
import { QRCodeSVG } from "qrcode.react";
import {
  Ticket,
  CheckCircle2,
  XCircle,
  AlertCircle,
  RefreshCw,
  Wallet
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
            columns={{ initial: "1", sm: "1", md: "2", lg: "3", xl: "4" }}
            gap={{ initial: "3", md: "4" }}
            style={{ width: "100%" }}
          >
            {tickets.map((ticket) => (
              <Card
                key={ticket.objectId}
                className="suicket-card-hover suicket-fade-in"
                style={{
                  background: "var(--suicket-bg-primary)",
                  border: ticket.status === TICKET_STATUS.VALID
                    ? "2px solid var(--suicket-success-400)"
                    : "1px solid var(--suicket-border-light)",
                  boxShadow: ticket.status === TICKET_STATUS.VALID
                    ? "0 4px 12px rgba(34, 197, 94, 0.2)"
                    : "var(--suicket-shadow-md)",
                  overflow: "hidden",
                }}
              >
                <Flex direction="column" gap="0">
                  {ticket.imageUrl && (
                    <div
                      style={{
                        width: "100%",
                        height: "clamp(120px, 30vw, 180px)",
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
                        }}
                      />
                      <Flex
                        align="center"
                        gap="1"
                        style={{
                          position: "absolute",
                          top: "12px",
                          right: "12px",
                          background: ticket.status === TICKET_STATUS.VALID
                            ? "var(--suicket-success-500)"
                            : "var(--suicket-neutral-600)",
                          color: "white",
                          padding: "4px 12px",
                          borderRadius: "var(--suicket-radius-full)",
                          fontWeight: "600",
                          fontSize: "0.75rem",
                          boxShadow: "var(--suicket-shadow-md)",
                        }}
                      >
                        {ticket.status === TICKET_STATUS.VALID ? (
                          <>
                            <CheckCircle2 size={12} />
                            <span>VALID</span>
                          </>
                        ) : (
                          <>
                            <XCircle size={12} />
                            <span>USED</span>
                          </>
                        )}
                      </Flex>
                    </div>
                  )}

                  <Flex direction="column" gap="3" p="4">
                    <Flex direction="column" gap="1">
                      <Heading
                        size="4"
                        style={{
                          color: "var(--suicket-text-primary)",
                          fontWeight: "700",
                        }}
                      >
                        {ticket.eventName}
                      </Heading>
                      <Text
                        size="2"
                        style={{
                          color: "var(--suicket-text-tertiary)",
                          fontFamily: "var(--font-mono)",
                        }}
                      >
                        Ticket #{ticket.ticketNumber}
                      </Text>
                    </Flex>

                    <Flex
                      justify="center"
                      py="2"
                      style={{
                        background: "var(--suicket-bg-secondary)",
                        borderRadius: "var(--suicket-radius-md)",
                        padding: "clamp(12px, 3vw, 16px)",
                      }}
                    >
                      <div style={{ width: "100%", maxWidth: "200px", aspectRatio: "1" }}>
                        <QRCodeSVG
                          value={ticket.objectId}
                          size={200}
                          level="H"
                          marginSize={2}
                          fgColor="var(--suicket-text-primary)"
                          bgColor="transparent"
                          style={{ width: "100%", height: "100%" }}
                        />
                      </div>
                    </Flex>

                    <Text
                      size="1"
                      style={{
                        color: "var(--suicket-text-tertiary)",
                        wordBreak: "break-all",
                        fontFamily: "var(--font-mono)",
                        background: "var(--suicket-bg-tertiary)",
                        padding: "8px",
                        borderRadius: "var(--suicket-radius-sm)",
                      }}
                    >
                      {ticket.objectId.slice(0, 20)}...
                    </Text>

                    {ticket.status === TICKET_STATUS.VALID && (
                      <Button
                        size="2"
                        onClick={() => handleUseTicket(ticket.objectId)}
                        disabled={loadingTicketId === ticket.objectId}
                        style={{
                          background: "var(--suicket-gradient-accent)",
                          color: "white",
                          border: "none",
                          fontWeight: "600",
                          boxShadow: "var(--suicket-shadow-orange)",
                        }}
                      >
                        {loadingTicketId === ticket.objectId ? (
                          <Flex align="center" gap="2">
                            <ClipLoader size={16} color="white" />
                            <Text>Processing...</Text>
                          </Flex>
                        ) : (
                          "Check-in at Event"
                        )}
                      </Button>
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

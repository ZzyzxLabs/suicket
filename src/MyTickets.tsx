// CHANGED: New component for displaying owned tickets with QR codes
import { useState } from "react";
import {
  useCurrentAccount,
  useSignAndExecuteTransaction,
  useSuiClient,
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
  Badge,
} from "@radix-ui/themes";
import { useNetworkVariable } from "./networkConfig";
import ClipLoader from "react-spinners/ClipLoader";
import { TicketData, TICKET_STATUS } from "./types";
import { QRCodeSVG } from "qrcode.react";

export function MyTickets() {
  const counterPackageId = useNetworkVariable("counterPackageId");
  const suiClient = useSuiClient();
  const currentAccount = useCurrentAccount();
  const { mutate: signAndExecute } = useSignAndExecuteTransaction();
  const [tickets, setTickets] = useState<TicketData[]>([]);
  const [loading, setLoading] = useState(false);
  const [loadingTicketId, setLoadingTicketId] = useState<string>("");
  const [error, setError] = useState<string>("");

  // Fetch tickets on component mount
  useState(() => {
    if (currentAccount) {
      fetchTickets();
    }
  });

  const fetchTickets = async () => {
    if (!currentAccount) return;

    setLoading(true);
    setError("");

    try {
      // Query owned objects of type Ticket
      const result = await suiClient.getOwnedObjects({
        owner: currentAccount.address,
        options: {
          showContent: true,
          showType: true,
        },
        filter: {
          StructType: `${counterPackageId}::suicket::Ticket`,
        },
      });

      // Parse ticket data
      const ticketData: TicketData[] = result.data
        .map((item) => {
          if (!item.data?.content || item.data.content.dataType !== "moveObject") {
            return null;
          }

          const fields = item.data.content.fields as {
            ticket_number: string;
            owner: string;
            status: number;
          };

          return {
            objectId: item.data.objectId,
            ticketNumber: parseInt(fields.ticket_number, 10),
            status: fields.status as 0 | 1,
            owner: fields.owner,
          };
        })
        .filter((t): t is TicketData => t !== null);

      setTickets(ticketData);
    } catch (err) {
      setError(`Failed to fetch tickets: ${(err as Error).message}`);
    } finally {
      setLoading(false);
    }
  };

  const handleUseTicket = (ticketId: string) => {
    setLoadingTicketId(ticketId);
    setError("");

    const tx = new Transaction();

    // Call use_ticket function
    tx.moveCall({
      arguments: [tx.object(ticketId)],
      target: `${counterPackageId}::suicket::use_ticket`,
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
          fetchTickets();
        },
        onError: (err) => {
          setError(`Failed to mark as used: ${err.message}`);
          setLoadingTicketId("");
        },
      }
    );
  };

  if (!currentAccount) {
    return (
      <Container>
        <Card>
          <Flex direction="column" gap="4" align="center" py="6">
            <Heading size="6">Please Connect Your Wallet</Heading>
            <Text>You need to connect your wallet to view your tickets</Text>
          </Flex>
        </Card>
      </Container>
    );
  }

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
          My Tickets
        </Heading>

        {error && (
          <Card style={{ backgroundColor: "var(--red-3)" }}>
            <Text color="red" size="2">
              {error}
            </Text>
          </Card>
        )}

        {tickets.length === 0 ? (
          <Card>
            <Flex direction="column" gap="4" align="center" py="6">
              <Heading size="4">No Tickets Yet</Heading>
              <Text>Go to the Mint page to get your ticket!</Text>
            </Flex>
          </Card>
        ) : (
          <Grid columns={{ initial: "1", md: "2", lg: "3" }} gap="4">
            {tickets.map((ticket) => (
              <Card key={ticket.objectId}>
                <Flex direction="column" gap="3" p="4">
                  <Flex justify="between" align="center">
                    <Heading size="4">Ticket #{ticket.ticketNumber}</Heading>
                    <Badge
                      color={
                        ticket.status === TICKET_STATUS.VALID ? "green" : "red"
                      }
                      size="2"
                    >
                      {ticket.status === TICKET_STATUS.VALID ? "Valid" : "Used"}
                    </Badge>
                  </Flex>

                  <Flex justify="center" py="2">
                    <QRCodeSVG
                      value={ticket.objectId}
                      size={200}
                      level="H"
                      includeMargin
                    />
                  </Flex>

                  <Text size="1" color="gray" style={{ wordBreak: "break-all" }}>
                    ID: {ticket.objectId}
                  </Text>

                  {ticket.status === TICKET_STATUS.VALID && (
                    <Button
                      size="2"
                      color="red"
                      variant="soft"
                      onClick={() => handleUseTicket(ticket.objectId)}
                      disabled={loadingTicketId === ticket.objectId}
                    >
                      {loadingTicketId === ticket.objectId ? (
                        <ClipLoader size={16} color="white" />
                      ) : (
                        "Mark as Used"
                      )}
                    </Button>
                  )}
                </Flex>
              </Card>
            ))}
          </Grid>
        )}

        <Button size="2" variant="outline" onClick={fetchTickets}>
          Refresh Tickets
        </Button>
      </Flex>
    </Container>
  );
}

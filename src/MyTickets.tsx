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
  Badge,
} from "@radix-ui/themes";
import { useNetworkVariable } from "./networkConfig";
import ClipLoader from "react-spinners/ClipLoader";
import { TicketData, TICKET_STATUS } from "./types";
import { QRCodeSVG } from "qrcode.react";

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
      target: `${suicketPackageId}::suicket::use_ticket`,
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
        <Card>
          <Flex direction="column" gap="4" align="center" py="6">
            <Heading size="6">Please Connect Your Wallet</Heading>
            <Text>You need to connect your wallet to view your tickets</Text>
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
          <Card style={{ backgroundColor: "var(--red-3)" }}>
            <Text color="red" size="2">
              Error loading tickets: {error.message}
            </Text>
          </Card>
        )}

        {actionError && (
          <Card style={{ backgroundColor: "var(--red-3)" }}>
            <Text color="red" size="2">
              {actionError}
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
                <Flex direction="column" gap="3">
                  {ticket.imageUrl && (
                    <img
                      src={ticket.imageUrl}
                      alt={ticket.eventName}
                      style={{
                        width: "100%",
                        height: "150px",
                        objectFit: "cover",
                        borderRadius: "var(--radius-3)",
                      }}
                    />
                  )}

                  <Flex direction="column" gap="3" p="4">
                    <Flex justify="between" align="start">
                      <Flex direction="column" gap="1">
                        <Heading size="4">{ticket.eventName}</Heading>
                        <Text size="2" color="gray">
                          Ticket #{ticket.ticketNumber}
                        </Text>
                      </Flex>
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
                        marginSize={4}
                      />
                    </Flex>

                    <Text size="1" color="gray" style={{ wordBreak: "break-all" }}>
                      Ticket ID: {ticket.objectId}
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
                </Flex>
              </Card>
            ))}
          </Grid>
        )}

        <Button size="2" variant="outline" onClick={() => refetch()}>
          Refresh Tickets
        </Button>
      </Flex>
    </Container>
  );
}

// CHANGED: New component for scanning and validating tickets
import { useState, useEffect, useRef } from "react";
import { useSuiClient } from "@mysten/dapp-kit";
import {
  Button,
  Container,
  Flex,
  Heading,
  Text,
  Card,
  Badge,
} from "@radix-ui/themes";
import { useNetworkVariable } from "./networkConfig";
import { Html5Qrcode } from "html5-qrcode";
import { TICKET_STATUS } from "./types";

export function Scanner() {
  const counterPackageId = useNetworkVariable("counterPackageId");
  const suiClient = useSuiClient();
  const [scanning, setScanning] = useState(false);
  const [scannedTicket, setScannedTicket] = useState<{
    ticketNumber: number;
    status: 0 | 1;
    owner: string;
  } | null>(null);
  const [error, setError] = useState<string>("");
  const scannerRef = useRef<Html5Qrcode | null>(null);

  useEffect(() => {
    // Cleanup scanner on unmount
    return () => {
      if (scannerRef.current && scanning) {
        scannerRef.current.stop().catch(console.error);
      }
    };
  }, [scanning]);

  const startScanning = async () => {
    try {
      setError("");
      setScannedTicket(null);

      const html5QrCode = new Html5Qrcode("qr-reader");
      scannerRef.current = html5QrCode;

      await html5QrCode.start(
        { facingMode: "environment" },
        {
          fps: 10,
          qrbox: { width: 250, height: 250 },
        },
        onScanSuccess,
        () => {
          // Ignore scan failures (happens constantly while searching)
        }
      );

      setScanning(true);
    } catch (err) {
      setError(`Failed to start camera: ${(err as Error).message}`);
    }
  };

  const stopScanning = async () => {
    if (scannerRef.current) {
      try {
        await scannerRef.current.stop();
        scannerRef.current = null;
        setScanning(false);
      } catch (err) {
        console.error("Error stopping scanner:", err);
      }
    }
  };

  const onScanSuccess = async (decodedText: string) => {
    // Stop scanning immediately
    await stopScanning();

    // Validate that it's a valid Sui object ID (0x followed by hex)
    if (!decodedText.startsWith("0x") || decodedText.length < 60) {
      setError("Invalid QR code format");
      return;
    }

    try {
      // Query the ticket object
      const result = await suiClient.getObject({
        id: decodedText,
        options: {
          showContent: true,
          showType: true,
        },
      });

      if (!result.data) {
        setError("Ticket not found on blockchain");
        return;
      }

      // Verify it's a Ticket object
      if (!result.data.type?.includes("::suicket::Ticket")) {
        setError("QR code does not represent a valid ticket");
        return;
      }

      if (result.data.content?.dataType !== "moveObject") {
        setError("Invalid ticket data format");
        return;
      }

      const fields = result.data.content.fields as {
        ticket_number: string;
        owner: string;
        status: number;
      };

      setScannedTicket({
        ticketNumber: parseInt(fields.ticket_number, 10),
        status: fields.status as 0 | 1,
        owner: fields.owner,
      });
    } catch (err) {
      setError(`Failed to verify ticket: ${(err as Error).message}`);
    }
  };

  const resetScanner = () => {
    setScannedTicket(null);
    setError("");
  };

  return (
    <Container>
      <Flex direction="column" gap="4" py="6">
        <Heading size="8" align="center">
          Ticket Scanner
        </Heading>

        <Card>
          <Flex direction="column" gap="4" p="4">
            {!scanning && !scannedTicket && !error && (
              <>
                <Heading size="4">Scan QR Code</Heading>
                <Text size="2">
                  Click the button below to start the camera and scan a ticket QR code
                </Text>
                <Button size="3" onClick={startScanning}>
                  Start Scanner
                </Button>
              </>
            )}

            {scanning && (
              <>
                <Heading size="4">Scanning...</Heading>
                <div id="qr-reader" style={{ width: "100%" }}></div>
                <Button size="2" variant="soft" onClick={stopScanning}>
                  Cancel Scan
                </Button>
              </>
            )}

            {error && (
              <Card style={{ backgroundColor: "var(--red-3)" }}>
                <Flex direction="column" gap="2" p="4" align="center">
                  <Heading size="4" color="red">
                    Error
                  </Heading>
                  <Text color="red" size="2" align="center">
                    {error}
                  </Text>
                  <Button size="2" onClick={resetScanner}>
                    Try Again
                  </Button>
                </Flex>
              </Card>
            )}

            {scannedTicket && (
              <Card
                style={{
                  backgroundColor:
                    scannedTicket.status === TICKET_STATUS.VALID
                      ? "var(--green-3)"
                      : "var(--red-3)",
                }}
              >
                <Flex direction="column" gap="3" p="4" align="center">
                  <Heading
                    size="6"
                    color={
                      scannedTicket.status === TICKET_STATUS.VALID ? "green" : "red"
                    }
                  >
                    {scannedTicket.status === TICKET_STATUS.VALID ? "✅" : "❌"}
                  </Heading>

                  <Heading size="5">
                    Ticket #{scannedTicket.ticketNumber}
                  </Heading>

                  <Badge
                    color={
                      scannedTicket.status === TICKET_STATUS.VALID ? "green" : "red"
                    }
                    size="3"
                  >
                    {scannedTicket.status === TICKET_STATUS.VALID
                      ? "VALID TICKET"
                      : "ALREADY USED"}
                  </Badge>

                  {scannedTicket.status === TICKET_STATUS.USED && (
                    <Text size="2" align="center" color="red">
                      This ticket has already been checked in and cannot be used again
                    </Text>
                  )}

                  <Text
                    size="1"
                    color="gray"
                    align="center"
                    style={{ wordBreak: "break-all" }}
                  >
                    Owner: {scannedTicket.owner}
                  </Text>

                  <Button size="2" onClick={resetScanner} style={{ marginTop: "1rem" }}>
                    Scan Another Ticket
                  </Button>
                </Flex>
              </Card>
            )}
          </Flex>
        </Card>

        <Card>
          <Flex direction="column" gap="2" p="4">
            <Heading size="3">Instructions</Heading>
            <Text size="2">1. Click "Start Scanner" to activate camera</Text>
            <Text size="2">2. Point camera at the ticket QR code</Text>
            <Text size="2">3. System will automatically verify ticket status on-chain</Text>
            <Text size="2">
              4. Green = Valid ticket, Red = Already used or invalid
            </Text>
          </Flex>
        </Card>
      </Flex>
    </Container>
  );
}

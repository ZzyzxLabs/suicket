import { useState, useEffect } from "react";
import {
    useCurrentAccount,
    useSignAndExecuteTransaction,
    useSuiClient,
} from "@mysten/dapp-kit";
import { Transaction } from "@mysten/sui/transactions";
import {
    Container,
    Flex,
    Heading,
    Text,
    Card,
} from "@radix-ui/themes";
import { EventCard } from "./components/EventCard";
import { useNetworkVariable } from "./networkConfig";
import ClipLoader from "react-spinners/ClipLoader";
import { type SuiObjectResponse } from "@mysten/sui/client";
import {
    Calendar,
    CheckCircle2,
    AlertCircle,
    Wallet
} from "lucide-react";

interface Event {
    id: string;
    eventCapId: string;
    eventName: string;
    eventDescription: string;
    imageUrl: string;
    eventOwnerAddress: string;
    maxTicketSupply: number;
    price: number;
    ticketSold: number;
}

export function MyEvents() {
    const suicketPackageId = useNetworkVariable("suicketPackageId");
    const suiClient = useSuiClient();
    const currentAccount = useCurrentAccount();
    const { mutate: signAndExecute } = useSignAndExecuteTransaction();

    const [events, setEvents] = useState<Event[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string>("");
    const [success, setSuccess] = useState<string>("");

    // Edit dialog state
    const [editFormData, setEditFormData] = useState({
        description: "",
        maxSupply: "",
        price: "",
    });

    useEffect(() => {
        if (currentAccount) {
            fetchMyEvents();
        }
    }, [currentAccount]);

    const fetchMyEvents = async () => {
        if (!currentAccount) return;

        try {
            const ownedObjects = await suiClient.getOwnedObjects({
                owner: currentAccount.address,
                options: { showContent: true },
                filter: { StructType: `${suicketPackageId}::main::EventCap` },
            });

            const eventPromises = ownedObjects.data.map(async (cap) => {
                const eventCapId = cap.data?.objectId;
                const eventId = (cap.data?.content as any)?.fields?.event_id;
                if (eventId && eventCapId) {
                    const event = await suiClient.getObject({
                        id: eventId,
                        options: { showContent: true },
                    });
                    return parseEventData(event, eventCapId);
                }
                return null;
            });

            const events = (await Promise.all(eventPromises)).filter(
                (event): event is Event => event !== null
            );
            setEvents(events);
        } catch (err) {
            setError(`Failed to fetch events: ${(err as Error).message}`);
        } finally {
            setLoading(false);
        }
    };

    const parseEventData = (eventObject: SuiObjectResponse, eventCapId: string): Event | null => {
        try {
            const fields = (eventObject.data?.content as any)?.fields;
            if (!fields) return null;

            return {
                id: eventObject.data?.objectId || "",
                eventCapId,
                eventName: fields.event_name,
                eventDescription: fields.event_description,
                imageUrl: fields.image_url,
                eventOwnerAddress: fields.event_owner_address,
                maxTicketSupply: Number(fields.max_ticket_supply),
                price: Number(fields.price) / 1_000_000_000, // Convert from MIST to SUI
                ticketSold: Number(fields.ticket_sold),
            };
        } catch (err) {
            console.error("Failed to parse event data:", err);
            return null;
        }
    };

    const handleInputChange = (
        e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
    ) => {
        const { name, value } = e.target;
        setEditFormData((prev) => ({
            ...prev,
            [name]: value,
        }));
    };

    const handleUpdateEvent = async (field: string, value: string, eventId: string, eventCapId: string) => {
        if (!currentAccount) return;

        try {
            setError("");
            const tx = new Transaction();

            switch (field) {
                case "description":
                    tx.moveCall({
                        arguments: [
                            tx.object(eventCapId),
                            tx.object(eventId),
                            tx.pure.string(value),
                        ],
                        target: `${suicketPackageId}::main::update_description`,
                    });
                    break;
                case "maxSupply":
                    tx.moveCall({
                        arguments: [
                            tx.object(eventCapId),
                            tx.object(eventId),
                            tx.pure.u64(parseInt(value)),
                        ],
                        target: `${suicketPackageId}::main::update_max_ticket_supply`,
                    });
                    break;
                case "price":
                    tx.moveCall({
                        arguments: [
                            tx.object(eventCapId),
                            tx.object(eventId),
                            tx.pure.u64(Math.floor(parseFloat(value) * 1_000_000_000)),
                        ],
                        target: `${suicketPackageId}::main::update_price`,
                    });
                    break;
            }

            await signAndExecute(
                {
                    transaction: tx,
                },
                {
                    onSuccess: async (result) => {
                        await suiClient.waitForTransaction({ digest: result.digest });
                        setSuccess(`Event updated successfully! Digest: ${result.digest}`);
                        fetchMyEvents(); // Refresh the events list
                    },
                    onError: (err) => {
                        setError(`Failed to update event: ${err.message}`);
                    },
                }
            );
        } catch (err) {
            setError(`Failed to update event: ${(err as Error).message}`);
        }
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
                            Connect Wallet
                        </Heading>
                        <Text style={{ color: "var(--suicket-text-secondary)" }}>
                            Please connect your wallet to view your events
                        </Text>
                    </Flex>
                </Card>
            </Container>
        );
    }

    if (loading) {
        return (
            <Container>
                <Flex align="center" justify="center" py="9">
                    <ClipLoader size={40} />
                </Flex>
            </Container>
        );
    }

    return (
        <Container size="2">
            <Flex direction="column" gap="4" py="6">
                <Heading size="8" align="center">
                    My Events
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
                                {error}
                            </Text>
                        </Flex>
                    </Card>
                )}

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

                {events.length === 0 ? (
                    <Card
                        style={{
                            background: "var(--suicket-bg-primary)",
                            border: "1px solid var(--suicket-border-light)",
                        }}
                    >
                        <Flex direction="column" gap="4" align="center" py="8">
                            <Calendar size={48} style={{ color: "var(--suicket-neutral-400)" }} />
                            <Heading size="4" style={{ color: "var(--suicket-text-primary)" }}>
                                No Events Yet
                            </Heading>
                            <Text style={{ color: "var(--suicket-text-secondary)" }}>
                                You haven't created any events yet. Go to Create Event to get started!
                            </Text>
                        </Flex>
                    </Card>
                ) : (
                    <Flex direction="column" gap="4">
                        {events.map((event) => (
                            <EventCard
                                key={event.id}
                                event={event}
                                showEditButton={true}
                                onEdit={(field, value) => handleUpdateEvent(field, value, event.id, event.eventCapId)}
                                editFormData={editFormData}
                                onEditFormChange={handleInputChange}
                            />
                        ))}
                    </Flex>
                )}
            </Flex>
        </Container>
    );
}
import {
    Button,
    Card,
    Flex,
    Text,
    Dialog,
    TextField,
    TextArea,
    Heading,
    Badge,
} from "@radix-ui/themes";
import { Ticket } from "lucide-react";

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

interface EventCardProps {
    event: Event;
    showEditButton?: boolean;
    onEdit?: (field: string, value: string) => void;
    editFormData?: {
        description: string;
        maxSupply: string;
        price: string;
    };
    onEditFormChange?: (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => void;
}

export function EventCard({
    event,
    showEditButton = false,
    onEdit,
    editFormData,
    onEditFormChange,
}: EventCardProps) {
    const formatPrice = (price: number) => {
        return price === 0 ? "FREE" : `${price} SUI`;
    };

    const calculateProgress = (sold: number, max: number) => {
        return (sold / max) * 100;
    };

    const soldOutPercentage = calculateProgress(event.ticketSold, event.maxTicketSupply);
    const isSoldOut = event.ticketSold >= event.maxTicketSupply;

    return (
        <Card
            size="2"
            style={{
                background: "var(--pink-2)",
                border: "1px solid var(--green-8)",
                boxShadow: "0 2px 12px var(--pink-4)",
                width: "800px",
                margin: "0 auto",
                minHeight: "250px"
            }}
        >
            <Flex gap="4">
                {/* Image Section */}
                <div style={{ width: "200px", flexShrink: 0 }}>
                    <img
                        src={event.imageUrl || "https://placehold.co/600x400?text=No+Image"}
                        alt={event.eventName}
                        style={{
                            width: "200px",
                            height: "200px",
                            objectFit: "cover",
                            borderRadius: "8px",
                        }}
                    />
                </div>

                {/* Content Section */}
                <Flex direction="column" gap="2" py="2" style={{ flex: 1, paddingRight: "16px" }}>
                    <Flex justify="between" align="start" gap="4">
                        <div>
                            <Heading
                                size="5"
                                style={{
                                    color: "var(--green-11)",
                                    marginBottom: "4px",
                                    fontFamily: "system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', sans-serif",
                                    fontWeight: "700",
                                    letterSpacing: "-0.025em",
                                    fontSize: "1.5rem",
                                    textTransform: "capitalize"
                                }}
                            >
                                {event.eventName}
                            </Heading>
                            <Text size="2" style={{
                                color: "var(--green-10)",
                                fontFamily: "'SF Pro Text', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', sans-serif",
                                lineHeight: "1.6",
                                fontWeight: "450",
                                letterSpacing: "0.01em",
                                fontSize: "0.95rem"
                            }}>
                                {event.eventDescription}
                            </Text>
                        </div>
                        <Badge
                            size="2"
                            style={{
                                background: isSoldOut ? "var(--red-3)" :
                                    soldOutPercentage > 75 ? "var(--pink-3)" :
                                        "var(--green-3)",
                                color: isSoldOut ? "var(--red-11)" :
                                    soldOutPercentage > 75 ? "var(--green-11)" :
                                        "var(--green-11)",
                                border: "1px solid var(--green-7)"
                            }}
                        >
                            {isSoldOut
                                ? "SOLD OUT"
                                : `${event.ticketSold}/${event.maxTicketSupply} tickets`}
                        </Badge>
                    </Flex>

                    <div style={{ flex: 1 }}></div>

                    {/* Price and Stats */}
                    <Flex justify="between" align="center">
                        <Badge
                            size="2"
                            style={{
                                background: "var(--green-3)",
                                color: "var(--green-11)",
                                border: "1px solid var(--green-7)",
                                fontFamily: "var(--font-mono)",
                                fontWeight: "500"
                            }}
                        >
                            {formatPrice(event.price)}
                        </Badge>
                        <Flex gap="2" align="center">
                            <Ticket size={16} style={{ color: "var(--amber-9)" }} />
                            <Text size="2" style={{
                                color: "var(--green-11)",
                                fontFamily: "var(--font-mono)",
                                fontWeight: "500",
                                letterSpacing: "0.02em"
                            }}>
                                {event.ticketSold}/{event.maxTicketSupply} sold
                            </Text>
                        </Flex>
                    </Flex>

                    {/* Progress Bar */}
                    <div
                        style={{
                            width: "100%",
                            height: "4px",
                            backgroundColor: "var(--pink-3)",
                            borderRadius: "2px",
                            overflow: "hidden",
                        }}
                    >
                        <div
                            style={{
                                width: `${soldOutPercentage}%`,
                                height: "100%",
                                backgroundColor: isSoldOut
                                    ? "var(--red-9)"
                                    : soldOutPercentage > 75
                                        ? "var(--green-9)"
                                        : "var(--green-8)",
                                transition: "width 0.3s ease-in-out",
                            }}
                        />
                    </div>

                    {/* Edit Button and Dialog */}
                    {showEditButton && onEdit && editFormData && onEditFormChange && (
                        <Dialog.Root>
                            <Dialog.Trigger>
                                <Button
                                    size="2"
                                    variant="soft"
                                    style={{
                                        marginTop: "-4px",
                                        background: "var(--green-3)",
                                        color: "var(--green-11)",
                                        border: "1px solid var(--green-7)"
                                    }}
                                >
                                    Edit Event
                                </Button>
                            </Dialog.Trigger>

                            <Dialog.Content style={{ maxWidth: 450 }}>
                                <Dialog.Title>Edit Event</Dialog.Title>

                                <Flex direction="column" gap="4">
                                    <Flex direction="column" gap="2">
                                        <Text weight="bold">Description</Text>
                                        <TextArea
                                            name="description"
                                            placeholder={event.eventDescription}
                                            value={editFormData.description}
                                            onChange={onEditFormChange}
                                        />
                                        <Button
                                            size="2"
                                            onClick={() =>
                                                onEdit("description", editFormData.description)
                                            }
                                        >
                                            Update Description
                                        </Button>
                                    </Flex>

                                    <Flex direction="column" gap="2">
                                        <Text weight="bold">Max Supply</Text>
                                        <TextField.Root
                                            name="maxSupply"
                                            type="number"
                                            placeholder={event.maxTicketSupply.toString()}
                                            value={editFormData.maxSupply}
                                            onChange={onEditFormChange}
                                        />
                                        <Button
                                            size="2"
                                            onClick={() => onEdit("maxSupply", editFormData.maxSupply)}
                                        >
                                            Update Max Supply
                                        </Button>
                                    </Flex>

                                    <Flex direction="column" gap="2">
                                        <Text weight="bold">Price (SUI)</Text>
                                        <TextField.Root
                                            name="price"
                                            type="number"
                                            step="0.1"
                                            placeholder={event.price.toString()}
                                            value={editFormData.price}
                                            onChange={onEditFormChange}
                                        />
                                        <Button
                                            size="2"
                                            onClick={() => onEdit("price", editFormData.price)}
                                        >
                                            Update Price
                                        </Button>
                                    </Flex>
                                </Flex>

                                <Flex gap="3" mt="4" justify="end">
                                    <Dialog.Close>
                                        <Button variant="soft" color="gray">
                                            Close
                                        </Button>
                                    </Dialog.Close>
                                </Flex>
                            </Dialog.Content>
                        </Dialog.Root>
                    )}
                </Flex>
            </Flex>
        </Card>
    );
}
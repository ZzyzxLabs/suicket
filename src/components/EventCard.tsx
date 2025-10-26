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
import { Ticket, DollarSign, Edit } from "lucide-react";

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
            className="suicket-event-card suicket-card-hover"
            style={{
                background: "var(--suicket-bg-primary)",
                border: "none",
                boxShadow: "var(--suicket-shadow-lg)",
                width: "100%",
                maxWidth: "900px",
                margin: "0 auto",
                minHeight: "250px",
                overflow: "hidden",
            }}
        >
            {/* Top Accent Bar */}
            <div
                style={{
                    height: "6px",
                    background: isSoldOut
                        ? "var(--suicket-neutral-400)"
                        : "var(--suicket-gradient-primary)",
                }}
            />

            <Flex gap={{ initial: "3", md: "4" }} direction={{ initial: "column", sm: "row" }} p="4">
                {/* Image Section */}
                <div
                    className="suicket-event-card-image"
                    style={{
                        width: "100%",
                        maxWidth: "220px",
                        flexShrink: 0,
                        position: "relative",
                    }}
                >
                    <img
                        src={event.imageUrl || "https://placehold.co/600x400?text=No+Image"}
                        alt={event.eventName}
                        style={{
                            width: "100%",
                            height: "clamp(150px, 30vw, 220px)",
                            objectFit: "cover",
                            borderRadius: "var(--suicket-radius-lg)",
                            boxShadow: "var(--suicket-shadow-md)",
                        }}
                    />
                    {/* Status Badge on Image */}
                    {isSoldOut && (
                        <div
                            style={{
                                position: "absolute",
                                top: "12px",
                                right: "12px",
                                background: "var(--suicket-error-500)",
                                color: "white",
                                padding: "6px 14px",
                                borderRadius: "var(--suicket-radius-full)",
                                fontWeight: "700",
                                fontSize: "0.75rem",
                                boxShadow: "var(--suicket-shadow-lg)",
                            }}
                        >
                            SOLD OUT
                        </div>
                    )}
                </div>

                {/* Content Section */}
                <Flex
                    direction="column"
                    gap="3"
                    py={{ initial: "0", sm: "1" }}
                    style={{ flex: 1 }}
                >
                    {/* Title and Description */}
                    <div>
                        <Heading
                            size="6"
                            style={{
                                color: "var(--suicket-text-primary)",
                                marginBottom: "8px",
                                fontWeight: "700",
                                letterSpacing: "-0.02em",
                                lineHeight: "1.2",
                            }}
                        >
                            {event.eventName}
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
                            {event.eventDescription}
                        </Text>
                    </div>

                    {/* Stats Section */}
                    <Flex
                        gap="3"
                        wrap="wrap"
                        style={{
                            padding: "12px",
                            background: "var(--suicket-bg-secondary)",
                            borderRadius: "var(--suicket-radius-md)",
                            border: "1px solid var(--suicket-border-light)",
                        }}
                    >
                        <div style={{ flex: "1 1 auto", minWidth: "120px" }}>
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
                                Status
                            </Text>
                            <Badge
                                size="2"
                                style={{
                                    background: isSoldOut
                                        ? "var(--suicket-error-100)"
                                        : soldOutPercentage > 75
                                        ? "var(--suicket-warning-100)"
                                        : "var(--suicket-success-100)",
                                    color: isSoldOut
                                        ? "var(--suicket-error-700)"
                                        : soldOutPercentage > 75
                                        ? "var(--suicket-warning-700)"
                                        : "var(--suicket-success-700)",
                                    border: isSoldOut
                                        ? "1px solid var(--suicket-error-300)"
                                        : soldOutPercentage > 75
                                        ? "1px solid var(--suicket-warning-300)"
                                        : "1px solid var(--suicket-success-300)",
                                    fontWeight: "600",
                                }}
                            >
                                {isSoldOut ? "SOLD OUT" : `${event.maxTicketSupply - event.ticketSold} Available`}
                            </Badge>
                        </div>
                    </Flex>

                    <div style={{ flex: 1 }}></div>

                    {/* Price and Stats */}
                    <Flex justify="between" align="center">
                        <Flex align="center" gap="2">
                            <DollarSign
                                size={16}
                                style={{
                                    color: event.price === 0 ? "var(--suicket-success-600)" : "var(--suicket-primary-600)",
                                }}
                            />
                            <Badge
                                size="2"
                                style={{
                                    background: event.price === 0 ? "var(--suicket-success-100)" : "var(--suicket-primary-100)",
                                    color: event.price === 0 ? "var(--suicket-success-700)" : "var(--suicket-primary-700)",
                                    border: event.price === 0 ? "1px solid var(--suicket-success-300)" : "1px solid var(--suicket-primary-300)",
                                    fontFamily: "var(--font-mono)",
                                    fontWeight: "600"
                                }}
                            >
                                {formatPrice(event.price)}
                            </Badge>
                        </Flex>
                        <Flex gap="2" align="center">
                            <Ticket size={16} style={{ color: "var(--suicket-accent-600)" }} />
                            <Text size="2" style={{
                                color: "var(--suicket-text-primary)",
                                fontFamily: "var(--font-mono)",
                                fontWeight: "500",
                                letterSpacing: "0.02em"
                            }}>
                                {event.ticketSold}/{event.maxTicketSupply}
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
                                        background: "var(--suicket-primary-100)",
                                        color: "var(--suicket-primary-700)",
                                        border: "1px solid var(--suicket-primary-300)",
                                        fontWeight: "600"
                                    }}
                                >
                                    <Flex align="center" gap="2">
                                        <Edit size={16} />
                                        <span>Edit Event</span>
                                    </Flex>
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
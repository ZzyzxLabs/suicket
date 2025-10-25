// Admin component for creating new events
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
  TextField,
  TextArea,
} from "@radix-ui/themes";
import { useNetworkVariable } from "./networkConfig";
import ClipLoader from "react-spinners/ClipLoader";

export function CreateEvent() {
  const counterPackageId = useNetworkVariable("counterPackageId");
  const suiClient = useSuiClient();
  const currentAccount = useCurrentAccount();
  const { mutate: signAndExecute } = useSignAndExecuteTransaction();

  const [isCreating, setIsCreating] = useState(false);
  const [error, setError] = useState<string>("");
  const [success, setSuccess] = useState<string>("");

  // Form state
  const [formData, setFormData] = useState({
    name: "",
    description: "",
    date: "",
    location: "",
    maxSupply: "",
    price: "",
    imageUrl: "",
  });

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const validateForm = (): boolean => {
    if (!formData.name.trim()) {
      setError("Event name is required");
      return false;
    }
    if (!formData.description.trim()) {
      setError("Description is required");
      return false;
    }
    if (!formData.date.trim()) {
      setError("Date is required");
      return false;
    }
    if (!formData.location.trim()) {
      setError("Location is required");
      return false;
    }
    if (!formData.maxSupply || parseInt(formData.maxSupply) <= 0) {
      setError("Max supply must be greater than 0");
      return false;
    }
    if (!formData.price || parseFloat(formData.price) < 0) {
      setError("Price must be 0 or greater");
      return false;
    }
    return true;
  };

  const handleCreateEvent = () => {
    if (!currentAccount) {
      setError("Please connect your wallet first");
      return;
    }

    if (!validateForm()) {
      return;
    }

    setIsCreating(true);
    setError("");
    setSuccess("");

    const tx = new Transaction();

    // TODO: Call create_event function when smart contract is ready
    // For now, this is a placeholder
    tx.moveCall({
      arguments: [
        tx.pure.string(formData.name),
        tx.pure.string(formData.description),
        tx.pure.string(formData.date),
        tx.pure.string(formData.location),
        tx.pure.u64(parseInt(formData.maxSupply)),
        tx.pure.u64(Math.floor(parseFloat(formData.price) * 1_000_000_000)), // Convert SUI to MIST
        tx.pure.string(formData.imageUrl || ""),
      ],
      target: `${counterPackageId}::suicket::create_event`,
    });

    signAndExecute(
      {
        transaction: tx,
      },
      {
        onSuccess: async (result) => {
          await suiClient.waitForTransaction({ digest: result.digest });
          setSuccess(
            `Event "${formData.name}" created successfully! Digest: ${result.digest}`
          );
          setIsCreating(false);
          // Reset form
          setFormData({
            name: "",
            description: "",
            date: "",
            location: "",
            maxSupply: "",
            price: "",
            imageUrl: "",
          });
        },
        onError: (err) => {
          setError(`Transaction failed: ${err.message}`);
          setIsCreating(false);
        },
      }
    );
  };

  if (!currentAccount) {
    return (
      <Container>
        <Card>
          <Flex direction="column" gap="4" align="center" py="6">
            <Heading size="6">Admin Access Required</Heading>
            <Text>Please connect your wallet to create events</Text>
          </Flex>
        </Card>
      </Container>
    );
  }

  return (
    <Container size="2">
      <Flex direction="column" gap="4" py="6">
        <Heading size="8" align="center">
          Create New Event
        </Heading>

        <Text size="2" color="gray" align="center">
          Create a new event and allow users to mint NFT tickets
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

        <Card>
          <Flex direction="column" gap="4" p="4">
            <Flex direction="column" gap="2">
              <Text size="2" weight="bold">
                Event Name *
              </Text>
              <TextField.Root
                name="name"
                placeholder="e.g., CalHacks 12.0"
                value={formData.name}
                onChange={handleInputChange}
                size="3"
              />
            </Flex>

            <Flex direction="column" gap="2">
              <Text size="2" weight="bold">
                Description *
              </Text>
              <TextArea
                name="description"
                placeholder="Describe your event..."
                value={formData.description}
                onChange={handleInputChange}
                size="3"
                rows={4}
              />
            </Flex>

            <Flex direction="column" gap="2">
              <Text size="2" weight="bold">
                Date *
              </Text>
              <TextField.Root
                name="date"
                placeholder="e.g., November 15-17, 2025"
                value={formData.date}
                onChange={handleInputChange}
                size="3"
              />
            </Flex>

            <Flex direction="column" gap="2">
              <Text size="2" weight="bold">
                Location *
              </Text>
              <TextField.Root
                name="location"
                placeholder="e.g., UC Berkeley, CA"
                value={formData.location}
                onChange={handleInputChange}
                size="3"
              />
            </Flex>

            <Flex direction="column" gap="2">
              <Text size="2" weight="bold">
                Max Supply (Total Tickets) *
              </Text>
              <TextField.Root
                name="maxSupply"
                type="number"
                placeholder="e.g., 500"
                value={formData.maxSupply}
                onChange={handleInputChange}
                size="3"
              />
            </Flex>

            <Flex direction="column" gap="2">
              <Text size="2" weight="bold">
                Price (in SUI) *
              </Text>
              <TextField.Root
                name="price"
                type="number"
                step="0.1"
                placeholder="e.g., 0 for free, 0.5 for 0.5 SUI"
                value={formData.price}
                onChange={handleInputChange}
                size="3"
              />
              <Text size="1" color="gray">
                Enter 0 for free events
              </Text>
            </Flex>

            <Flex direction="column" gap="2">
              <Text size="2" weight="bold">
                Image URL (optional)
              </Text>
              <TextField.Root
                name="imageUrl"
                placeholder="https://example.com/image.jpg"
                value={formData.imageUrl}
                onChange={handleInputChange}
                size="3"
              />
            </Flex>

            <Button
              size="3"
              onClick={handleCreateEvent}
              disabled={isCreating}
              style={{ cursor: isCreating ? "wait" : "pointer" }}
            >
              {isCreating ? (
                <Flex align="center" gap="2">
                  <ClipLoader size={20} color="white" />
                  <Text>Creating Event...</Text>
                </Flex>
              ) : (
                "Create Event"
              )}
            </Button>
          </Flex>
        </Card>

        <Card>
          <Flex direction="column" gap="2" p="4">
            <Heading size="3">Instructions</Heading>
            <Text size="2">
              1. Fill in all required fields marked with *
            </Text>
            <Text size="2">
              2. Set the max supply to limit total tickets available
            </Text>
            <Text size="2">
              3. Set price to 0 for free events, or enter amount in SUI
            </Text>
            <Text size="2">
              4. Click "Create Event" to publish on-chain
            </Text>
            <Text size="2" color="gray" style={{ fontStyle: "italic" }}>
              Note: Make sure your smart contract has a create_event function
              implemented
            </Text>
          </Flex>
        </Card>
      </Flex>
    </Container>
  );
}

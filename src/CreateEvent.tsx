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
import {
  PlusCircle,
  Image,
  Ticket,
  DollarSign,
  CheckCircle2,
  AlertCircle,
  Info,
  Upload,
  Wallet
} from "lucide-react";

const WALRUS_PUBLISHER_URL = "https://publisher.walrus-testnet.walrus.space";
const WALRUS_AGGREGATOR_URL = "https://aggregator.walrus-testnet.walrus.space";
const WALRUS_EPOCHS = 10;

export function CreateEvent() {
  const suicketPackageId = useNetworkVariable("suicketPackageId");
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
    maxSupply: "",
    price: "",
  });
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [uploadedImageUrl, setUploadedImageUrl] = useState<string>("");

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;

    // Prevent negative values for price and maxSupply
    if ((name === "price" || name === "maxSupply") && parseFloat(value) < 0) {
      return;
    }

    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setImageFile(e.target.files[0]);
      setUploadedImageUrl(""); // Clear any previously uploaded URL
    }
  };

  const uploadImageToWalrus = async (): Promise<string> => {
    if (!imageFile) {
      return "";
    }

    try {
      const response = await fetch(
        `${WALRUS_PUBLISHER_URL}/v1/blobs?epochs=${WALRUS_EPOCHS}`,
        {
          method: "PUT",
          body: imageFile,
        }
      );

      if (response.status === 200) {
        const result = await response.json();
        let blobId = "";

        if ("alreadyCertified" in result) {
          blobId = result.alreadyCertified.blobId;
        } else if ("newlyCreated" in result) {
          blobId = result.newlyCreated.blobObject.blobId;
        }

        const imageUrl = `${WALRUS_AGGREGATOR_URL}/v1/blobs/${blobId}`;
        setUploadedImageUrl(imageUrl);
        return imageUrl;
      } else {
        throw new Error("Failed to upload image to Walrus");
      }
    } catch (err) {
      throw new Error(`Walrus upload failed: ${(err as Error).message}`);
    }
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

  const handleCreateEvent = async () => {
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

    try {
      // Upload image to Walrus first if an image is selected
      let imageUrl = uploadedImageUrl;
      if (imageFile && !uploadedImageUrl) {
        imageUrl = await uploadImageToWalrus();
      }

      const tx = new Transaction();

      // Call create_event function
      tx.moveCall({
        arguments: [
          tx.pure.string(formData.name),
          tx.pure.string(formData.description),
          tx.pure.string(imageUrl || ""),
          tx.pure.u64(parseInt(formData.maxSupply)),
          tx.pure.u64(Math.floor(parseFloat(formData.price) * 1_000_000_000)), // Convert SUI to MIST
        ],
        target: `${suicketPackageId}::main::organize_event`,
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
              maxSupply: "",
              price: "",
            });
            setImageFile(null);
            setUploadedImageUrl("");
            const fileInput = document.getElementById("image-input") as HTMLInputElement;
            if (fileInput) fileInput.value = "";
          },
          onError: (err) => {
            setError(`Transaction failed: ${err.message}`);
            setIsCreating(false);
          },
        }
      );
    } catch (err) {
      setError(`Failed to create event: ${(err as Error).message}`);
      setIsCreating(false);
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
              Admin Access Required
            </Heading>
            <Text style={{ color: "var(--suicket-text-secondary)" }}>
              Please connect your wallet to create events
            </Text>
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

        <Card
          style={{
            background: "var(--suicket-bg-primary)",
            border: "1px solid var(--suicket-border-light)",
            boxShadow: "var(--suicket-shadow-md)",
          }}
        >
          <Flex direction="column" gap="4" p="4">
            <Flex direction="column" gap="2">
              <Flex align="center" gap="2">
                <Ticket size={16} style={{ color: "var(--suicket-primary-500)" }} />
                <Text size="2" weight="bold">
                  Event Name *
                </Text>
              </Flex>
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
              <Flex align="center" gap="2">
                <Ticket size={16} style={{ color: "var(--suicket-accent-500)" }} />
                <Text size="2" weight="bold">
                  Max Supply (Total Tickets) *
                </Text>
              </Flex>
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
              <Flex align="center" gap="2">
                <DollarSign size={16} style={{ color: "var(--suicket-success-500)" }} />
                <Text size="2" weight="bold">
                  Price (in SUI) *
                </Text>
              </Flex>
              <TextField.Root
                name="price"
                type="number"
                step="0.1"
                min="0"
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
              <Flex align="center" gap="2">
                <Image size={16} style={{ color: "var(--suicket-secondary-500)" }} />
                <Text size="2" weight="bold">
                  Event Image (optional)
                </Text>
              </Flex>
              <input
                id="image-input"
                type="file"
                accept="image/*"
                onChange={handleImageChange}
                style={{
                  padding: "8px",
                  borderRadius: "var(--suicket-radius-md)",
                  border: "1px solid var(--suicket-border-medium)",
                  background: "var(--suicket-bg-secondary)",
                  cursor: "pointer",
                }}
              />
              <Text size="1" style={{ color: "var(--suicket-text-tertiary)" }}>
                Image will be uploaded to Walrus (stored for {WALRUS_EPOCHS} epochs)
              </Text>
              {imageFile && (
                <Flex align="center" gap="2">
                  <Upload size={14} style={{ color: "var(--suicket-success-500)" }} />
                  <Text size="1" style={{ color: "var(--suicket-success-600)" }}>
                    Selected: {imageFile.name}
                  </Text>
                </Flex>
              )}
              {uploadedImageUrl && (
                <Flex align="center" gap="2">
                  <CheckCircle2 size={14} style={{ color: "var(--suicket-success-500)" }} />
                  <Text size="1" style={{ color: "var(--suicket-success-600)" }}>
                    Uploaded to Walrus
                  </Text>
                </Flex>
              )}
            </Flex>

            <Button
              size="3"
              onClick={handleCreateEvent}
              disabled={isCreating}
              style={{
                cursor: isCreating ? "wait" : "pointer",
                background: "var(--suicket-gradient-primary)",
                color: "white",
                border: "none",
                fontWeight: "600",
                boxShadow: !isCreating ? "var(--suicket-shadow-blue)" : "none",
              }}
            >
              {isCreating ? (
                <Flex align="center" gap="2">
                  <ClipLoader size={20} color="white" />
                  <Text>Creating Event...</Text>
                </Flex>
              ) : (
                <Flex align="center" gap="2">
                  <PlusCircle size={20} />
                  <Text>Create Event</Text>
                </Flex>
              )}
            </Button>
          </Flex>
        </Card>

        <Card
          style={{
            background: "var(--suicket-gradient-primary)",
            border: "none",
            boxShadow: "var(--suicket-shadow-blue)",
          }}
        >
          <Flex direction="column" gap="3" p="5">
            <Flex align="center" gap="2">
              <Info size={20} style={{ color: "white" }} />
              <Heading size="4" style={{ color: "white" }}>
                Instructions
              </Heading>
            </Flex>
            <Flex direction="column" gap="2">
              <Text size="2" style={{ color: "rgba(255, 255, 255, 0.95)" }}>
                1. Fill in all required fields marked with *
              </Text>
              <Text size="2" style={{ color: "rgba(255, 255, 255, 0.95)" }}>
                2. Optionally upload an event image (will be stored on Walrus)
              </Text>
              <Text size="2" style={{ color: "rgba(255, 255, 255, 0.95)" }}>
                3. Set the max supply to limit total tickets available
              </Text>
              <Text size="2" style={{ color: "rgba(255, 255, 255, 0.95)" }}>
                4. Set price to 0 for free events, or enter amount in SUI
              </Text>
              <Text size="2" style={{ color: "rgba(255, 255, 255, 0.95)" }}>
                5. Click "Create Event" to upload image and publish on-chain
              </Text>
            </Flex>
          </Flex>
        </Card>
      </Flex>
    </Container>
  );
}

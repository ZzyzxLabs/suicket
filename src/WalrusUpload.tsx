// Walrus blob upload component
import { useState } from "react";
import {
  Button,
  Container,
  Flex,
  Heading,
  Text,
  Card,
  TextField,
  Grid,
  Badge,
} from "@radix-ui/themes";
import ClipLoader from "react-spinners/ClipLoader";

const SUI_NETWORK = "testnet";
const SUI_VIEW_TX_URL = `https://suiscan.xyz/${SUI_NETWORK}/tx`;
const SUI_VIEW_OBJECT_URL = `https://suiscan.xyz/${SUI_NETWORK}/object`;

interface UploadedBlob {
  status: string;
  blobId: string;
  endEpoch: string;
  suiRefType: string;
  suiRef: string;
  suiBaseUrl: string;
  blobUrl: string;
  mediaType: string;
}

export function WalrusUpload() {
  const [publisherUrl, setPublisherUrl] = useState(
    "https://publisher.walrus-testnet.walrus.space"
  );
  const [aggregatorUrl, setAggregatorUrl] = useState(
    "https://aggregator.walrus-testnet.walrus.space"
  );
  const [epochs, setEpochs] = useState("1");
  const [sendTo, setSendTo] = useState("");
  const [file, setFile] = useState<File | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [error, setError] = useState<string>("");
  const [uploadedBlobs, setUploadedBlobs] = useState<UploadedBlob[]>([]);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setFile(e.target.files[0]);
    }
  };

  const storeBlob = async (): Promise<{
    info: any;
    media_type: string;
  }> => {
    if (!file) {
      throw new Error("No file selected");
    }

    const sendToParam = sendTo.trim() ? `&send_object_to=${sendTo.trim()}` : "";
    const response = await fetch(
      `${publisherUrl}/v1/blobs?epochs=${epochs}${sendToParam}`,
      {
        method: "PUT",
        body: file,
      }
    );

    if (response.status === 200) {
      const info = await response.json();
      console.log(info);
      return { info, media_type: file.type };
    } else {
      throw new Error("Something went wrong when storing the blob!");
    }
  };

  const handleUpload = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!file) {
      setError("Please select a file");
      return;
    }

    setIsUploading(true);
    setError("");

    try {
      const storageInfo = await storeBlob();
      const uploadInfo = displayUpload(storageInfo.info, storageInfo.media_type);
      setUploadedBlobs((prev) => [uploadInfo, ...prev]);

      // Reset form
      setFile(null);
      const fileInput = document.getElementById("file-input") as HTMLInputElement;
      if (fileInput) fileInput.value = "";
    } catch (err) {
      console.error(err);
      setError(
        "An error occurred while uploading. Check the browser console and ensure that the aggregator and publisher URLs are correct."
      );
    } finally {
      setIsUploading(false);
    }
  };

  const displayUpload = (storage_info: any, media_type: string): UploadedBlob => {
    let info: UploadedBlob;

    if ("alreadyCertified" in storage_info) {
      info = {
        status: "Already certified",
        blobId: storage_info.alreadyCertified.blobId,
        endEpoch: storage_info.alreadyCertified.endEpoch,
        suiRefType: "Previous Sui Certified Event",
        suiRef: storage_info.alreadyCertified.event.txDigest,
        suiBaseUrl: SUI_VIEW_TX_URL,
        blobUrl: `${aggregatorUrl}/v1/blobs/${storage_info.alreadyCertified.blobId}`,
        mediaType: media_type,
      };
    } else if ("newlyCreated" in storage_info) {
      info = {
        status: "Newly created",
        blobId: storage_info.newlyCreated.blobObject.blobId,
        endEpoch: storage_info.newlyCreated.blobObject.storage.endEpoch,
        suiRefType: "Associated Sui Object",
        suiRef: storage_info.newlyCreated.blobObject.id,
        suiBaseUrl: SUI_VIEW_OBJECT_URL,
        blobUrl: `${aggregatorUrl}/v1/blobs/${storage_info.newlyCreated.blobObject.blobId}`,
        mediaType: media_type,
      };
    } else {
      throw Error("Unhandled successful response!");
    }

    return info;
  };

  return (
    <Container>
      <Flex direction="column" gap="4" py="6">
        <Heading size="8" align="center">
          Walrus Blob Upload
        </Heading>

        <Text size="2" color="gray" align="center">
          An example uploading and displaying files with Walrus
        </Text>

        <Grid columns={{ initial: "1", lg: "2" }} gap="4">
          {/* Upload Form */}
          <Card>
            <Flex direction="column" gap="4" p="4">
              <Heading size="4">Blob Upload</Heading>

              <Text size="2" color="gray">
                Upload blobs to Walrus, and display them on this page. See the{" "}
                <a
                  href="https://docs.wal.app"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  Walrus documentation
                </a>{" "}
                for more information. The file size is limited to 10 MiB on the
                default publisher.
              </Text>

              <form onSubmit={handleUpload}>
                <Flex direction="column" gap="3">
                  <Flex direction="column" gap="2">
                    <Text size="2" weight="bold">
                      Walrus publisher URL
                    </Text>
                    <TextField.Root
                      type="url"
                      placeholder="https://publisher.walrus-testnet.walrus.space"
                      value={publisherUrl}
                      onChange={(e) => setPublisherUrl(e.target.value)}
                      required
                      size="3"
                    />
                  </Flex>

                  <Flex direction="column" gap="2">
                    <Text size="2" weight="bold">
                      Walrus aggregator URL
                    </Text>
                    <TextField.Root
                      type="url"
                      placeholder="https://aggregator.walrus-testnet.walrus.space"
                      value={aggregatorUrl}
                      onChange={(e) => setAggregatorUrl(e.target.value)}
                      required
                      size="3"
                    />
                  </Flex>

                  <Flex direction="column" gap="2">
                    <Text size="2" weight="bold">
                      Blob to upload (Max 10 MiB size on default publisher!)
                    </Text>
                    <input
                      id="file-input"
                      type="file"
                      onChange={handleFileChange}
                      required
                      style={{
                        padding: "8px",
                        borderRadius: "4px",
                        border: "1px solid var(--gray-a6)",
                      }}
                    />
                  </Flex>

                  <Flex direction="column" gap="2">
                    <Text size="2" weight="bold">
                      Epochs
                    </Text>
                    <TextField.Root
                      type="number"
                      min="1"
                      placeholder="1"
                      value={epochs}
                      onChange={(e) => setEpochs(e.target.value)}
                      required
                      size="3"
                    />
                    <Text size="1" color="gray">
                      The number of Walrus epochs for which to store the blob
                    </Text>
                  </Flex>

                  <Flex direction="column" gap="2">
                    <Text size="2" weight="bold">
                      Send to (optional)
                    </Text>
                    <TextField.Root
                      placeholder="0x..."
                      value={sendTo}
                      onChange={(e) => setSendTo(e.target.value)}
                      size="3"
                    />
                    <Text size="1" color="gray">
                      The address to which the newly created Blob object should be
                      sent
                    </Text>
                  </Flex>

                  {error && (
                    <Card style={{ backgroundColor: "var(--red-3)" }}>
                      <Text color="red" size="2">
                        {error}
                      </Text>
                    </Card>
                  )}

                  <Button
                    size="3"
                    type="submit"
                    disabled={isUploading || !file}
                    style={{ cursor: isUploading ? "wait" : "pointer" }}
                  >
                    {isUploading ? (
                      <Flex align="center" gap="2">
                        <ClipLoader size={20} color="white" />
                        <Text>Uploading...</Text>
                      </Flex>
                    ) : (
                      "Upload"
                    )}
                  </Button>
                </Flex>
              </form>
            </Flex>
          </Card>

          {/* Uploaded Blobs */}
          <Card>
            <Flex direction="column" gap="4" p="4">
              <Heading size="4">Uploaded Blobs</Heading>

              {uploadedBlobs.length === 0 ? (
                <Text size="2" color="gray">
                  No blobs uploaded yet. Upload a file to see it here!
                </Text>
              ) : (
                <Flex direction="column" gap="3">
                  {uploadedBlobs.map((blob, index) => (
                    <Card key={index}>
                      <Flex direction="column" gap="3" p="3">
                        {blob.mediaType.startsWith("image") && (
                          <img
                            src={blob.blobUrl}
                            alt={`Blob ${blob.blobId}`}
                            style={{
                              width: "100%",
                              maxHeight: "200px",
                              objectFit: "cover",
                              borderRadius: "var(--radius-2)",
                            }}
                          />
                        )}

                        <Flex direction="column" gap="2">
                          <Flex justify="between" align="center">
                            <Text size="2" weight="bold">
                              Status
                            </Text>
                            <Badge
                              color={
                                blob.status === "Newly created" ? "green" : "blue"
                              }
                            >
                              {blob.status}
                            </Badge>
                          </Flex>

                          <Flex direction="column" gap="1">
                            <Text size="2" weight="bold">
                              Blob ID
                            </Text>
                            <Text
                              size="1"
                              style={{
                                wordBreak: "break-all",
                                fontFamily: "monospace",
                              }}
                            >
                              <a
                                href={blob.blobUrl}
                                target="_blank"
                                rel="noopener noreferrer"
                              >
                                {blob.blobId}
                              </a>
                            </Text>
                          </Flex>

                          <Flex direction="column" gap="1">
                            <Text size="2" weight="bold">
                              {blob.suiRefType}
                            </Text>
                            <Text
                              size="1"
                              style={{
                                wordBreak: "break-all",
                                fontFamily: "monospace",
                              }}
                            >
                              <a
                                href={`${blob.suiBaseUrl}/${blob.suiRef}`}
                                target="_blank"
                                rel="noopener noreferrer"
                              >
                                {blob.suiRef}
                              </a>
                            </Text>
                          </Flex>

                          <Flex justify="between" align="center">
                            <Text size="2" weight="bold">
                              Stored until epoch
                            </Text>
                            <Text size="2">{blob.endEpoch}</Text>
                          </Flex>
                        </Flex>
                      </Flex>
                    </Card>
                  ))}
                </Flex>
              )}
            </Flex>
          </Card>
        </Grid>
      </Flex>
    </Container>
  );
}

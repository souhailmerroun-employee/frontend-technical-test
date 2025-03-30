import {
  Box,
  Button,
  Flex,
  Heading,
  HStack,
  Icon,
  IconButton,
  Input,
  Textarea,
  VStack,
} from "@chakra-ui/react";
import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { MemeEditor } from "../../components/meme-editor";
import { useMemo, useState } from "react";
import { MemePictureProps } from "../../components/meme-picture";
import { Plus, Trash } from "@phosphor-icons/react";
import { useAuthToken } from "../../contexts/authentication";
import { createMeme } from "../../api";

export const Route = createFileRoute("/_authentication/create")({
  component: CreateMemePage,
});

type Picture = {
  url: string;
  file: File;
};

function CreateMemePage() {
  const navigate = useNavigate();
  const token = useAuthToken();

  const [picture, setPicture] = useState<Picture | null>(null);
  const [texts, setTexts] = useState<MemePictureProps["texts"]>([]);
  const [description, setDescription] = useState("");

  const handleDrop = (file: File) => {
    setPicture({
      url: URL.createObjectURL(file),
      file,
    });
  };

  const handleAddCaptionButtonClick = () => {
    setTexts((prev) => [
      ...prev,
      {
        content: `New caption ${prev.length + 1}`,
        x: Math.random() * 400,
        y: Math.random() * 225,
      },
    ]);
  };

  const handleDeleteCaptionButtonClick = (index: number) => {
    setTexts((prev) => prev.filter((_, i) => i !== index));
  };

  const memePicture = useMemo(() => {
    if (!picture) return undefined;
    return {
      pictureUrl: picture.url,
      texts,
    };
  }, [picture, texts]);

  const handleSubmit = async () => {
    if (!token) {
      alert("You must be logged in to create a meme!");
      return;
    }
    if (!picture) {
      alert("Please upload a picture first.");
      return;
    }

    try {
      const response = await createMeme(token, picture.file, description, texts);
      console.log("Created meme:", response);
      navigate({ to: "/", replace: true });
    } catch (error) {
      console.error("Error creating meme:", error);
      alert("Something went wrong creating your meme. Please try again.");
    }
  };

  return (
    <Flex width="full" height="full">
      <Box flexGrow={1} height="full" p={4} overflowY="auto">
        <VStack spacing={5} align="stretch">
          <Box>
            <Heading as="h2" size="md" mb={2}>
              Upload your picture
            </Heading>
            <MemeEditor
              onDrop={handleDrop}
              memePicture={memePicture}
            />
          </Box>

          <Box>
            <Heading as="h2" size="md" mb={2}>
              Describe your meme
            </Heading>
            <Textarea
              placeholder="Type your description here..."
              value={description}
              onChange={(e) => setDescription(e.target.value)}
            />
          </Box>
        </VStack>
      </Box>

      <Flex
        flexDir="column"
        width="30%"
        minW="250"
        height="full"
        boxShadow="lg"
      >
        <Heading as="h2" size="md" mb={2} p={4}>
          Add your captions
        </Heading>

        <Box p={4} flexGrow={1} height={0} overflowY="auto">
          <VStack width="full" spacing={3}>
            {texts.map((text, index) => (
              <Flex width="full" key={index}>
                <Input
                  value={text.content}
                  mr={1}
                  onChange={(e) => {
                    const updatedContent = e.target.value;
                    setTexts((prev) => {
                      const updated = [...prev];
                      updated[index] = { ...updated[index], content: updatedContent };
                      return updated;
                    });
                  }}
                />
                <IconButton
                  onClick={() => handleDeleteCaptionButtonClick(index)}
                  aria-label="Delete caption"
                  icon={<Icon as={Trash} />}
                />
              </Flex>
            ))}

            <Button
              colorScheme="cyan"
              leftIcon={<Icon as={Plus} />}
              variant="ghost"
              size="sm"
              width="full"
              onClick={handleAddCaptionButtonClick}
              isDisabled={!memePicture}
            >
              Add a caption
            </Button>
          </VStack>
        </Box>

        <HStack p={4}>
          <Button
            as={Link}
            to="/"
            colorScheme="cyan"
            variant="outline"
            size="sm"
            width="full"
          >
            Cancel
          </Button>

          <Button
            colorScheme="cyan"
            size="sm"
            width="full"
            color="white"
            onClick={handleSubmit}
            isDisabled={!memePicture}
          >
            Submit
          </Button>
        </HStack>
      </Flex>
    </Flex>
  );
}


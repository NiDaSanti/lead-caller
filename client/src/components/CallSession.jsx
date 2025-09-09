import { useState } from "react";
import {
  VStack,
  Text,
  Input,
  Button,
  Box,
  useToast,
  Badge,
  Container,
  Progress,
  Avatar,
  HStack,
  Divider,
  useColorModeValue,
  Flex,
} from "@chakra-ui/react";

const questions = [
  "Who pays the electric bill?",
  "What did you think when your bill spiked?",
  "Would you be open to seeing how much you could save?",
];

export default function CallSession({ lead, onClose }) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [responses, setResponses] = useState([]);
  const [input, setInput] = useState("");
  const toast = useToast();

  const handleNext = () => {
    if (!input.trim()) return;

    const updatedResponses = [...responses, { q: questions[currentIndex], a: input }];
    setResponses(updatedResponses);
    setInput("");

    if (currentIndex + 1 < questions.length) {
      setCurrentIndex(currentIndex + 1);
    } else {
      submitAnswers(updatedResponses);
    }
  };

  const submitAnswers = async (finalResponses) => {
    const updatedLead = { ...lead, answers: finalResponses };

    try {
      const res = await fetch(`http://localhost:3000/api/leads/${lead.id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${localStorage.getItem('token')}`,
        },
        body: JSON.stringify(updatedLead),
      });

      if (res.ok) {
        toast({
          title: "Call session saved.",
          status: "success",
          duration: 3000,
          isClosable: true,
        });
        onClose();
      } else {
        throw new Error("Failed to update lead");
      }
    } catch (err) {
      toast({
        title: "Failed to save answers",
        status: "error",
        duration: 3000,
        isClosable: true,
      });
    }
  };

  const bg = useColorModeValue("white", "gray.800");
  const cardBg = useColorModeValue("gray.50", "gray.700");
  const textColor = useColorModeValue("gray.800", "gray.100");
  const inputBg = useColorModeValue("white", "gray.600");
  const borderColor = useColorModeValue("gray.200", "gray.600");

  return (
    <Container maxW="3xl" p={0} bg={bg} borderRadius="2xl" overflow="hidden" border="1px solid" borderColor={borderColor} shadow="xl">
      {/* Header */}
      <Box bg={useColorModeValue("gray.100", "gray.900")} p={6} borderBottom="1px solid" borderColor={borderColor}>
        <HStack spacing={4}>
          <Avatar name={`${lead.firstName} ${lead.lastName}`} />
          <Box>
            <Text fontSize="lg" fontWeight="bold" color={textColor}>
              ☎️ Call Session: {lead.firstName} {lead.lastName}
            </Text>
            <Text fontSize="sm" color="gray.500">
              Phone: {lead.phone}
            </Text>
          </Box>
        </HStack>
      </Box>

      {/* Main Body */}
      <Box p={8}>
        {/* Progress Bar */}
        <Progress
          value={(currentIndex / questions.length) * 100}
          colorScheme="blue"
          size="sm"
          borderRadius="full"
          mb={6}
        />

        {/* Current Question Block */}
        <Box bg={cardBg} p={6} borderRadius="xl" border="1px solid" borderColor={borderColor}>
          <Badge colorScheme="blue" fontSize="0.75rem" mb={2}>
            Question {currentIndex + 1} of {questions.length}
          </Badge>
          <Text fontSize="md" fontWeight="semibold" color={textColor}>
            {questions[currentIndex]}
          </Text>
          <Input
            mt={4}
            placeholder="Type their response..."
            value={input}
            onChange={(e) => setInput(e.target.value)}
            size="md"
            bg={inputBg}
            color={textColor}
            borderColor={borderColor}
          />
          <Button
            mt={4}
            onClick={handleNext}
            colorScheme="blue"
            size="sm"
            alignSelf="flex-end"
          >
            {currentIndex === questions.length - 1 ? "Finish" : "Next"}
          </Button>
        </Box>

        {/* Live Response Summary */}
        {responses.length > 0 && (
          <Box mt={10} p={6} bg={cardBg} borderRadius="xl" border="1px solid" borderColor={borderColor}>
            <Text fontWeight="bold" mb={4} fontSize="md" color={textColor}>
              🧾 Live Summary
            </Text>
            <VStack spacing={3} align="stretch">
              {responses.map((entry, i) => (
                <Box key={i}>
                  <Text fontSize="sm" color="gray.500">
                    <strong>Q{i + 1}:</strong> {entry.q}
                  </Text>
                  <Text fontSize="sm" color={textColor}>
                    <strong>A:</strong> {entry.a}
                  </Text>
                  <Divider my={2} />
                </Box>
              ))}
            </VStack>
          </Box>
        )}
      </Box>

      {/* Footer */}
      <Box textAlign="center" p={4} borderTop="1px solid" borderColor={borderColor} bg={useColorModeValue("gray.50", "gray.900")}>
        <Text fontSize="xs" color="gray.500">
          Powered by Solar Lead AI • {new Date().toLocaleDateString()}
        </Text>
      </Box>
    </Container>
  );
}

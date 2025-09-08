import {
  Card, CardBody, Heading, Text, Stack, Box, Badge,
  Modal, ModalOverlay, ModalContent, ModalHeader,
  ModalBody, ModalFooter, useDisclosure, useColorModeValue,
  VStack, Button, IconButton, Avatar, useToast, Divider,Tr, Td,
} from '@chakra-ui/react';
import { PhoneIcon, CloseIcon } from '@chakra-ui/icons';
import { useRef, useEffect, useState } from 'react';
import html2pdf from 'html2pdf.js';

function SoundWave() {
  const waveColor = useColorModeValue("#3182ce", "#90cdf4");
  return (
    <Box display="flex" justifyContent="center" gap="6px" alignItems="flex-end" h="30px" mt={2}>
      {[...Array(5)].map((_, i) => (
        <Box key={i} w="4px" h="100%" bg={waveColor} borderRadius="full"
          animation={`waveAnim 1.2s infinite ease-in-out ${i * 0.1}s`} />
      ))}
      <style>{`@keyframes waveAnim {
        0%, 100% { transform: scaleY(0.4); }
        50% { transform: scaleY(1); }
      }`}</style>
    </Box>
  );
}

export default function LeadCard({ lead, onUpdateLead, scrollRef, socket }) {
  const toast = useToast();
  const reportRef = useRef();
  const pollingRef = useRef(null);

  const [isCalling, setIsCalling] = useState(false);
  const [callStatus, setCallStatus] = useState("Idle");
  const [transcript, setTranscript] = useState([]);

  const { isOpen: isReportOpen, onOpen: openReport, onClose: closeReport } = useDisclosure();
  const { isOpen: isCallOpen, onOpen: openCall, onClose: closeCall } = useDisclosure();

  const cardBg = useColorModeValue("white", "gray.700");
  const modalBg = useColorModeValue("white", "gray.800");
  const textColor = useColorModeValue("gray.800", "gray.100");

  useEffect(() => {
    if (scrollRef?.current) {
      scrollRef.current.scrollIntoView({ behavior: "smooth" });
    }
  }, [scrollRef]);

  const checkCallStatus = async () => {
    try {
      const res = await fetch(`http://localhost:3000/api/leads/${lead.id}`);
      const data = await res.json();
      if (!data.callInProgress) {
        clearInterval(pollingRef.current);
        pollingRef.current = null;
        setCallStatus("Call ended");
        setIsCalling(false);
        closeCall();
        onUpdateLead(data);
      }
    } catch (err) {
      console.error("Error polling call status:", err);
    }
  };

  useEffect(() => {
    if (lead.callInProgress && isCalling) {
      openCall();
      if (!pollingRef.current) {
        pollingRef.current = setInterval(checkCallStatus, 3000);
      }
    }
    return () => {
      if (pollingRef.current) clearInterval(pollingRef.current);
    };
  }, [lead.callInProgress, isCalling]);

  const startCall = async (e) => {
    e.stopPropagation();
    setIsCalling(true);
    setCallStatus("Calling...");
    try {
      const res = await fetch("http://localhost:3000/api/phone/call", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ phoneNumber: lead.phone, leadId: lead.id })
      });
      if (!res.ok) throw new Error("Call failed");
      setCallStatus("✅ Call initiated");
    } catch (err) {
      setCallStatus("❌ Failed to connect");
    } finally {
      openCall();
    }
  };

  useEffect(() => {
    if (!socket) return;
    const handler = ({ leadId, text }) => {
      if (leadId === lead.id) {
        setTranscript((prev) => [...prev, text]);
      }
    };
    socket.on('transcript-update', handler);
    return () => {
      socket.off('transcript-update', handler);
    };
  }, [lead.id, socket]);

  const downloadPDF = () => {
    html2pdf().from(reportRef.current).set({
      margin: 0.5,
      filename: `${lead.firstName}-${lead.lastName}-report.pdf`,
      image: { type: 'jpeg', quality: 0.98 },
      html2canvas: { scale: 2 },
      jsPDF: { unit: 'in', format: 'letter', orientation: 'portrait' }
    }).save();
  };

  return (
    <>
      {/* <Card bg={cardBg} border="1px solid" borderColor={useColorModeValue("gray.200", "gray.600")}
        borderRadius="xl" boxShadow="sm" _hover={{ shadow: "lg", transform: "scale(1.01)" }}
        transition="all 0.2s ease" cursor="pointer" onClick={openReport}>
        <CardBody>
          <Stack spacing={2} fontSize="sm">
            <Heading size="sm" noOfLines={1} color={textColor}>
              🧍 {lead.firstName} {lead.lastName}
            </Heading>
            <Text fontSize="xs" color="gray.500">📞 {lead.phone}</Text>
            <Badge fontSize="0.7em" colorScheme={lead.status === "Qualified" ? "green" : "yellow"}>
              {lead.status}
            </Badge>
            <Stack direction="row" spacing={2} mt={3}>
              <Button size="xs" variant="outline" leftIcon={<PhoneIcon />} onClick={startCall} isLoading={isCalling}>
                Call
              </Button>
              <Button size="xs" colorScheme="blue" onClick={(e) => { e.stopPropagation(); openReport(); }}>
                View Report
              </Button>
            </Stack>
          </Stack>
        </CardBody>
      </Card> */}
      <Tr
        ref={scrollRef}
        onClick={openReport}
        _hover={{ bg: useColorModeValue("gray.50", "gray.700"), cursor: "pointer" }}
        transition="all 0.2s ease"
      >
        <Td fontWeight="medium">
          🧍 <strong>{lead.firstName} {lead.lastName}</strong>
        </Td>

        <Td color="gray.600" fontSize="sm">
          📞 <span>{lead.phone}</span>
        </Td>

        <Td>
          <Badge
            colorScheme={
              lead.status === "Qualified"
                ? "green"
                : lead.status === "Unqualified"
                ? "red"
                : lead.status === "Answered"
                ? "yellow"
                : "gray"
            }
            variant="subtle"
            fontSize="0.75em"
            px={3}
            py={1}
            borderRadius="md"
          >
            {lead.status?.toUpperCase()}
          </Badge>
        </Td>

        <Td>
          <Button
            size="sm"
            variant="outline"
            colorScheme="teal"
            onClick={(e) => {
              e.stopPropagation();
              startCall(e);
            }}
            mr={2}
          >
            📞 Call
          </Button>
          <Button
            size="sm"
            colorScheme="blue"
            onClick={(e) => {
              e.stopPropagation();
              openReport();
            }}
          >
            📄 View Report
          </Button>
        </Td>
      </Tr>

      <Modal isOpen={isCallOpen} onClose={closeCall} size="md" isCentered>
        <ModalOverlay />
        <ModalContent borderRadius="2xl" bg={modalBg} p={6} position="relative">
          <IconButton icon={<CloseIcon />} position="absolute" top={2} right={2} size="sm"
            variant="ghost" onClick={closeCall} />
          <ModalHeader textAlign="center" fontSize="lg" fontWeight="bold" color={textColor}>
            📞 Calling {lead.firstName}
          </ModalHeader>
          <ModalBody>
            <VStack spacing={4}>
              <Avatar name={lead.firstName} size="xl" />
              <SoundWave />
              <Text fontSize="sm" fontWeight="medium" color="gray.500">
                Status: {callStatus}
              </Text>
              <Box maxH="150px" w="100%" overflowY="auto" bg="gray.50" p={2} borderRadius="md">
                {transcript.map((line, idx) => (
                  <Text key={idx} fontSize="xs" color="gray.600">🗣 {line}</Text>
                ))}
              </Box>
            </VStack>
          </ModalBody>
        </ModalContent>
      </Modal>

      <Modal isOpen={isReportOpen} onClose={closeReport} size="6xl" isCentered>
        <ModalOverlay />
        <ModalContent p={4} bg={modalBg} ref={reportRef}>
          <Box textAlign="center" borderBottom="1px solid #ccc" pb={4} mb={4}>
            <Text fontSize="2xl" fontWeight="bold">📋 Solar Lead Report</Text>
            <Text fontSize="sm" color="gray.500">Generated by Solar Lead AI</Text>
          </Box>

          <ModalHeader>📄 Lead Report</ModalHeader>
          <ModalBody>
            <VStack align="start" spacing={4}>
              <Box>
                <Heading size="sm" mb={2}>👤 Lead Details</Heading>
                <Text><strong>Name:</strong> {lead.firstName} {lead.lastName}</Text>
                <Text><strong>Phone:</strong> {lead.phone}</Text>
                {lead.address?.street && (
                  <Text><strong>Address:</strong> {lead.address.street}, {lead.address.city}, {lead.address.state} {lead.address.zip}</Text>
                )}
                <Text><strong>Status:</strong> {lead.status}</Text>
                {lead.lastContacted && (
                  <Text><strong>Last Contacted:</strong> {new Date(lead.lastContacted).toLocaleString()}</Text>
                )}
                {lead.tags?.length > 0 && (
                  <Text><strong>Tags:</strong> {lead.tags.join(', ')}</Text>
                )}
              </Box>

              <Divider />

              <Box>
                <Heading size="sm" mb={2}>🧠 AI Call History</Heading>
                {lead.callHistory?.length ? (
                  lead.callHistory.map((entry, idx) => {
                    const aiReply = typeof entry.ai === 'object' ? entry.ai.aiReply : entry.ai;
                    const timestamp = typeof entry.ai === 'object' ? entry.ai.timestamp : entry.timestamp;
                    return (
                      <Box key={idx} mb={4}>
                        <Text fontSize="sm"><strong>🤔 You:</strong> {entry.user || "N/A"}</Text>
                        <Text fontSize="sm"><strong>🤖 AI:</strong> {aiReply || "No reply"}</Text>
                        {timestamp && (
                          <Text fontSize="xs" color="gray.500">⏱ {new Date(timestamp).toLocaleString()}</Text>
                        )}
                        <Divider mt={2} />
                      </Box>
                    );
                  })
                ) : (
                  <Text>No AI interaction history.</Text>
                )}
              </Box>

              {lead.notes && (
                <>
                  <Divider />
                  <Box>
                    <Heading size="sm" mb={2}>📝 Rep Notes</Heading>
                    <Text fontSize="sm" whiteSpace="pre-wrap">{lead.notes}</Text>
                  </Box>
                </>
              )}

              <Divider />
              <Box>
                <Heading size="sm" mb={2}>📈 Call Summary</Heading>
                <Text fontSize="sm">Exchanges: {lead.callHistory?.length || 0}</Text>
                {lead.status === "Qualified" && (
                  <Text fontSize="sm" color="green.500">✅ This lead is marked as Qualified.</Text>
                )}
              </Box>
            </VStack>
          </ModalBody>

          <Box borderTop="1px solid #ccc" mt={6} pt={3} textAlign="center" fontSize="xs" color="gray.500">
            <Text>© {new Date().getFullYear()} Nick Santiago • Solar Consultant</Text>
            <Text>Built with Solar Lead AI • Not for public distribution</Text>
          </Box>

          <ModalFooter>
            <Button colorScheme="blue" onClick={downloadPDF}>
              Download PDF
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>
    </>
  );
}

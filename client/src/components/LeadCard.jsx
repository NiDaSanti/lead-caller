import {
  Card, CardBody, Heading, Text, Stack, Box, Badge, HStack, Wrap, Tag,
  Modal, ModalOverlay, ModalContent, ModalHeader,
  ModalBody, ModalFooter, useDisclosure, useColorModeValue,
  VStack, Button, IconButton, Avatar, Divider, Input, useToast, SimpleGrid,
  AvatarGroup, Flex, Spacer, Tooltip
} from '@chakra-ui/react';
import { motion } from 'framer-motion';
import { PhoneIcon, CloseIcon } from '@chakra-ui/icons';
import { FiFileText, FiTrash2 } from 'react-icons/fi';
import { useRef, useEffect, useState } from 'react';
import html2pdf from 'html2pdf.js';

function SoundWave() {
  const waveColor = useColorModeValue('accent.400', 'highlight.200');
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

const MotionBox = motion(Box);

export default function LeadCard({ lead, onUpdateLead, onDeleteLead, scrollRef, socket }) {
  const reportRef = useRef();
  const pollingRef = useRef(null);

  const [isCalling, setIsCalling] = useState(false);
  const [callStatus, setCallStatus] = useState("Idle");
  const [transcript, setTranscript] = useState([]);
  const [followUpDateInput, setFollowUpDateInput] = useState(
    lead.followUpDate ? new Date(lead.followUpDate).toISOString().slice(0, 16) : ''
  );
  const [aiSummary, setAiSummary] = useState('');
  const [isSummaryLoading, setSummaryLoading] = useState(false);

  const { isOpen: isReportOpen, onOpen: openReport, onClose: closeReport } = useDisclosure();
  const { isOpen: isCallOpen, onOpen: openCall, onClose: closeCall } = useDisclosure();

  const cardBg = useColorModeValue("white", "brand.800");
  const headerGradient = useColorModeValue(
    "linear(to-r, accent.100, highlight.100)",
    "linear(to-r, brand.700, accent.600)"
  );
  const headerTextColor = useColorModeValue("brand.900", "highlight.50");
  const modalBg = useColorModeValue("white", "brand.900");
  const textColor = useColorModeValue("brand.900", "highlight.50");
  const borderColor = useColorModeValue("brand.200", "brand.700");
  const metaLabelColor = useColorModeValue("brand.500", "brand.200");
  const metaValueColor = useColorModeValue("brand.900", "highlight.100");
  const transcriptBg = useColorModeValue("brand.50", "brand.800");
  const accentText = useColorModeValue("accent.500", "highlight.200");
  const statusVariant = useColorModeValue("subtle", "solid");
  const badgeColor = ({
    Qualified: 'highlight',
    Scheduled: 'accent',
    Answered: 'accent',
    "Call In Progress": 'accent',
    Unqualified: 'accent',
    New: 'brand',
  })[lead.status] || 'brand';
  const toast = useToast();
  const followUpDisplay = lead.followUpDate
    ? new Date(lead.followUpDate).toLocaleString()
    : 'Not scheduled';
  const lastContactDisplay = lead.lastContacted
    ? new Date(lead.lastContacted).toLocaleDateString()
    : 'No contact yet';

  useEffect(() => {
    if (scrollRef?.current) {
      scrollRef.current.scrollIntoView({ behavior: "smooth" });
    }
  }, [scrollRef]);

  useEffect(() => {
    setFollowUpDateInput(
      lead.followUpDate ? new Date(lead.followUpDate).toISOString().slice(0, 16) : ''
    );
  }, [lead.followUpDate]);

  const checkCallStatus = async () => {
    try {
      const res = await fetch(`http://localhost:3000/api/leads/${lead.id}`, {
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
      });
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
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify({ phoneNumber: lead.phone, leadId: lead.id })
      });
      if (!res.ok) throw new Error("Call failed");
        setCallStatus("Call initiated");
    } catch (err) {
        setCallStatus("Failed to connect");
      setIsCalling(false);
    } finally {
      openCall();
    }
  };

  const saveFollowUpDate = async () => {
    try {
      const res = await fetch(`http://localhost:3000/api/leads/${lead.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${localStorage.getItem('token')}`,
        },
        body: JSON.stringify({
          followUpDate: followUpDateInput
            ? new Date(followUpDateInput).toISOString()
            : null,
        }),
      });
      if (!res.ok) throw new Error('Failed to update lead');
      const updated = await res.json();
      onUpdateLead(updated);
    } catch (err) {
      console.error('Failed to schedule call:', err);
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

  const generateSummary = async () => {
    setSummaryLoading(true);
    try {
      const res = await fetch(`http://localhost:3000/api/leads/${lead.id}/summary`, {
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
      });
      const data = await res.json();
      setAiSummary(data.summary || 'No summary available');
    } catch (err) {
      console.error('Failed to fetch summary:', err);
    } finally {
      setSummaryLoading(false);
    }
  };

  return (
    <>
      <MotionBox
        ref={scrollRef}
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        whileHover={{ scale: 1.02 }}
        transition={{ duration: 0.3 }}
        w="100%"
        display="flex"
        justifyContent="center"
      >
  <Box w="full" maxW={{ base: '100%', md: '2000px', lg: '2400px' }} px={{ base: 2, md: 8, lg: 12 }}>
        <Card
          bg={cardBg}
          border="1px solid"
          borderColor={borderColor}
          borderRadius="2xl"
          boxShadow={useColorModeValue('lg', 'xl')}
          overflow="hidden"
          cursor="pointer"
          onClick={openReport}
          transition="all 0.3s ease"
          _hover={{ shadow: '2xl', transform: 'translateY(-4px)' }}
        >
          <CardBody p={0}>
              <Box
                bgGradient={headerGradient}
                color={headerTextColor}
                px={4}
                py={3}
                borderBottom="1px solid"
                borderColor={borderColor}
              >
                <Flex align="center" gap={4}>
                  <AvatarGroup size={{ base: 'sm', md: 'md' }} max={3}>
                    {/* Primary lead avatar */}
                    <Tooltip label="Lead" placement="top">
                          <Avatar
                            name={`${lead.firstName} ${lead.lastName}`}
                            bg={useColorModeValue('accent.200', 'accent.700')}
                            color={headerTextColor}
                            boxSize={{ base: '44px', md: '48px' }}
                          />
                    </Tooltip>
                    {/* Avatars for tags (show first 2 tags as avatars) */}
                    {(lead.tags || []).slice(0, 2).map((tag) => (
                      <Tooltip key={tag} label={tag} placement="top">
                        <Avatar name={tag} bg={useColorModeValue('brand.100', 'brand.700')} />
                      </Tooltip>
                    ))}
                  </AvatarGroup>

                  <Box flex="1" minW={0} ml={{ base: 2, md: 4 }}>
                    <Heading
                      size="sm"
                      noOfLines={{ base: 1 }}
                      color={headerTextColor}
                      wordBreak="break-word"
                    >
                      {lead.firstName} {lead.lastName}
                    </Heading>
                    <Text
                      fontSize="xs"
                      color={useColorModeValue('brand.600', 'highlight.100')}
                      wordBreak="normal"
                      whiteSpace="nowrap"
                      overflow="hidden"
                      textOverflow="ellipsis"
                    >
                      {lead.phone}
                    </Text>
                  </Box>

                  <Badge
                    colorScheme={badgeColor}
                    variant={statusVariant}
                    borderRadius="full"
                    px={3}
                    py={1}
                    fontSize="0.7em"
                    textTransform="capitalize"
                  >
                    {lead.status || 'New'}
                  </Badge>
                </Flex>
              </Box>

            <Flex direction={{ base: 'column', md: 'row' }} gap={4} px={{ base: 4, md: 6 }} py={4} align="center">
              <Box flexBasis={{ base: '100%', md: '20%' }}>
                <Box
                  borderRadius="xl"
                  border="1px solid"
                  borderColor={borderColor}
                  bg={useColorModeValue('blackAlpha.50', 'whiteAlpha.100')}
                  p={{ base: 3, md: 4 }}
                >
                  <VStack align="start" spacing={2}>
                    <Text fontSize="xs" textTransform="uppercase" letterSpacing="widest" color={metaLabelColor}>
                      Contact
                    </Text>
                    <Text fontWeight="semibold" color={metaValueColor} wordBreak="break-word">
                      {lead.phone}
                    </Text>
                    <Text fontSize="xs" color={metaLabelColor}>Follow-up</Text>
                    <Badge mt={1} colorScheme={lead.followUpDate ? 'accent' : 'brand'} variant={statusVariant}>{followUpDisplay}</Badge>
                    <Text fontSize="xs" color={metaLabelColor}>Last contact</Text>
                    <Text fontWeight="semibold" color={metaValueColor}>{lastContactDisplay}</Text>
                  </VStack>
                </Box>
              </Box>

              <Box flexBasis={{ base: '100%', md: '62%' }}>
                <Box p={2}>
                  {lead.tags?.length ? (
                    <Wrap mb={2}>
                      {lead.tags.map((tag) => (
                        <Tag key={tag} size="sm" borderRadius="full" colorScheme="accent" variant={statusVariant}>{tag}</Tag>
                      ))}
                    </Wrap>
                  ) : null}

                  <Divider borderColor={borderColor} my={2} />

                  <Text fontSize="sm" noOfLines={3} color={metaValueColor}>{lead.notes || 'No notes available.'}</Text>
                </Box>
              </Box>

              {/* compact action column removed to avoid duplicate buttons; actions are available below as full-width buttons */}
            </Flex>

            {/* Full-width action buttons for quick access (keeps original behavior) */}
            <Stack direction={{ base: 'column', md: 'row' }} spacing={3} px={{ base: 5, md: 6 }} pb={6}>
              <Button
                size="md"
                bgGradient="linear(to-r, accent.500, accent.600)"
                color="white"
                _hover={{ bgGradient: 'linear(to-r, accent.600, accent.700)' }}
                leftIcon={<PhoneIcon />}
                onClick={(e) => { e.stopPropagation(); startCall(e); }}
                isLoading={isCalling}
                w="full"
              >
                Call lead
              </Button>
              <Button
                size="md"
                variant="outline"
                borderColor={useColorModeValue('brand.200', 'brand.600')}
                color={useColorModeValue('brand.700', 'highlight.100')}
                _hover={{ bg: useColorModeValue('brand.50', 'whiteAlpha.300') }}
                onClick={(e) => { e.stopPropagation(); openReport(); }}
                leftIcon={<FiFileText />}
                w="full"
              >
                View report
              </Button>
              <Button
                size="md"
                variant="ghost"
                color={useColorModeValue('accent.600', 'accent.200')}
                _hover={{ bg: useColorModeValue('accent.50', 'whiteAlpha.300') }}
                onClick={(e) => { e.stopPropagation(); if (window.confirm("Delete this lead?")) { onDeleteLead(lead.id); toast({ title: "Lead removed", status: "info", duration: 3000, isClosable: true }); } }}
                leftIcon={<FiTrash2 />}
                w="full"
              >
                Delete
              </Button>
            </Stack>
            <Box px={{ base: 5, md: 6 }} pb={4}>
              <Text fontSize="xs" color={metaLabelColor} textAlign="center">{lead.callHistory?.length || 0} exchanges</Text>
            </Box>
          </CardBody>
        </Card>
        </Box>
      </MotionBox>

      <Modal isOpen={isCallOpen} onClose={closeCall} size="md" isCentered>
        <ModalOverlay />
        <ModalContent borderRadius="2xl" bg={modalBg} p={6} position="relative" border="1px solid" borderColor={borderColor}>
          <IconButton icon={<CloseIcon />} position="absolute" top={2} right={2} size="sm"
            variant="ghost" onClick={closeCall} aria-label="Close call" color={metaLabelColor} />
          <ModalHeader textAlign="center" fontSize="lg" fontWeight="bold" color={textColor}>
            Calling {lead.firstName}
          </ModalHeader>
          <ModalBody>
            <VStack spacing={4}>
              <Avatar name={lead.firstName} size="xl" bg={useColorModeValue('accent.200', 'accent.700')} color={headerTextColor} />
              <SoundWave />
              <Text fontSize="sm" fontWeight="medium" color={metaLabelColor}>
                Status: {callStatus}
              </Text>
              <Box maxH="150px" w="100%" overflowY="auto" bg={transcriptBg} p={3} borderRadius="md" border="1px solid" borderColor={borderColor}>
                {transcript.map((line, idx) => (
                  <Text key={idx} fontSize="xs" color={metaValueColor}>{line}</Text>
                ))}
              </Box>
            </VStack>
          </ModalBody>
        </ModalContent>
      </Modal>

      <Modal isOpen={isReportOpen} onClose={closeReport} size="6xl" isCentered>
        <ModalOverlay />
        <ModalContent p={4} bg={modalBg} ref={reportRef} border="1px solid" borderColor={borderColor}>
          <Box textAlign="center" borderBottom="1px solid" borderColor={borderColor} pb={4} mb={4}>
            <Text fontSize="2xl" fontWeight="bold" color={textColor}>Solar Lead Report</Text>
            <Text fontSize="sm" color={metaLabelColor}>Generated by Solar Lead AI</Text>
          </Box>

          <ModalHeader>Lead Report</ModalHeader>
          <ModalBody>
            <VStack align="start" spacing={4}>
              <Box>
                <Heading size="sm" mb={2}>Lead Details</Heading>
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

              <Divider borderColor={borderColor} />

              <Box>
                <Heading size="sm" mb={2} color={textColor}>AI Call History</Heading>
                {lead.callHistory?.length ? (
                  lead.callHistory.map((entry, idx) => {
                    const aiReply = typeof entry.ai === 'object' ? entry.ai.aiReply : entry.ai;
                    const timestamp = typeof entry.ai === 'object' ? entry.ai.timestamp : entry.timestamp;
                    return (
                      <Box key={idx} mb={4}>
                        <Text fontSize="sm"><strong>You:</strong> {entry.user || "N/A"}</Text>
                        <Text fontSize="sm"><strong>AI:</strong> {aiReply || "No reply"}</Text>
                        {timestamp && (
                          <Text fontSize="xs" color="brand.200">{new Date(timestamp).toLocaleString()}</Text>
                        )}
                        <Divider mt={2} borderColor={borderColor} />
                      </Box>
                    );
                  })
                ) : (
                  <Text>No AI interaction history.</Text>
                )}
              </Box>

              <Divider borderColor={borderColor} />

              {aiSummary ? (
                <Box>
                  <Heading size="sm" mb={2} color={textColor}>AI Summary</Heading>
                  <Text fontSize="sm" whiteSpace="pre-wrap">{aiSummary}</Text>
                </Box>
              ) : (
                <Button size="sm" onClick={generateSummary} isLoading={isSummaryLoading}>
                  Generate AI Summary
                </Button>
              )}

              {lead.notes && (
                <>
                  <Divider borderColor={borderColor} />
                  <Box>
                    <Heading size="sm" mb={2} color={textColor}>Rep Notes</Heading>
                    <Text fontSize="sm" whiteSpace="pre-wrap">{lead.notes}</Text>
                  </Box>
                </>
              )}

              <Divider borderColor={borderColor} />
              <Box>
                <Heading size="sm" mb={2} color={textColor}>Call Summary</Heading>
                <Text fontSize="sm">Exchanges: {lead.callHistory?.length || 0}</Text>
                {lead.status === "Qualified" && (
                  <Text fontSize="sm" color={accentText}>This lead is marked as Qualified.</Text>
                )}
              </Box>
              <Divider borderColor={borderColor} />
              <Box w="100%">
                <Heading size="sm" mb={2} color={textColor}>Schedule Follow-Up</Heading>
                <Input
                  type="datetime-local"
                  size="sm"
                  value={followUpDateInput}
                  onChange={(e) => setFollowUpDateInput(e.target.value)}
                />
                <Button size="sm" mt={2} onClick={saveFollowUpDate}>
                  Save
                </Button>
              </Box>
            </VStack>
          </ModalBody>

          <Box borderTop="1px solid" borderColor={borderColor} mt={6} pt={3} textAlign="center" fontSize="xs" color={metaLabelColor}>
            <Text>© {new Date().getFullYear()} Nick Santiago • Solar Consultant</Text>
            <Text>Built with Solar Lead AI • Not for public distribution</Text>
          </Box>

          <ModalFooter>
            <Button bg="accent.600" color="white" _hover={{ bg: 'accent.500' }} onClick={downloadPDF}>
              Download PDF
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>
    </>
  );
}

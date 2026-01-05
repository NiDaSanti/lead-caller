import {
  Card, CardBody, Heading, Text, Stack, Box, Badge, Wrap, Tag,
  AlertDialog, AlertDialogBody, AlertDialogFooter, AlertDialogHeader,
  AlertDialogContent, AlertDialogOverlay,
  Modal, ModalOverlay, ModalContent, ModalHeader,
  ModalBody, ModalFooter, useDisclosure, useColorModeValue,
  VStack, Button, IconButton, Avatar, Divider, Input, useToast, HStack,
  AvatarGroup, Flex, Tooltip, SimpleGrid
} from '@chakra-ui/react';
import { motion } from 'framer-motion';
import { PhoneIcon, CloseIcon } from '@chakra-ui/icons';
import { FiFileText, FiTrash2 } from 'react-icons/fi';
import { useRef, useEffect, useState, useCallback } from 'react';
import PropTypes from 'prop-types';
import html2pdf from 'html2pdf.js';
import { apiFetch } from '../services/apiClient.js';

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
  const cancelDeleteRef = useRef(null);

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
  const { isOpen: isDeleteOpen, onOpen: openDelete, onClose: closeDelete } = useDisclosure();

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
  const sectionBg = useColorModeValue('surfaceMuted', 'surfaceMuted');
  const accentText = useColorModeValue("accent.500", "highlight.200");
  const statusVariant = useColorModeValue("subtle", "solid");
  const cardShadow = useColorModeValue('lg', 'xl');
  const avatarLeadBg = useColorModeValue('accent.200', 'accent.700');
  const avatarTagBg = useColorModeValue('brand.100', 'brand.700');
  const headerSubText = useColorModeValue('brand.600', 'highlight.100');
  const contactPanelBg = useColorModeValue('blackAlpha.50', 'whiteAlpha.100');
  const outlineBorder = useColorModeValue('brand.200', 'brand.600');
  const outlineColor = useColorModeValue('brand.700', 'highlight.100');
  const outlineHoverBg = useColorModeValue('brand.50', 'brand.800');
  const reportCardBg = useColorModeValue('surface', 'surface');
  const reportShadow = useColorModeValue('surface', 'surface');
  const deleteColor = useColorModeValue('accent.600', 'accent.200');
  const deleteHoverBg = useColorModeValue('accent.50', 'brand.800');
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

  const reportId = `LR-${String(lead.id ?? 'NA')}-${new Date().toISOString().slice(0, 10).replace(/-/g, '')}`;

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

  const checkCallStatus = useCallback(async () => {
    try {
      const res = await apiFetch(`/api/leads/${lead.id}`);
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
  }, [closeCall, lead.id, onUpdateLead]);

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
  }, [checkCallStatus, isCalling, lead.callInProgress, openCall]);

  const startCall = async (e) => {
    e.stopPropagation();
    setIsCalling(true);
    setCallStatus("Calling...");
    try {
      const res = await apiFetch('/api/phone/call', {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
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
      const res = await apiFetch(`/api/leads/${lead.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
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
      const res = await apiFetch(`/api/leads/${lead.id}/summary`);
      const data = await res.json();
      setAiSummary(data.summary || 'No summary available');
    } catch (err) {
      console.error('Failed to fetch summary:', err);
    } finally {
      setSummaryLoading(false);
    }
  };

  const confirmDelete = async () => {
    try {
      await onDeleteLead(lead.id);
      toast({
        title: 'Lead deleted',
        description: 'This lead was permanently removed.',
        status: 'info',
        duration: 3500,
        isClosable: true,
      });
    } finally {
      closeDelete();
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
      >
        <Box w="full">
        <Card
          bg={cardBg}
          border="1px solid"
          borderColor={borderColor}
          borderRadius="2xl"
          boxShadow={cardShadow}
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
                px={{ base: 4, md: 3 }}
                py={{ base: 3, md: 2 }}
                borderBottom="1px solid"
                borderColor={borderColor}
              >
                <Flex align="center" gap={4}>
                  <AvatarGroup size={{ base: 'sm', md: 'md' }} max={3}>
                    {/* Primary lead avatar */}
                    <Tooltip label="Lead" placement="top">
                          <Avatar
                            name={`${lead.firstName} ${lead.lastName}`}
                            bg={avatarLeadBg}
                            color={headerTextColor}
                            boxSize={{ base: '44px', md: '40px' }}
                          />
                    </Tooltip>
                    {/* Avatars for tags (show first 2 tags as avatars) */}
                    {(lead.tags || []).slice(0, 2).map((tag) => (
                      <Tooltip key={tag} label={tag} placement="top">
                        <Avatar name={tag} bg={avatarTagBg} />
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
                      color={headerSubText}
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

            <Flex direction={{ base: 'column', md: 'row' }} gap={{ base: 4, md: 3 }} px={{ base: 4, md: 3 }} py={{ base: 4, md: 3 }} align="center">
              <Box flexBasis={{ base: '100%', md: '34%' }} w="full">
                <Box
                  borderRadius="xl"
                  border="1px solid"
                  borderColor={borderColor}
                  bg={contactPanelBg}
                  p={{ base: 3, md: 3 }}
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

              <Box flexBasis={{ base: '100%', md: '66%' }} w="full">
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
            <Stack direction={{ base: 'column', md: 'row' }} spacing={2} px={{ base: 4, md: 3 }} pb={{ base: 5, md: 4 }}>
              <Button
                size="sm"
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
                size="sm"
                variant="outline"
                borderColor={outlineBorder}
                color={outlineColor}
                _hover={{ bg: outlineHoverBg }}
                onClick={(e) => { e.stopPropagation(); openReport(); }}
                leftIcon={<FiFileText />}
                w="full"
              >
                View report
              </Button>
              <Button
                size="sm"
                variant="ghost"
                color={deleteColor}
                _hover={{ bg: deleteHoverBg }}
                onClick={(e) => { e.stopPropagation(); openDelete(); }}
                leftIcon={<FiTrash2 />}
                w="full"
              >
                Delete
              </Button>
            </Stack>
            <Box px={{ base: 4, md: 3 }} pb={4}>
              <Text fontSize="xs" color={metaLabelColor} textAlign="center">{lead.callHistory?.length || 0} exchanges</Text>
            </Box>
          </CardBody>
        </Card>
        </Box>
      </MotionBox>

      <Modal isOpen={isCallOpen} onClose={closeCall} size={{ base: "full", sm: "md" }} isCentered>
        <ModalOverlay />
        <ModalContent borderRadius={{ base: 0, sm: "2xl" }} bg={modalBg} p={{ base: 4, sm: 6 }} position="relative" border="1px solid" borderColor={borderColor}>
          <IconButton icon={<CloseIcon />} position="absolute" top={2} right={2} size="sm"
            variant="ghost" onClick={closeCall} aria-label="Close call" color={metaLabelColor} />
          <ModalHeader textAlign="center" fontSize="lg" fontWeight="bold" color={textColor}>
            Calling {lead.firstName}
          </ModalHeader>
          <ModalBody>
            <VStack spacing={4}>
              <Avatar name={lead.firstName} size="xl" bg={avatarLeadBg} color={headerTextColor} />
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

      <Modal isOpen={isReportOpen} onClose={closeReport} size={{ base: "full", md: "6xl" }} isCentered>
        <ModalOverlay />
        <ModalContent p={{ base: 3, md: 4 }} bg={modalBg} ref={reportRef} border="1px solid" borderColor={borderColor} borderRadius={{ base: 0, md: "2xl" }}>
          <Box
            borderBottom="1px solid"
            borderColor={borderColor}
            pb={3}
            mb={4}
          >
            <Flex align="flex-start" justify="space-between" gap={4} flexWrap="wrap">
              <Box>
                <Text fontSize={{ base: 'lg', md: 'xl' }} fontWeight="semibold" color={textColor} letterSpacing="tight">
                  Solar Lead Report
                </Text>
                <Text fontSize="xs" color={metaLabelColor}>
                  Generated by Solar Lead AI • Report ID: <Text as="span" fontWeight="semibold" color={accentText}>{reportId}</Text>
                </Text>
                <HStack mt={2} spacing={2} flexWrap="wrap">
                  <Badge colorScheme={badgeColor} variant={statusVariant} fontSize="xs">
                    {lead.status || 'New'}
                  </Badge>
                  {lead.followUpDate ? (
                    <Badge colorScheme="highlight" variant="subtle" fontSize="xs">
                      Follow-up: {new Date(lead.followUpDate).toLocaleDateString()}
                    </Badge>
                  ) : null}
                  <Badge colorScheme="brand" variant="subtle" fontSize="xs">
                    Last contact: {lastContactDisplay}
                  </Badge>
                </HStack>
              </Box>

              <HStack spacing={2}>
                <Button size="sm" variant="outline" onClick={downloadPDF} leftIcon={<FiFileText />}>
                  Download PDF
                </Button>
                <IconButton
                  icon={<CloseIcon />}
                  aria-label="Close report"
                  size="sm"
                  variant="ghost"
                  onClick={(e) => { e.stopPropagation(); closeReport(); }}
                />
              </HStack>
            </Flex>
          </Box>

          <ModalHeader pt={0} pb={2} fontSize="sm" color={metaLabelColor}>
            Lead details & activity
          </ModalHeader>
          <ModalBody>
            <VStack align="stretch" spacing={4}>
              <Box
                bg={reportCardBg}
                border="1px solid"
                borderColor={borderColor}
                borderRadius="2xl"
                p={{ base: 4, md: 5 }}
                boxShadow={reportShadow}
              >
                <HStack justify="space-between" mb={3}>
                  <Heading size="sm" color={textColor}>Lead details</Heading>
                  {lead.tags?.length ? (
                    <HStack spacing={2} flexWrap="wrap" justify="flex-end">
                      {lead.tags.slice(0, 4).map((t) => (
                        <Tag key={t} size="sm" bg={avatarTagBg} color={outlineColor} borderRadius="full">
                          {t}
                        </Tag>
                      ))}
                    </HStack>
                  ) : null}
                </HStack>

                <SimpleGrid columns={{ base: 1, md: 2 }} spacing={3}>
                  <Box>
                    <Text fontSize="xs" color={metaLabelColor} fontWeight="semibold">Name</Text>
                    <Text fontSize="sm" color={textColor}>{lead.firstName} {lead.lastName}</Text>
                  </Box>
                  <Box>
                    <Text fontSize="xs" color={metaLabelColor} fontWeight="semibold">Phone</Text>
                    <Text fontSize="sm" color={textColor}>{lead.phone}</Text>
                  </Box>
                  {lead.address?.street ? (
                    <Box>
                      <Text fontSize="xs" color={metaLabelColor} fontWeight="semibold">Address</Text>
                      <Text fontSize="sm" color={textColor}>
                        {lead.address.street}, {lead.address.city}, {lead.address.state} {lead.address.zip}
                      </Text>
                    </Box>
                  ) : null}
                  <Box>
                    <Text fontSize="xs" color={metaLabelColor} fontWeight="semibold">Status</Text>
                    <Text fontSize="sm" color={textColor}>{lead.status || 'New'}</Text>
                  </Box>
                </SimpleGrid>
              </Box>

              <Box
                bg={reportCardBg}
                border="1px solid"
                borderColor={borderColor}
                borderRadius="2xl"
                p={{ base: 4, md: 5 }}
                boxShadow={reportShadow}
              >
                <HStack justify="space-between" mb={3}>
                  <Heading size="sm" color={textColor}>AI call history</Heading>
                  <Text fontSize="xs" color={metaLabelColor}>{lead.callHistory?.length || 0} exchanges</Text>
                </HStack>

                {lead.callHistory?.length ? (
                  <VStack align="stretch" spacing={3}>
                    {lead.callHistory.map((entry, idx) => {
                      const aiReply = typeof entry.ai === 'object' ? entry.ai.aiReply : entry.ai;
                      const timestamp = typeof entry.ai === 'object' ? entry.ai.timestamp : entry.timestamp;
                      return (
                        <Box key={idx} border="1px solid" borderColor={outlineBorder} borderRadius="xl" p={3} bg={contactPanelBg}>
                          <HStack justify="space-between" mb={2}>
                            <Text fontSize="xs" color={metaLabelColor} fontWeight="semibold">
                              Exchange {idx + 1}
                            </Text>
                            {timestamp ? (
                              <Text fontSize="xs" color={metaLabelColor}>{new Date(timestamp).toLocaleString()}</Text>
                            ) : null}
                          </HStack>
                          <Text fontSize="sm" color={textColor}><Text as="span" fontWeight="semibold">You:</Text> {entry.user || 'N/A'}</Text>
                          <Text fontSize="sm" color={textColor} mt={1}><Text as="span" fontWeight="semibold">AI:</Text> {aiReply || 'No reply'}</Text>
                        </Box>
                      );
                    })}
                  </VStack>
                ) : (
                  <Text fontSize="sm" color={metaLabelColor}>No AI interaction history.</Text>
                )}

                <Divider my={4} borderColor={borderColor} />

                {aiSummary ? (
                  <Box>
                    <Heading size="sm" mb={2} color={textColor}>AI summary</Heading>
                    <Text fontSize="sm" whiteSpace="pre-wrap" color={textColor}>{aiSummary}</Text>
                  </Box>
                ) : (
                  <Button size="sm" onClick={generateSummary} isLoading={isSummaryLoading}>
                    Generate AI summary
                  </Button>
                )}
              </Box>

              {lead.notes ? (
                <Box
                  bg={reportCardBg}
                  border="1px solid"
                  borderColor={borderColor}
                  borderRadius="2xl"
                  p={{ base: 4, md: 5 }}
                  boxShadow={reportShadow}
                >
                  <Heading size="sm" mb={2} color={textColor}>Rep notes</Heading>
                  <Text fontSize="sm" whiteSpace="pre-wrap" color={textColor}>{lead.notes}</Text>
                </Box>
              ) : null}

              <Box
                bg={reportCardBg}
                border="1px solid"
                borderColor={borderColor}
                borderRadius="2xl"
                p={{ base: 4, md: 5 }}
                boxShadow={reportShadow}
              >
                <HStack justify="space-between" mb={3}>
                  <Heading size="sm" color={textColor}>Schedule follow-up</Heading>
                  <Text fontSize="xs" color={metaLabelColor}>Save a reminder for later</Text>
                </HStack>
                <HStack align="flex-end" spacing={3} flexWrap="wrap">
                  <Box flex="1" minW={{ base: '100%', md: '280px' }}>
                    <Text fontSize="xs" color={metaLabelColor} mb={1} fontWeight="semibold">Follow-up date</Text>
                    <Input
                      type="datetime-local"
                      size="sm"
                      value={followUpDateInput}
                      onChange={(e) => setFollowUpDateInput(e.target.value)}
                      bg={sectionBg}
                    />
                  </Box>
                  <Button size="sm" onClick={saveFollowUpDate} colorScheme="accent">
                    Save
                  </Button>
                </HStack>
                <Divider my={4} borderColor={borderColor} />
                <Heading size="sm" mb={1} color={textColor}>Call summary</Heading>
                <Text fontSize="sm" color={metaLabelColor}>Exchanges: {lead.callHistory?.length || 0}</Text>
                {lead.status === "Qualified" ? (
                  <Text fontSize="sm" color={accentText} mt={1}>This lead is marked as Qualified.</Text>
                ) : null}
              </Box>
            </VStack>
          </ModalBody>

          <Box borderTop="1px solid" borderColor={borderColor} mt={6} pt={3} textAlign="center" fontSize="xs" color={metaLabelColor}>
            <Text>© {new Date().getFullYear()} Nick Santiago • Solar Consultant</Text>
            <Text>Built with Solar Lead AI • Not for public distribution</Text>
            <Text mt={1}>Report ID: {reportId}</Text>
          </Box>

          <ModalFooter>
            <HStack w="full" justify="flex-end">
              <Button bg="accent.600" color="white" _hover={{ bg: 'accent.500' }} onClick={downloadPDF}>
                Download PDF
              </Button>
            </HStack>
          </ModalFooter>
        </ModalContent>
      </Modal>

      <AlertDialog
        isOpen={isDeleteOpen}
        leastDestructiveRef={cancelDeleteRef}
        onClose={closeDelete}
        isCentered
      >
        <AlertDialogOverlay />
        <AlertDialogContent borderRadius="2xl" bg={modalBg} border="1px solid" borderColor={borderColor}>
          <AlertDialogHeader fontSize="lg" fontWeight="semibold" color={textColor}>
            Delete lead permanently?
          </AlertDialogHeader>

          <AlertDialogBody color={metaValueColor}>
            This action is <Text as="span" fontWeight="bold">permanent</Text>. The lead and its call history will be removed.
            <Box
              mt={3}
              p={3}
              borderRadius="lg"
              bg={useColorModeValue('red.50', 'red.900')}
              border="1px solid"
              borderColor={useColorModeValue('red.200', 'red.700')}
            >
              <Text fontSize="sm" color={useColorModeValue('red.800', 'red.100')}>
                Tip: If you only want to hide this lead, move it to <Text as="span" fontWeight="semibold">Unqualified</Text> instead.
              </Text>
            </Box>
          </AlertDialogBody>

          <AlertDialogFooter>
            <Button ref={cancelDeleteRef} onClick={closeDelete} variant="outline" mr={3}>
              Cancel
            </Button>
            <Button colorScheme="red" onClick={confirmDelete}>
              Delete permanently
            </Button>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}

LeadCard.propTypes = {
  lead: PropTypes.shape({
    id: PropTypes.oneOfType([PropTypes.string, PropTypes.number]).isRequired,
    firstName: PropTypes.string,
    lastName: PropTypes.string,
    phone: PropTypes.string,
    status: PropTypes.string,
    followUpDate: PropTypes.oneOfType([PropTypes.string, PropTypes.number, PropTypes.instanceOf(Date)]),
    lastContacted: PropTypes.oneOfType([PropTypes.string, PropTypes.number, PropTypes.instanceOf(Date)]),
    tags: PropTypes.arrayOf(PropTypes.string),
    notes: PropTypes.string,
    callInProgress: PropTypes.bool,
    callHistory: PropTypes.arrayOf(PropTypes.any),
    address: PropTypes.shape({
      street: PropTypes.string,
      city: PropTypes.string,
      state: PropTypes.string,
      zip: PropTypes.string,
    }),
  }).isRequired,
  onUpdateLead: PropTypes.func.isRequired,
  onDeleteLead: PropTypes.func.isRequired,
  scrollRef: PropTypes.oneOfType([
    PropTypes.func,
    PropTypes.shape({ current: PropTypes.any }),
  ]),
  socket: PropTypes.shape({
    on: PropTypes.func,
    off: PropTypes.func,
  }),
};

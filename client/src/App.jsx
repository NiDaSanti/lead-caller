// App.jsx
import {
  Box, Container, Stack, HStack, VStack, Flex, Text, Button, IconButton,
  Collapse, useColorMode, useColorModeValue, useToken,
  Modal, ModalOverlay, ModalContent, ModalHeader, ModalBody, ModalCloseButton,
  SimpleGrid, Tooltip as ChakraTooltip, Stat, StatLabel, StatNumber, StatHelpText,
  FormControl, FormLabel, Switch, GridItem, Wrap, WrapItem, Badge, Divider,
  Input, InputGroup, InputLeftElement
} from "@chakra-ui/react";
import { AddIcon, MinusIcon, MoonIcon, SunIcon } from "@chakra-ui/icons";
import { Icon } from "@chakra-ui/react";
import {
  FiBarChart2,
  FiFileText,
  FiSettings,
  FiList,
  FiCheckCircle,
  FiPhoneCall,
  FiCalendar,
  FiXCircle,
  FiStar,
  FiSearch
} from "react-icons/fi";
import { useEffect, useRef, useState } from "react";
import { io } from "socket.io-client";
import LeadForm from "./components/LeadForm";
import LeadList from "./components/LeadList";
import LeadSummary from "./components/LeadSummary";
import LeadCsvUpload from "./components/LeadCsvUpload";
import AutoCallMenu from "./components/AutoCallMenu";
import PropTypes from 'prop-types';

import {
  ResponsiveContainer, PieChart, Pie, Cell, Tooltip as RechartsTooltip,
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Legend
} from 'recharts';

function getStatusData(leads) {
  const safeLeads = Array.isArray(leads) ? leads : [];
  const grouped = safeLeads.reduce((acc, lead) => {
    const key = lead.status || "New";
    acc[key] = (acc[key] || 0) + 1;
    return acc;
  }, {});
  return Object.entries(grouped).map(([status, count]) => ({ name: status, value: count }));
}

function App({ onLogout }) {
  const { colorMode, toggleColorMode } = useColorMode();
  const formRef = useRef(null);
  const socketRef = useRef(null);

  const bg = useColorModeValue("brand.50", "brand.900");
  const cardBg = useColorModeValue("white", "brand.800");
  const headingColor = useColorModeValue("brand.900", "highlight.100");
  const borderColor = useColorModeValue("brand.200", "brand.700");
  const footerBg = useColorModeValue("white", "brand.900");
  const modalBg = useColorModeValue("white", "brand.800");
  const mutedColor = useColorModeValue("brand.600", "brand.200");
  const accentText = useColorModeValue("accent.500", "highlight.200");
  const navBg = useColorModeValue("rgba(255,255,255,0.9)", "brand.900");
  const navTextPrimary = useColorModeValue("brand.900", "highlight.100");
  const navTextSecondary = useColorModeValue("brand.600", "brand.200");
  const navButtonHover = useColorModeValue("brand.100", "whiteAlpha.100");
  const surfaceSubtle = useColorModeValue("white", "brand.900");

  const [brand500, accent500, brand300, accent300, brand700, accent700] = useToken('colors', [
    'brand.500', 'accent.500', 'brand.300', 'accent.300', 'brand.700', 'accent.700'
  ]);

  const COLORS = [brand500, accent500, brand300, accent300, brand700, accent700];

  const [leads, setLeads] = useState([]);
  const [showForm, setShowForm] = useState(() => localStorage.getItem("showForm") !== "false");
  const [showLeads, setShowLeads] = useState(() => localStorage.getItem("showLeads") !== "false");
  const [filter, setFilter] = useState(() => localStorage.getItem("leadFilter") || "All");
  const [searchQuery, setSearchQuery] = useState(() => localStorage.getItem("leadSearch") || "");
  const [modalView, setModalView] = useState(null);

  const navItems = [
    { view: "dashboard", label: "Dashboard", icon: FiBarChart2 },
    { view: "reports", label: "Reports", icon: FiFileText },
    { view: "settings", label: "Settings", icon: FiSettings },
    { view: "autoCall", label: "Auto Call Settings", icon: FiPhoneCall }
  ];

  useEffect(() => {
    const socket = io('http://localhost:3000', { transports: ['websocket'] });
    socketRef.current = socket;

    socket.on('call-ended', ({ to }) => {
      setLeads(prev => prev.map(lead => lead.phone === to ? { ...lead, callInProgress: false } : lead));
    });

    return () => {
      socket.off('call-ended');
      socket.disconnect();
    };
  }, []);

  useEffect(() => {
    const fetchLeads = async () => {
      try {
        const res = await fetch("http://localhost:3000/api/leads", {
          headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
        });
        if (!res.ok) {
          console.error('Failed to fetch leads:', res.status);
          setLeads([]);
          return;
        }
        const data = await res.json();
        setLeads(Array.isArray(data) ? data : []);
      } catch (err) {
        console.error('Error fetching leads:', err);
        setLeads([]);
      }
    };
    fetchLeads();
  }, []);

  useEffect(() => {
    if (showForm && formRef.current) formRef.current.scrollIntoView({ behavior: "smooth" });
    localStorage.setItem("showForm", showForm);
    localStorage.setItem("showLeads", showLeads);
  }, [showForm, showLeads]);

  useEffect(() => localStorage.setItem("leadFilter", filter), [filter]);
  useEffect(() => localStorage.setItem("leadSearch", searchQuery), [searchQuery]);

  const addLead = (newLead) => setLeads(prev => [...prev, newLead]);

  const updateLead = async (updated) => {
    await fetch(`http://localhost:3000/api/leads/${updated.id}`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${localStorage.getItem('token')}`
      },
      body: JSON.stringify(updated),
    });
    setLeads(prev => prev.map(l => l.id === updated.id ? updated : l));
  };

  const deleteLead = async (id) => {
    await fetch(`http://localhost:3000/api/leads/${id}`, {
      method: "DELETE",
      headers: {
        Authorization: `Bearer ${localStorage.getItem('token')}`
      }
    });
    setLeads(prev => prev.filter(l => l.id !== id));
  };

  const total = leads.length;
  const grouped = leads.reduce((acc, lead) => {
    const key = lead.status || "New";
    acc[key] = (acc[key] || 0) + 1;
    return acc;
  }, {});
  const answered = grouped["Answered"] || 0;
  const qualified = grouped["Qualified"] || 0;
  const scheduled = grouped["Scheduled"] || 0;
  const engagementRate = total ? Math.round(((answered + qualified + scheduled) / total) * 100) : 0;
  const conversionRate = answered ? Math.round((scheduled / answered) * 100) : 0;

  const metrics = [
    { label: "Total Leads", value: total },
    { label: "Qualified", value: qualified, help: total ? `${Math.round((qualified / total) * 100)}% of total` : "0%" },
    { label: "Answered", value: answered, help: total ? `${Math.round((answered / total) * 100)}% of total` : "0%" },
    { label: "Scheduled", value: scheduled, help: total ? `${Math.round((scheduled / total) * 100)}% of total` : "0%" },
    { label: "Engagement Rate", value: `${engagementRate}%`, help: "Answered + Qualified + Scheduled" },
    { label: "Conversion Rate", value: `${conversionRate}%`, help: "Scheduled ÷ Answered" }
  ];

  const primaryMetrics = metrics.slice(0, 4);
  const ratioMetrics = metrics.slice(4);

  return (
    <Box bg={bg} minH="100vh" color={useColorModeValue('brand.900', 'highlight.50')}>
      {/* NAVBAR */}
      <Flex
        justify="space-between"
        align="center"
        px={{ base: 6, md: 10 }}
        py={4}
        bg={navBg}
        borderBottom="1px solid"
        borderColor={borderColor}
        shadow="xl"
        backdropFilter="saturate(180%) blur(12px)"
        position="sticky"
        top={0}
        zIndex={10}
      >
        <HStack spacing={4}>
          <Box
            w={10}
            h={10}
            borderRadius="full"
            bg={useColorModeValue('accent.100', 'accent.700')}
            display="flex"
            alignItems="center"
            justifyContent="center"
          >
            <Icon as={FiBarChart2} color={accentText} />
          </Box>
          <Box>
            <Text fontSize={{ base: "lg", md: "xl" }} fontWeight="bold" color={navTextPrimary}>Lead Caller</Text>
            <Text fontSize="xs" color={navTextSecondary}>A disciplined solar outreach desk</Text>
          </Box>
        </HStack>
        <HStack spacing={2}>
          {navItems.map(({ view, label, icon }) => (
            <Button
              key={view}
              size="sm"
              variant="ghost"
              color={navTextSecondary}
              leftIcon={<Icon as={icon} aria-label={label} color={accentText} />}
              _hover={{ bg: navButtonHover, color: navTextPrimary }}
              onClick={() => setModalView(view)}
            >
              {label}
            </Button>
          ))}
          <ChakraTooltip label={colorMode === "light" ? "Dark Mode" : "Light Mode"}>
            <IconButton
              size="sm"
              variant="ghost"
              onClick={toggleColorMode}
              icon={colorMode === "light" ? <MoonIcon /> : <SunIcon />}
              color={accentText}
              _hover={{ bg: navButtonHover }}
              aria-label="Toggle color mode"
            />
          </ChakraTooltip>
          <Button
            size="sm"
            onClick={onLogout}
            variant="outline"
            borderColor={accentText}
            color={accentText}
            _hover={{ bg: 'accent.500', color: 'white' }}
          >
            Logout
          </Button>
        </HStack>
      </Flex>

      <Container maxW="7xl" py={{ base: 10, md: 16 }}>
        <Box
          bg={surfaceSubtle}
          color={useColorModeValue('brand.900', 'highlight.50')}
          borderRadius="3xl"
          p={{ base: 8, md: 12 }}
          mb={{ base: 12, lg: 16 }}
          border="1px solid"
          borderColor={borderColor}
          boxShadow={useColorModeValue('xl', 'md')}
        >
          <Stack spacing={8}>
            <Stack
              direction={{ base: "column", md: "row" }}
              justify="space-between"
              align={{ base: "flex-start", md: "center" }}
              spacing={{ base: 6, md: 10 }}
            >
              <VStack align="flex-start" spacing={4} maxW="3xl">
                <Badge
                  colorScheme="accent"
                  bg={useColorModeValue('accent.100', 'accent.600')}
                  color={useColorModeValue('accent.700', 'white')}
                  px={3}
                  py={1}
                  borderRadius="full"
                >
                  Premium solar outreach desk
                </Badge>
                <Text
                  fontSize={{ base: "2xl", md: "3xl", lg: "4xl" }}
                  fontWeight="extrabold"
                  lineHeight="shorter"
                  color={headingColor}
                >
                  Elevate every homeowner conversation with clarity and warmth.
                </Text>
                <Text fontSize={{ base: "sm", md: "md" }} color={mutedColor} maxW="2xl">
                  A refined workspace for organized follow-ups, confident scheduling, and genuinely helpful solar consultations.
                </Text>
                <HStack spacing={4} flexWrap="wrap">
                  <Button
                    size="sm"
                    bg="highlight.400"
                    color="brand.900"
                    _hover={{ bg: 'highlight.300' }}
                    onClick={() => setShowLeads(true)}
                  >
                    View lead pipeline
                  </Button>
                  <Button
                    size="sm"
                    variant="outline"
                    borderColor={accentText}
                    color={accentText}
                    _hover={{ bg: 'accent.400', color: 'white' }}
                    onClick={() => formRef.current?.scrollIntoView({ behavior: "smooth" })}
                  >
                    Add a homeowner
                  </Button>
                </HStack>
              </VStack>
              <VStack
                align="flex-start"
                spacing={4}
                bg={cardBg}
                borderRadius="2xl"
                p={6}
                maxW="sm"
                border="1px solid"
                borderColor={borderColor}
                shadow="lg"
              >
                <Text fontSize="xs" textTransform="uppercase" letterSpacing="widest" color={mutedColor}>
                  today's focus
                </Text>
                <Text fontSize="lg" fontWeight="bold" color={headingColor}>
                  Lead families from curiosity to confident consultations.
                </Text>
                <Text fontSize="sm" color={mutedColor}>
                  Use the live metrics to reinforce urgency, savings, and trust.
                </Text>
              </VStack>
            </Stack>
            <SimpleGrid columns={{ base: 2, md: 4 }} spacing={4}>
              {primaryMetrics.map(({ label, value, help }) => (
                <Box
                  key={label}
                  bg={cardBg}
                  borderRadius="xl"
                  p={4}
                  border="1px solid"
                  borderColor={borderColor}
                  shadow="md"
                >
                  <Stat>
                    <StatLabel color={mutedColor} fontSize="xs" textTransform="uppercase">
                      {label}
                    </StatLabel>
                    <StatNumber fontSize={{ base: "lg", md: "2xl" }}>
                      {value}
                    </StatNumber>
                    {help && (
                      <StatHelpText color={accentText} fontSize="xs">
                        {help}
                      </StatHelpText>
                    )}
                  </Stat>
                </Box>
              ))}
            </SimpleGrid>
          </Stack>
        </Box>

        <SimpleGrid columns={{ base: 1, xl: 3 }} spacing={{ base: 8, lg: 10 }} alignItems="flex-start">
          <GridItem colSpan={{ base: 1, xl: 2 }}>
            <Stack spacing={10}>
              <Box
                bg={cardBg}
                borderRadius="2xl"
                p={{ base: 6, md: 8 }}
                border="1px solid"
                borderColor={borderColor}
                shadow="lg"
              >
                <Stack spacing={4}>
                  <Badge colorScheme="accent" variant="subtle" alignSelf="flex-start" bg={useColorModeValue('accent.100','accent.600')} color={useColorModeValue('accent.700','white')}>
                    Lead filters
                  </Badge>
                  <Text fontSize="xl" fontWeight="bold" color={headingColor}>
                    Focus your homeowner outreach
                  </Text>
                  <Text fontSize="sm" color={mutedColor}>
                    Segment leads to spotlight the families ready for solar savings and personalize your follow-up.
                  </Text>
                  <Wrap spacing={3}>
                    <WrapItem w={{ base: "100%", md: "auto" }}>
                      <InputGroup size="sm" maxW={{ base: "100%", md: "sm" }}>
                        <InputLeftElement pointerEvents="none">
                          <Icon as={FiSearch} color={mutedColor} />
                        </InputLeftElement>
                        <Input
                          value={searchQuery}
                          onChange={(event) => setSearchQuery(event.target.value)}
                          placeholder="Search all lead details"
                          bg={useColorModeValue('white', 'brand.900')}
                          borderColor={borderColor}
                          _hover={{ borderColor: accentText }}
                          _focusVisible={{ borderColor: accentText, boxShadow: `0 0 0 1px ${accentText}` }}
                          _placeholder={{ color: mutedColor }}
                        />
                      </InputGroup>
                    </WrapItem>
                    {[
                      { status: "All", label: "All", icon: FiList },
                      { status: "Qualified", label: "Qualified", icon: FiCheckCircle },
                      { status: "Answered", label: "Answered", icon: FiPhoneCall },
                      { status: "Scheduled", label: "Scheduled", icon: FiCalendar },
                      { status: "Unqualified", label: "Unqualified", icon: FiXCircle },
                      { status: "New", label: "New", icon: FiStar }
                    ].map(({ status, label, icon }) => (
                      <WrapItem key={status}>
                        <Button
                          size="sm"
                          variant={filter === status ? "solid" : "outline"}
                          colorScheme="accent"
                          bg={filter === status ? 'accent.500' : 'transparent'}
                          color={filter === status ? 'white' : navTextSecondary}
                          borderColor={filter === status ? 'accent.400' : borderColor}
                          borderWidth={1}
                          onClick={() => setFilter(status)}
                          leftIcon={<Icon as={icon} aria-label={label} />}
                          borderRadius="full"
                          px={4}
                          _hover={{ bg: filter === status ? 'accent.400' : 'brand.100', color: navTextPrimary }}
                        >
                          {label}
                        </Button>
                      </WrapItem>
                    ))}
                  </Wrap>
                </Stack>
              </Box>

              <Box
                bg={cardBg}
                borderRadius="2xl"
                p={{ base: 6, md: 8 }}
                ref={formRef}
                border="1px solid"
                borderColor={borderColor}
                shadow="xl"
              >
                <Stack
                  direction={{ base: "column", md: "row" }}
                  justify="space-between"
                  align={{ base: "flex-start", md: "center" }}
                  mb={6}
                  spacing={4}
                >
                  <VStack align="start" spacing={1}>
                    <Badge colorScheme="accent" variant="subtle">Capture interest</Badge>
                    <Text fontSize="2xl" fontWeight="bold" color={headingColor}>Add New Lead</Text>
                    <Text fontSize="sm" color={mutedColor}>Collect homeowner details while their excitement is high.</Text>
                  </VStack>
                  <IconButton
                    icon={showForm ? <MinusIcon /> : <AddIcon />}
                    size="sm"
                    variant="ghost"
                    color="highlight.200"
                    onClick={() => setShowForm(!showForm)}
                    aria-label="Toggle lead form"
                  />
                </Stack>
                <Collapse in={showForm}>
                  <Stack spacing={8} position="relative">
                    <LeadForm onNewLead={addLead} />
                    <LeadCsvUpload onNewLead={addLead} />
                  </Stack>
                </Collapse>
              </Box>

              <Box
                bg={cardBg}
                borderRadius="2xl"
                p={{ base: 6, md: 8 }}
                border="1px solid"
                borderColor={borderColor}
                shadow="xl"
              >
                <Stack
                  direction={{ base: "column", md: "row" }}
                  justify="space-between"
                  align={{ base: "flex-start", md: "center" }}
                  mb={6}
                  spacing={4}
                >
                  <VStack align="start" spacing={1}>
                    <Badge colorScheme="highlight" variant="subtle">Active pipeline</Badge>
                    <Text fontSize="2xl" fontWeight="bold" color={headingColor}>Lead pipeline</Text>
                    <Text fontSize="sm" color={mutedColor}>Track conversations and spotlight ready-to-convert homeowners.</Text>
                  </VStack>
                  <IconButton
                    icon={showLeads ? <MinusIcon /> : <AddIcon />}
                    size="sm"
                    variant="ghost"
                    color="highlight.200"
                    onClick={() => setShowLeads(!showLeads)}
                    aria-label="Toggle lead list"
                  />
                </Stack>
                <Collapse in={showLeads}>
                  <LeadList
                    leads={leads}
                    onUpdateLead={updateLead}
                    onDeleteLead={deleteLead}
                    filter={filter}
                    searchQuery={searchQuery}
                    socket={socketRef.current}
                  />
                </Collapse>
                {!showLeads && (
                  <Text mt={6} fontSize="sm" color={mutedColor}>
                    Lead list hidden. Reopen it to re-engage homeowners while interest is warm.
                  </Text>
                )}
              </Box>
            </Stack>
          </GridItem>

          <GridItem colSpan={{ base: 1, xl: 1 }}>
            <VStack spacing={8} align="stretch">
              <Box
                bg={cardBg}
                borderRadius="2xl"
                p={{ base: 6, md: 8 }}
                border="1px solid"
                borderColor={borderColor}
                shadow="xl"
              >
                <Stack spacing={4}>
                  <Badge colorScheme="accent" alignSelf="flex-start" px={3} py={1} borderRadius="full">
                    Homeowner spotlight
                  </Badge>
                  <Text fontSize="lg" fontWeight="bold" color={headingColor}>
                    Lead with value and calm any hesitation before the call.
                  </Text>
                  <Text fontSize="sm" color={mutedColor}>
                    Highlight bill relief, backup power, and the simplicity of your install process. These cues keep attention where you need it.
                  </Text>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => setModalView("dashboard")}
                    alignSelf="flex-start"
                  >
                    View dashboard insights
                  </Button>
                </Stack>
              </Box>

              <Box
                bg={cardBg}
                borderRadius="2xl"
                p={{ base: 6, md: 8 }}
                border="1px solid"
                borderColor={borderColor}
                shadow="lg"
              >
                <Text fontSize="lg" fontWeight="bold" color={headingColor}>Performance pulse</Text>
                <Text fontSize="sm" color={mutedColor} mb={6}>
                  Monitor conversion health to see where homeowners are leaning in.
                </Text>
                <SimpleGrid columns={{ base: 1, md: 2 }} spacing={4}>
                  {ratioMetrics.map(({ label, value, help }) => (
                    <Box
                      key={label}
                      borderRadius="xl"
                      p={5}
                      border="1px solid"
                      borderColor={borderColor}
                      bg={useColorModeValue('brand.50', 'brand.900')}
                    >
                      <Stat>
                        <StatLabel fontWeight="medium">{label}</StatLabel>
                        <StatNumber>{value}</StatNumber>
                        {help && <StatHelpText>{help}</StatHelpText>}
                      </Stat>
                    </Box>
                  ))}
                </SimpleGrid>
              </Box>

              <Box
                bg={cardBg}
                borderRadius="2xl"
                p={{ base: 6, md: 8 }}
                border="1px solid"
                borderColor={borderColor}
                shadow="lg"
              >
                <Text fontSize="lg" fontWeight="bold" color={headingColor}>Lead journey overview</Text>
                <Text fontSize="sm" color={mutedColor} mb={6}>
                  Use the visuals to tailor your homeowner conversation and keep energy savings front and center.
                </Text>
                <Stack spacing={6}>
                  <Box h={{ base: "220px", md: "240px" }}>
                    <ResponsiveContainer width="100%" height="100%">
                      <PieChart>
                        <Pie data={getStatusData(leads)} dataKey="value" nameKey="name" outerRadius={90} label>
                          {getStatusData(leads).map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                          ))}
                        </Pie>
                        <RechartsTooltip />
                      </PieChart>
                    </ResponsiveContainer>
                  </Box>
                  <Divider />
                  <Box h={{ base: "220px", md: "240px" }}>
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart data={getStatusData(leads)} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="name" />
                        <YAxis />
                        <RechartsTooltip />
                        <Legend />
                        <Bar dataKey="value" fill={brand500} />
                      </BarChart>
                    </ResponsiveContainer>
                  </Box>
                </Stack>
              </Box>
            </VStack>
          </GridItem>
        </SimpleGrid>
      </Container>

      {/* FOOTER */}
      <Box mt={20} py={10} borderTop="1px solid" borderColor={borderColor} bg={footerBg}>
        <Container maxW="6xl" textAlign="center">
          <Text fontSize="sm" color="brand.200">Created by <strong>Nick Santiago</strong></Text>
          <Text fontSize="xs" mt={1} color={mutedColor}>Solar Consultant • Tech Builder • AI Sales Trainer</Text>
        </Container>
      </Box>

      {/* MODAL */}
      {modalView && (
        <Modal isOpen onClose={() => setModalView(null)} size="6xl" isCentered>
          <ModalOverlay />
          <ModalContent borderRadius="xl" p={{ base: 4, md: 8 }} bg={modalBg} shadow="xl" maxH="90vh" overflowY="auto">
            <ModalHeader textTransform="capitalize" fontSize="2xl">
              {navItems.find(item => item.view === modalView)?.label || modalView}
            </ModalHeader>
            <ModalCloseButton />
            <ModalBody pt={6}>
              {modalView === "reports" ? (
                <LeadSummary leads={leads} />
              ) : modalView === "dashboard" ? (
                <VStack spacing={8} align="stretch">
                  <SimpleGrid columns={{ base: 1, md: 2 }} spacing={6}>
                    <Box>
                      <ResponsiveContainer width="100%" height={300}>
                        <PieChart>
                          <Pie data={getStatusData(leads)} dataKey="value" nameKey="name" outerRadius={100} label>
                            {getStatusData(leads).map((entry, index) => (
                              <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                            ))}
                          </Pie>
                          <RechartsTooltip />
                        </PieChart>
                      </ResponsiveContainer>
                    </Box>
                    <Box>
                      <ResponsiveContainer width="100%" height={300}>
                        <BarChart data={getStatusData(leads)} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
                          <CartesianGrid strokeDasharray="3 3" />
                          <XAxis dataKey="name" />
                          <YAxis />
                          <RechartsTooltip />
                          <Legend />
                          <Bar dataKey="value" fill={brand500} />
                        </BarChart>
                      </ResponsiveContainer>
                    </Box>
                  </SimpleGrid>
                  <SimpleGrid columns={{ base: 2, md: 3 }} spacing={6}>
                    {metrics.map(({ label, value, help }) => (
                      <Box key={label} bg={cardBg} borderRadius="xl" p={6} shadow="md" border="1px solid" borderColor={borderColor}>
                        <Stat>
                          <StatLabel fontWeight="medium">{label}</StatLabel>
                          <StatNumber>{value}</StatNumber>
                          {help && <StatHelpText>{help}</StatHelpText>}
                        </Stat>
                      </Box>
                    ))}
                  </SimpleGrid>
                </VStack>
              ) : modalView === "settings" ? (
                <VStack spacing={4} align="stretch">
                  <FormControl display="flex" alignItems="center">
                    <FormLabel htmlFor="show-form-toggle" flex="1" mb="0">
                      Show Lead Form
                    </FormLabel>
                    <Switch id="show-form-toggle" isChecked={showForm} onChange={(e) => setShowForm(e.target.checked)} />
                  </FormControl>
                  <FormControl display="flex" alignItems="center">
                    <FormLabel htmlFor="show-leads-toggle" flex="1" mb="0">
                      Show Lead List
                    </FormLabel>
                    <Switch id="show-leads-toggle" isChecked={showLeads} onChange={(e) => setShowLeads(e.target.checked)} />
                  </FormControl>
                  <FormControl display="flex" alignItems="center">
                    <FormLabel htmlFor="color-mode-toggle" flex="1" mb="0">
                      Dark Mode
                    </FormLabel>
                    <Switch id="color-mode-toggle" isChecked={colorMode === 'dark'} onChange={toggleColorMode} />
                  </FormControl>
                </VStack>
              ) : modalView === "autoCall" ? (
                <AutoCallMenu />
              ) : (
                <Text>This is the <strong>{modalView}</strong> section.</Text>
              )}
            </ModalBody>
          </ModalContent>
        </Modal>
      )}
    </Box>
  );
}

App.propTypes = {
  onLogout: PropTypes.func.isRequired,
};

export default App;

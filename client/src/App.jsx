import { getApiBase, apiFetch } from './services/apiClient.js';
// App.jsx
import {
  Box, Container, Stack, HStack, VStack, Flex, Text, Button, IconButton,
  Collapse, useColorMode, useColorModeValue, useToken,
  Modal, ModalOverlay, ModalContent, ModalHeader, ModalBody, ModalCloseButton,
  SimpleGrid, Tooltip as ChakraTooltip, Stat, StatLabel, StatNumber, StatHelpText,
  Input, InputGroup, InputLeftElement, Heading, Badge, Wrap, WrapItem,
  Divider
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
import SettingsPanel from "./components/SettingsPanel";
import Footer from "./components/Footer";
import PropTypes from 'prop-types';

import {
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Tooltip as RechartsTooltip,
  BarChart,
  CartesianGrid,
  XAxis,
  YAxis,
  Bar,
} from 'recharts';

const COLORS = [
  '#3B82F6', // accent.500
  '#1D4ED8',
  '#60A5FA',
  '#0EA5E9',
  '#22C55E',
  '#14B8A6',
  '#EF4444',
  '#A855F7',
];

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

  const cardBg = useColorModeValue("white", "black");
  const headingColor = useColorModeValue("brand.900", "accent.200");
  const borderColor = useColorModeValue("brand.200", "brand.700");
  const modalBg = useColorModeValue("white", "black");
  const mutedColor = useColorModeValue("brand.600", "brand.200");
  const accentText = useColorModeValue("accent.600", "accent.300");
  const navBg = useColorModeValue("rgba(255,255,255,0.9)", "black");
  const navTextPrimary = useColorModeValue("brand.900", "brand.50");
  const navTextSecondary = useColorModeValue("brand.600", "brand.200");
  const navButtonHover = useColorModeValue("brand.100", "whiteAlpha.200");
  const appShellBg = useColorModeValue('gray.50', 'gray.800');
  const avatarBadgeBg = useColorModeValue('accent.100', 'accent.700');
  const filtersBadgeBg = useColorModeValue('accent.100', 'accent.600');
  const filtersBadgeColor = useColorModeValue('accent.700', 'white');
  const searchBg = useColorModeValue('white', 'brand.900');
  const dashboardMuted = useColorModeValue('brand.600', 'brand.200');
  const dashboardCardBg = useColorModeValue('white', 'brand.900');
  const dashboardCardHoverBg = useColorModeValue('brand.50', 'brand.800');
  const dashboardPhoneColor = useColorModeValue('brand.600', 'brand.400');
  const dashboardDateColor = useColorModeValue('brand.500', 'brand.300');

  const [brand500] = useToken('colors', ['brand.500']);

  const [leads, setLeads] = useState([]);
  const [showForm, setShowForm] = useState(() => localStorage.getItem("showForm") !== "false");
  const [showLeads, setShowLeads] = useState(() => localStorage.getItem("showLeads") !== "false");
  const [filter, setFilter] = useState(() => localStorage.getItem("leadFilter") || "All");
  const [searchQuery, setSearchQuery] = useState(() => localStorage.getItem("leadSearch") || "");
  const [modalView, setModalView] = useState(null);
  const [dashboardRange, setDashboardRange] = useState('30');

  const leadsCount = Array.isArray(leads) ? leads.length : 0;
  const statusCounts = (Array.isArray(leads) ? leads : []).reduce(
    (acc, l) => {
      const key = l?.status || 'New';
      acc[key] = (acc[key] || 0) + 1;
      return acc;
    },
    {}
  );
  const topStatuses = Object.entries(statusCounts)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 3);

  const navItems = [
    { view: "dashboard", label: "Dashboard", icon: FiBarChart2 },
    { view: "reports", label: "Reports", icon: FiFileText },
    { view: "settings", label: "Settings", icon: FiSettings },
    { view: "autoCall", label: "Auto Call Settings", icon: FiPhoneCall }
  ];

  useEffect(() => {
  const socket = io(getApiBase() || window.location.origin, { transports: ['websocket'], withCredentials: true });
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
        const res = await apiFetch('/api/leads');
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
    await apiFetch(`/api/leads/${updated.id}`, {
      method: "PUT",
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(updated),
    });
    setLeads(prev => prev.map(l => l.id === updated.id ? updated : l));
  };

  const deleteLead = async (id) => {
    await apiFetch(`/api/leads/${id}`, {
      method: "DELETE",
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

  const metrics = [
    { label: 'Total', value: total },
    { label: 'Answered', value: answered },
    { label: 'Qualified', value: qualified },
    { label: 'Scheduled', value: scheduled },
  ];

  // Keep the counts for filtering/quick sanity checks if needed later.
  // (UI metrics and charts were removed from the homepage to reduce clutter.)

  return (
    <Box display="flex" flexDirection="column" alignItems="center" justifyContent="center" minH="100vh" bg={appShellBg}>
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
            bg={avatarBadgeBg}
            display="flex"
            alignItems="center"
            justifyContent="center"
          >
            <Icon as={FiBarChart2} color={accentText} />
          </Box>
          <Box>
            <Text fontSize={{ base: "lg", md: "xl" }} fontWeight="bold" color={navTextPrimary}>Lead Caller</Text>
            <Text fontSize="xs" color={navTextSecondary}>Solar calling tool</Text>
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
          <ChakraTooltip label={colorMode === "light" ? "Dark mode" : "Light mode"}>
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
        <Stack spacing={10} w="100%">
              <Box
                bg={cardBg}
                borderRadius="2xl"
                p={{ base: 6, md: 8 }}
                border="1px solid"
                borderColor={borderColor}
                shadow="lg"
              >
                <Stack spacing={4}>
                  <Badge colorScheme="accent" variant="subtle" alignSelf="flex-start" bg={filtersBadgeBg} color={filtersBadgeColor}>
                    Filters
                  </Badge>
                  <Text fontSize="xl" fontWeight="bold" color={headingColor}>
                    Find leads
                  </Text>
                  <Text fontSize="sm" color={mutedColor}>
                    Filter and search your list.
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
                          placeholder="Search leads"
                          bg={searchBg}
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
                    <Text fontSize="sm" color={mutedColor}>Enter the lead info.</Text>
                  </VStack>
                  <IconButton
                    icon={showForm ? <MinusIcon /> : <AddIcon />}
                    size="sm"
                    variant="ghost"
                    color={useColorModeValue('highlight.700', 'highlight.200')}
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
                {!showForm && (
                  <Box mt={6}>
                    <Text fontSize="sm" color={mutedColor}>
                      Add leads here via the manual form or bulk import from a CSV.
                    </Text>
                    <HStack mt={3} spacing={2} flexWrap="wrap">
                      <Badge variant="subtle" colorScheme="accent">Manual entry</Badge>
                      <Badge variant="subtle" colorScheme="accent">CSV import</Badge>
                    </HStack>
                  </Box>
                )}
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
                    <Text fontSize="2xl" fontWeight="bold" color={headingColor}>Leads</Text>
                    <Text fontSize="sm" color={mutedColor}>View and update lead status.</Text>
                  </VStack>
                  <IconButton
                    icon={showLeads ? <MinusIcon /> : <AddIcon />}
                    size="sm"
                    variant="ghost"
                    color={useColorModeValue('highlight.700', 'highlight.200')}
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
                  <Box mt={6}>
                    <Text fontSize="sm" color={mutedColor}>
                      {leadsCount ? `${leadsCount} leads available.` : 'No leads loaded yet.'}
                      {filter && filter !== 'All' ? ` Filtered: ${filter}.` : ''}
                      {searchQuery?.trim() ? ` Search: “${searchQuery.trim()}”.` : ''}
                    </Text>
                    {leadsCount > 0 && topStatuses.length > 0 && (
                      <HStack mt={3} spacing={2} flexWrap="wrap">
                        <Text fontSize="xs" color={mutedColor}>
                          Top statuses:
                        </Text>
                        {topStatuses.map(([name, count]) => (
                          <Badge key={name} variant="subtle" colorScheme="accent">
                            {name}: {count}
                          </Badge>
                        ))}
                      </HStack>
                    )}
                  </Box>
                )}
              </Box>
        </Stack>
      </Container>

      <Footer appName="Lead Caller" />

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
                <VStack spacing={6} align="stretch">
                  <HStack justify="space-between" align="center">
                    <Box>
                      <Heading size="lg">Dashboard</Heading>
                      <Text fontSize="sm" color={dashboardMuted}>Quick summary.</Text>
                    </Box>
                    <HStack>
                      <Text fontSize="sm" color={dashboardMuted}>Range</Text>
                      <Button size="sm" variant={dashboardRange==='7' ? 'solid' : 'outline'} onClick={() => setDashboardRange('7')}>7d</Button>
                      <Button size="sm" variant={dashboardRange==='30' ? 'solid' : 'outline'} onClick={() => setDashboardRange('30')}>30d</Button>
                      <Button size="sm" variant={dashboardRange==='90' ? 'solid' : 'outline'} onClick={() => setDashboardRange('90')}>90d</Button>
                      <Button size="sm" variant="ghost" onClick={() => {
                        const csvHeader = ['name','phone','email','status','lastContacted'];
                        const rows = leads.map(l => [l.name, l.phone, l.email || '', l.status || '', l.lastContacted || '']).map(r => r.map(v => `"${String(v).replace(/"/g,'""')}"`).join(','));
                        const csv = [csvHeader.join(','), ...rows].join('\n');
                        const blob = new Blob([csv], { type: 'text/csv' });
                        const url = URL.createObjectURL(blob);
                        const a = document.createElement('a');
                        a.href = url; a.download = `leads-${new Date().toISOString().slice(0,10)}.csv`; a.click(); URL.revokeObjectURL(url);
                      }}>Export</Button>
                    </HStack>
                  </HStack>

                  <SimpleGrid columns={{ base: 1, lg: 3 }} spacing={6} alignItems="start">
                    <Box gridColumn={{ base: '1 / -1', lg: '1 / span 2' }}>
                      <SimpleGrid columns={{ base: 1, md: 2 }} spacing={6} mb={4}>
                        <Box bg={cardBg} borderRadius="xl" p={4} border="1px solid" borderColor={borderColor} boxShadow="sm">
                          <Text fontSize="sm" color={dashboardMuted}>Lead mix</Text>
                          <Box h={{ base: 220, md: 260 }}>
                            <ResponsiveContainer width="100%" height="100%">
                              <PieChart>
                                <Pie data={getStatusData(leads)} dataKey="value" nameKey="name" innerRadius={30} outerRadius={80} paddingAngle={4}>
                                  {getStatusData(leads).map((entry, index) => (
                                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                  ))}
                                </Pie>
                                <RechartsTooltip />
                              </PieChart>
                            </ResponsiveContainer>
                          </Box>
                        </Box>

                        <Box bg={cardBg} borderRadius="xl" p={4} border="1px solid" borderColor={borderColor} boxShadow="sm">
                          <Text fontSize="sm" color={dashboardMuted}>Counts</Text>
                          <Box h={{ base: 220, md: 260 }}>
                            <ResponsiveContainer width="100%" height="100%">
                              <BarChart data={getStatusData(leads)} margin={{ top: 10, right: 0, left: 0, bottom: 0 }}>
                                <CartesianGrid strokeDasharray="3 3" />
                                <XAxis dataKey="name" />
                                <YAxis />
                                <RechartsTooltip />
                                <Bar dataKey="value" fill={brand500} />
                              </BarChart>
                            </ResponsiveContainer>
                          </Box>
                        </Box>
                      </SimpleGrid>

                      <SimpleGrid columns={{ base: 2, md: 4 }} spacing={4}>
                        {metrics.map(({ label, value, help }) => (
                          <Box key={label} bg={cardBg} borderRadius="lg" p={4} border="1px solid" borderColor={borderColor}>
                            <Stat>
                              <StatLabel fontSize="xs" color={dashboardMuted}>{label}</StatLabel>
                              <StatNumber fontSize="lg">{value}</StatNumber>
                              {help && <StatHelpText fontSize="xs">{help}</StatHelpText>}
                            </Stat>
                          </Box>
                        ))}
                      </SimpleGrid>
                    </Box>

                    <Box>
                      <Box bg={cardBg} borderRadius="xl" p={4} border="1px solid" borderColor={borderColor} boxShadow="sm">
                        <HStack justify="space-between" mb={3}>
                          <Text fontWeight="bold">Recent leads</Text>
                          <Text fontSize="sm" color={dashboardMuted}>{leads.length} total</Text>
                        </HStack>
                        <VStack align="stretch" spacing={3} maxH={320} overflowY="auto">
                          {leads.slice().sort((a,b)=> new Date(b.lastContacted || b.createdAt || 0) - new Date(a.lastContacted || a.createdAt || 0)).slice(0,8).map(l => (
                            <Box key={l.id || l.phone} p={3} borderRadius="md" border="1px solid" borderColor={borderColor} bg={dashboardCardBg}
                              _hover={{ bg: dashboardCardHoverBg }}>
                              <HStack justify="space-between">
                                <Box>
                                  <Text fontWeight="semibold">{l.name || '—'}</Text>
                                  <Text fontSize="sm" color={dashboardPhoneColor}>{l.phone || ''}</Text>
                                </Box>
                                <VStack spacing={0} align="end">
                                  <Badge variant="subtle" colorScheme="accent">{l.status || 'New'}</Badge>
                                  <Text fontSize="xs" color={dashboardDateColor}>{l.lastContacted ? new Date(l.lastContacted).toLocaleDateString() : '—'}</Text>
                                </VStack>
                              </HStack>
                            </Box>
                          ))}
                        </VStack>
                        <Divider my={3} />
                        <Button size="sm" w="100%" variant="outline" onClick={() => setModalView('reports')}>Open reports</Button>
                      </Box>
                    </Box>
                  </SimpleGrid>
                </VStack>
              ) : modalView === "settings" ? (
                <SettingsPanel
                  showForm={showForm}
                  setShowForm={setShowForm}
                  showLeads={showLeads}
                  setShowLeads={setShowLeads}
                  colorMode={colorMode}
                  toggleColorMode={toggleColorMode}
                  setModalView={setModalView}
                />
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

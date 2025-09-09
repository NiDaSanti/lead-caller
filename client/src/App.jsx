// App.jsx
import {
  Box, Container, Stack, HStack, VStack, Flex, Text, Button, IconButton,
  Collapse, useColorMode, useColorModeValue, Image,
  Modal, ModalOverlay, ModalContent, ModalHeader, ModalBody, ModalCloseButton,
  SimpleGrid, Tooltip as ChakraTooltip, Stat, StatLabel, StatNumber, StatHelpText
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
  FiStar
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

const COLORS = ["#e60082", "#00bcd4", "#F6AD55", "#38A169", "#805AD5", "#FFB800"];

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

  const bg = useColorModeValue("brand.50", "gray.900");
  const cardBg = useColorModeValue("white", "gray.800");
  const headingColor = useColorModeValue("brand.700", "brand.100");
  const borderColor = useColorModeValue("brand.200", "gray.600");
  const footerBg = useColorModeValue("gray.50", "gray.800");
  const modalBg = useColorModeValue("white", "gray.900");

  const [leads, setLeads] = useState([]);
  const [showForm, setShowForm] = useState(() => localStorage.getItem("showForm") !== "false");
  const [showLeads, setShowLeads] = useState(() => localStorage.getItem("showLeads") !== "false");
  const [filter, setFilter] = useState(() => localStorage.getItem("leadFilter") || "All");
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

  return (
    <Box bg={bg} minH="100vh">
      {/* NAVBAR */}
      <Flex justify="space-between" align="center" px={8} py={4} bgGradient={useColorModeValue('linear(to-r, brand.500, accent.500)', 'gray.900')} borderBottom="1px solid" borderColor={borderColor} shadow="sm">
        <Image src="/public/faviLogo.png" alt="Logo" h="36px" />
        <HStack spacing={2}>
        {navItems.map(({ view, label, icon }) => (
          <Button
            key={view}
            size="sm"
            variant="ghost"
            leftIcon={<Icon as={icon} aria-label={label} />}
            onClick={() => setModalView(view)}
            color="white"
          >
            {label}
          </Button>
        ))}
        <ChakraTooltip label={colorMode === "light" ? "Dark Mode" : "Light Mode"}>
            <IconButton size="sm" variant="ghost" onClick={toggleColorMode} icon={colorMode === "light" ? <MoonIcon /> : <SunIcon />} color="white" />
        </ChakraTooltip>
        <Button size="sm" onClick={onLogout} color="white" variant="ghost">Logout</Button>
        </HStack>
      </Flex>

      <Container maxW="7xl" py={10}>
        {/* FILTERS */}
        <HStack spacing={3} mb={8} justify="center" wrap="wrap">
          {[
            { status: "All", label: "All", icon: FiList },
            { status: "Qualified", label: "Qualified", icon: FiCheckCircle },
            { status: "Answered", label: "Answered", icon: FiPhoneCall },
            { status: "Scheduled", label: "Scheduled", icon: FiCalendar },
            { status: "Unqualified", label: "Unqualified", icon: FiXCircle },
            { status: "New", label: "New", icon: FiStar }
          ].map(({ status, label, icon }) => (
            <Button
              key={status}
              size="sm"
              colorScheme={filter === status ? "orange" : "gray"}
              variant={filter === status ? "solid" : "outline"}
              onClick={() => setFilter(status)}
              leftIcon={<Icon as={icon} aria-label={label} />}
            >
              {label}
            </Button>
          ))}
        </HStack>

        {/* FORM */}
        <Box bg={cardBg} borderRadius="xl" p={8} mb={10} ref={formRef} border="1px solid" borderColor={borderColor} shadow="sm">
          <Stack direction="row" justify="space-between" align="center" mb={4}>
            <VStack align="start" spacing={1}>
              <Text fontSize="xl" fontWeight="bold" color={headingColor}>✍️ Add New Lead</Text>
              <Text fontSize="sm" color="gray.500">Start the conversation</Text>
            </VStack>
            <IconButton icon={showForm ? <MinusIcon /> : <AddIcon />} size="sm" onClick={() => setShowForm(!showForm)} />
          </Stack>
          <Collapse in={showForm}>
            <Stack spacing={8}>
              <LeadForm onNewLead={addLead} />
              <LeadCsvUpload onNewLead={addLead} />
            </Stack>
          </Collapse>
        </Box>

        {/* LEADS */}
        <Box bg={cardBg} borderRadius="xl" p={8} border="1px solid" borderColor={borderColor} shadow="sm">
          <Stack direction="row" justify="space-between" align="center" mb={4}>
            <Text fontSize="xl" fontWeight="bold" color={headingColor}>📁 Leads</Text>
            <IconButton icon={showLeads ? <MinusIcon /> : <AddIcon />} size="sm" onClick={() => setShowLeads(!showLeads)} />
          </Stack>

          <Collapse in={showLeads}>
            <LeadList
              leads={leads}
              onUpdateLead={updateLead}
              onDeleteLead={deleteLead}
              filter={filter}
              socket={socketRef.current}
            />
          </Collapse>

          {!showLeads && (
            <Box mt={10}>
              <Text fontSize="lg" fontWeight="bold" mb={4} color={headingColor}>📊 Lead Intelligence Snapshot</Text>
              <SimpleGrid columns={{ base: 1, md: 2 }} spacing={10} mb={8}>
                {/* Pie Chart */}
                <Box bg={cardBg} borderRadius="xl" p={6} shadow="md" border="1px solid" borderColor={borderColor}>
                  <Text fontSize="md" fontWeight="medium" mb={4}>🥧 Status Distribution</Text>
                  <ResponsiveContainer width="100%" height={250}>
                    <PieChart>
                      <Pie data={getStatusData(leads)} dataKey="value" nameKey="name" outerRadius={80} label>
                        {getStatusData(leads).map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                        ))}
                      </Pie>
                      <RechartsTooltip />
                    </PieChart>
                  </ResponsiveContainer>
                </Box>

                {/* Bar Chart */}
                <Box bg={cardBg} borderRadius="xl" p={6} shadow="md" border="1px solid" borderColor={borderColor}>
                  <Text fontSize="md" fontWeight="medium" mb={4}>📦 Leads by Status</Text>
                  <ResponsiveContainer width="100%" height={250}>
                    <BarChart data={getStatusData(leads)} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="name" />
                      <YAxis />
                      <RechartsTooltip />
                      <Legend />
                      <Bar dataKey="value" fill="#3182CE" />
                    </BarChart>
                  </ResponsiveContainer>
                </Box>
                </SimpleGrid>

                <SimpleGrid columns={{ base: 2, md: 3 }} spacing={6} mb={8}>
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

                <Button size="sm" colorScheme="brand" onClick={() => setShowLeads(true)}>Open Lead Manager</Button>
              </Box>
            )}
          </Box>
      </Container>

      {/* FOOTER */}
        <Box mt={20} py={10} borderTop="1px solid" borderColor={borderColor} bg={footerBg}>
        <Container maxW="6xl" textAlign="center">
          <Text fontSize="sm" color="gray.600">🚀 Created by <strong>Nick Santiago</strong></Text>
          <Text fontSize="xs" mt={1} color="gray.500">Solar Consultant • Tech Builder • AI Sales Trainer</Text>
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
                <Box textAlign="center">
                  <Text fontSize="lg" fontWeight="medium">📊 Dashboard metrics</Text>
                </Box>
              ) : modalView === "settings" ? (
                <Box textAlign="center">
                  <Text fontSize="lg" fontWeight="medium">⚙️ Settings</Text>
                </Box>
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

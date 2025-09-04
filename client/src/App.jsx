// App.jsx
import {
  Box, Container, Stack, HStack, VStack, Flex, Text, Button, IconButton,
  Collapse, useColorMode, useColorModeValue, Image,
  Modal, ModalOverlay, ModalContent, ModalHeader, ModalBody, ModalCloseButton,
  SimpleGrid, Tooltip as ChakraTooltip
} from "@chakra-ui/react";
import { AddIcon, MinusIcon, MoonIcon, SunIcon } from "@chakra-ui/icons";
import { useEffect, useRef, useState } from "react";
import { io } from "socket.io-client";
import LeadForm from "./components/LeadForm";
import LeadList from "./components/LeadList";
import LeadSummary from "./components/LeadSummary";

import {
  ResponsiveContainer, PieChart, Pie, Cell, Tooltip as RechartsTooltip,
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Legend
} from 'recharts';

const COLORS = ["#38A169", "#3182CE", "#D69E2E", "#E53E3E", "#805AD5", "#ECC94B"];

function getStatusData(leads) {
  const grouped = leads.reduce((acc, lead) => {
    const key = lead.status || "New";
    acc[key] = (acc[key] || 0) + 1;
    return acc;
  }, {});
  return Object.entries(grouped).map(([status, count]) => ({ name: status, value: count }));
}

function App() {
  const { colorMode, toggleColorMode } = useColorMode();
  const formRef = useRef(null);
  const socketRef = useRef(null);

  const bg = useColorModeValue("#f9fafb", "#1a202c");
  const cardBg = useColorModeValue("white", "gray.800");
  const headingColor = useColorModeValue("gray.800", "gray.100");
  const borderColor = useColorModeValue("gray.200", "gray.600");

  const [leads, setLeads] = useState([]);
  const [showForm, setShowForm] = useState(() => localStorage.getItem("showForm") !== "false");
  const [showLeads, setShowLeads] = useState(() => localStorage.getItem("showLeads") !== "false");
  const [filter, setFilter] = useState(() => localStorage.getItem("leadFilter") || "All");
  const [modalView, setModalView] = useState(null);

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
    fetch("http://localhost:3000/api/leads").then(res => res.json()).then(setLeads);
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
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(updated),
    });
    setLeads(prev => prev.map(l => l.id === updated.id ? updated : l));
  };

  return (
    <Box bg={bg} minH="100vh">
      {/* NAVBAR */}
      <Flex justify="space-between" align="center" px={8} py={4} bg={useColorModeValue("white", "gray.900")} borderBottom="1px solid" borderColor={borderColor} shadow="sm">
        <Image src="/public/faviLogo.png" alt="Logo" h="36px" />
        <HStack spacing={2}>
          {["dashboard", "reports", "settings"].map(view => (
            <Button key={view} size="sm" variant="ghost" onClick={() => setModalView(view)}>
              {view === "dashboard" && "📊 Dashboard"}
              {view === "reports" && "📋 Reports"}
              {view === "settings" && "⚙️ Settings"}
            </Button>
          ))}
          <ChakraTooltip label={colorMode === "light" ? "Dark Mode" : "Light Mode"}>
            <IconButton size="sm" variant="ghost" onClick={toggleColorMode} icon={colorMode === "light" ? <MoonIcon /> : <SunIcon />} />
          </ChakraTooltip>
        </HStack>
      </Flex>

      <Container maxW="7xl" py={10}>
        {/* FILTERS */}
        <HStack spacing={3} mb={8} justify="center" wrap="wrap">
          {["All", "Qualified", "Answered", "Scheduled", "Unqualified", "New"].map(status => (
            <Button
              key={status}
              size="sm"
              colorScheme={filter === status ? "orange" : "gray"}
              variant={filter === status ? "solid" : "outline"}
              onClick={() => setFilter(status)}
            >
              {status === "All" && "📋 All"}
              {status === "Qualified" && "✅ Qualified"}
              {status === "Answered" && "🟡 Answered"}
              {status === "Scheduled" && "📅 Scheduled"}
              {status === "Unqualified" && "❌ Unqualified"}
              {status === "New" && "🆕 New"}
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
          <Collapse in={showForm}><LeadForm onNewLead={addLead} /></Collapse>
        </Box>

        {/* LEADS */}
        <Box bg={cardBg} borderRadius="xl" p={8} border="1px solid" borderColor={borderColor} shadow="sm">
          <Stack direction="row" justify="space-between" align="center" mb={4}>
            <Text fontSize="xl" fontWeight="bold" color={headingColor}>📁 Leads</Text>
            <IconButton icon={showLeads ? <MinusIcon /> : <AddIcon />} size="sm" onClick={() => setShowLeads(!showLeads)} />
          </Stack>

          <Collapse in={showLeads}>
            <LeadList leads={leads} onUpdateLead={updateLead} filter={filter} />
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

              <Button size="sm" colorScheme="blue" onClick={() => setShowLeads(true)}>Open Lead Manager</Button>
            </Box>
          )}
        </Box>
      </Container>

      {/* FOOTER */}
      <Box mt={20} py={10} borderTop="1px solid" borderColor={borderColor} bg={useColorModeValue("gray.50", "gray.800")}>
        <Container maxW="6xl" textAlign="center">
          <Text fontSize="sm" color="gray.600">🚀 Created by <strong>Nick Santiago</strong></Text>
          <Text fontSize="xs" mt={1} color="gray.500">Solar Consultant • Tech Builder • AI Sales Trainer</Text>
        </Container>
      </Box>

      {/* MODAL */}
      {modalView && (
        <Modal isOpen onClose={() => setModalView(null)} size="6xl" isCentered>
          <ModalOverlay />
          <ModalContent borderRadius="xl" p={{ base: 4, md: 8 }} bg={useColorModeValue("white", "gray.900")} shadow="xl" maxH="90vh" overflowY="auto">
            <ModalHeader textTransform="capitalize" fontSize="2xl">{modalView}</ModalHeader>
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

export default App;

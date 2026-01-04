import {
  Box,
  Text,
  Stat,
  StatLabel,
  StatNumber,
  StatHelpText,
  SimpleGrid,
  useColorModeValue,
  SlideFade,
  VStack,
  Divider,
  Heading,
  HStack,
  Icon,
  Button,
  Grid,
  GridItem,
  useToken,
  Badge,
} from "@chakra-ui/react";
import { FiDownload } from 'react-icons/fi';

import {
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Tooltip as RechartsTooltip,
  BarChart,
  Bar,
  XAxis,
} from 'recharts';

import PropTypes from 'prop-types';

export default function LeadSummary({ leads }) {
  const cardBg = useColorModeValue("white", "brand.900");
  const borderColor = useColorModeValue("brand.200", "brand.700");
  const labelColor = useColorModeValue("brand.600", "brand.200");
  const helperColor = useColorModeValue('brand.500', 'brand.200');
  const headingColor = useColorModeValue('highlight.800', 'highlight.200');
  const insightBg = useColorModeValue('white', 'brand.900');
  const surfaceShadow = useColorModeValue('sm', 'md');

  const [brand500, accent500, brand300, accent300, brand700, accent700] = useToken('colors', [
    'brand.500', 'accent.500', 'brand.300', 'accent.300', 'brand.700', 'accent.700'
  ]);

  const COLORS = [brand500, accent500, brand300, accent300, brand700, accent700];

  const total = leads.length;
  const grouped = leads.reduce((acc, lead) => {
    const key = lead.status || "New";
    acc[key] = (acc[key] || 0) + 1;
    return acc;
  }, {});

  const answered = grouped["Answered"] || 0;
  const qualified = grouped["Qualified"] || 0;
  const scheduled = grouped["Scheduled"] || 0;

  const engagementRate = Math.round(((answered + qualified + scheduled) / total) * 100);
  const conversionRate = answered ? Math.round((scheduled / answered) * 100) : 0;

  const noFollowUp = leads.filter((l) => !l.status || !l.notes).length;
  const avgNotesLength = Math.round(
    leads.reduce((sum, l) => sum + (l.notes?.length || 0), 0) / total || 0
  );

  const dateValues = leads
    .map((l) => new Date(l.lastContacted))
    .filter((d) => !isNaN(d));
  const earliest = dateValues.length
    ? new Date(Math.min(...dateValues)).toLocaleDateString()
    : "N/A";
  const latest = dateValues.length
    ? new Date(Math.max(...dateValues)).toLocaleDateString()
    : "N/A";

  const statuses = [
    { label: "Total Leads", value: total },
    { label: "Qualified", value: qualified },
    { label: "Answered", value: answered },
    { label: "Scheduled", value: scheduled },
    { label: "Unqualified", value: grouped["Unqualified"] || 0 },
    { label: "New", value: grouped["New"] || 0 },
  ];

  const insights = [
    { label: "Engagement", value: `${engagementRate}%`, help: "Answered + Qualified + Scheduled" },
    { label: "Conversion", value: `${conversionRate}%`, help: "Scheduled ÷ Answered" },
    { label: "Needs follow-up", value: noFollowUp, help: "Missing status or notes" },
    { label: "Avg. note length", value: `${avgNotesLength} chars`, help: "Avg. note size" },
    { label: "First contact", value: earliest, help: "Oldest contact date" },
    { label: "Last contact", value: latest, help: "Newest contact date" },
  ];

  const distribution = statuses.map((s) => ({ name: s.label, value: s.value }));

  const handleExport = () => {
    const payload = { leads, stats: { total, answered, qualified, scheduled, grouped } };
    const blob = new Blob([JSON.stringify(payload, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `lead-report-${new Date().toISOString().slice(0,10)}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <Box mt={4} px={{ base: 1, sm: 3, md: 6 }}>
      <VStack align="start" spacing={6}>
        <HStack justify="space-between" w="100%">
          <Box>
            <Heading size="md" mb={1} color={headingColor} letterSpacing="tight">Reports</Heading>
            <Text fontSize="sm" color={helperColor}>Quick totals and trends.</Text>
          </Box>
          <HStack>
            <Button size="sm" leftIcon={<Icon as={FiDownload} />} onClick={handleExport} variant="outline">
              Export
            </Button>
            <Badge colorScheme="accent" variant="subtle" fontSize="xs">{total} leads</Badge>
          </HStack>
        </HStack>

        <Grid templateColumns={{ base: '1fr', md: '2fr 1fr' }} gap={5} w="100%">
          <GridItem>
            <SimpleGrid columns={{ base: 1, sm: 2, md: 3 }} spacing={4}>
              {statuses.map((stat, i) => (
                <SlideFade in={true} offsetY="8px" key={stat.label} delay={0.04 * i}>
                  <Box
                    bg={cardBg}
                    borderRadius="lg"
                    border="1px solid"
                    borderColor={borderColor}
                    overflow="hidden"
                    boxShadow={surfaceShadow}
                    _hover={{ boxShadow: surfaceShadow }}
                  >
                    <HStack align="stretch">
                      <Box w={2} bg={COLORS[i % COLORS.length]} />
                      <Box p={3} flex="1">
                        <Stat>
                          <StatLabel fontSize="xs" fontWeight="semibold" textTransform="uppercase" letterSpacing="wider" color={labelColor}>{stat.label}</StatLabel>
                          <HStack justify="space-between">
                            <StatNumber fontSize={{ base: 'lg', md: 'xl' }}>{stat.value}</StatNumber>
                            <Text fontSize="xs" color={helperColor}>{total ? `${Math.round((stat.value / total) * 100)}%` : '0%'}</Text>
                          </HStack>
                          <StatHelpText fontSize="xs" color={helperColor}>of total leads</StatHelpText>
                        </Stat>
                      </Box>
                    </HStack>
                  </Box>
                </SlideFade>
              ))}
            </SimpleGrid>
          </GridItem>

          <GridItem>
            <Box bg={cardBg} p={4} borderRadius="lg" border="1px solid" borderColor={borderColor} boxShadow={surfaceShadow}>
              <Text fontSize="xs" fontWeight="semibold" textTransform="uppercase" letterSpacing="wider" color={labelColor} mb={2}>Pipeline distribution</Text>
              <Box h={220}>
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie data={distribution} dataKey="value" nameKey="name" innerRadius={30} outerRadius={70} paddingAngle={4} label>
                      {distribution.map((entry, idx) => (
                        <Cell key={`cell-${idx}`} fill={COLORS[idx % COLORS.length] || brand500} />
                      ))}
                    </Pie>
                    <RechartsTooltip />
                  </PieChart>
                </ResponsiveContainer>
              </Box>
              <Divider my={4} />
              <Box h={120}>
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={distribution} margin={{ top: 0, right: 0, left: 0, bottom: 0 }}>
                    <XAxis dataKey="name" hide />
                    <Bar dataKey="value" fill={brand500} radius={[6,6,0,0]} />
                  </BarChart>
                </ResponsiveContainer>
              </Box>
            </Box>
          </GridItem>
        </Grid>

        <Divider />

        <Box w="100%">
          <Heading size="sm" mb={2} color={headingColor} letterSpacing="tight">Insights</Heading>
          <Text fontSize="sm" color={helperColor} mb={4}>What to focus on next.</Text>
          <SimpleGrid columns={{ base: 1, md: 3 }} spacing={4}>
            {insights.map((insight, i) => (
              <Box key={insight.label} p={4} bg={insightBg} borderRadius="lg" border="1px solid" borderColor={borderColor} boxShadow={surfaceShadow}>
                <HStack justify="space-between">
                  <Box>
                    <Stat>
                      <StatLabel fontSize="xs" fontWeight="semibold" textTransform="uppercase" letterSpacing="wider" color={labelColor}>{insight.label}</StatLabel>
                      <StatNumber fontSize="lg" mb={1}>{insight.value}</StatNumber>
                      <StatHelpText fontSize="xs" color={helperColor}>{insight.help}</StatHelpText>
                    </Stat>
                  </Box>
                  <Box alignSelf="center">
                    <Badge bg={COLORS[i % COLORS.length]} color="white" px={2} py={1} borderRadius="md" fontSize="xs">{insight.label.split(' ')[0]}</Badge>
                  </Box>
                </HStack>
              </Box>
            ))}
          </SimpleGrid>
        </Box>
      </VStack>
    </Box>
  );
}

LeadSummary.propTypes = {
  leads: PropTypes.arrayOf(PropTypes.object).isRequired,
};

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
  Flex,
  Tag,
  TagLabel,
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
  const cardBg = useColorModeValue('surface', 'surface');
  const borderColor = useColorModeValue('surfaceBorder', 'surfaceBorder');
  const labelColor = useColorModeValue('textMuted', 'textMuted');
  const helperColor = useColorModeValue('textMuted', 'textMuted');
  const headingColor = useColorModeValue('brand.900', 'brand.50');
  const accentHeading = useColorModeValue('accent.700', 'accent.200');
  const surfaceShadow = useColorModeValue('surface', 'surface');
  const pageBg = useColorModeValue('surfaceMuted', 'surfaceMuted');
  const chipBg = useColorModeValue('brand.100', 'whiteAlpha.200');
  const chipColor = useColorModeValue('brand.700', 'brand.100');
  const insightItemBg = useColorModeValue('white', 'brand.800');

  // Deterministic-ish report id (stable for the current render) for traceability.
  // Uses local date + count so it won't leak lead data.
  const reportId = `LR-${new Date().toISOString().slice(0, 10).replaceAll('-', '')}-${String(
    leads.length
  ).padStart(6, '0')}`;

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

  const engagementRate = total ? Math.round(((answered + qualified + scheduled) / total) * 100) : 0;
  const conversionRate = answered ? Math.round((scheduled / answered) * 100) : 0;

  // Some leads use `note` while others may use `notes`.
  const noFollowUp = leads.filter((l) => !l.status || !(l.note || l.notes)).length;
  const avgNotesLength = Math.round(
    leads.reduce((sum, l) => sum + ((l.note || l.notes)?.length || 0), 0) / total || 0
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

  const kpis = [
    {
      label: 'Total Leads',
      value: total,
      help: 'All leads currently loaded',
    },
    {
      label: 'Engagement',
      value: `${engagementRate}%`,
      help: 'Answered + Qualified + Scheduled',
    },
    {
      label: 'Conversion',
      value: `${conversionRate}%`,
      help: 'Scheduled ÷ Answered',
    },
    {
      label: 'Needs follow-up',
      value: noFollowUp,
      help: 'Missing status or notes',
    },
  ];

  const statusCards = [
    { label: 'Qualified', value: qualified },
    { label: 'Answered', value: answered },
    { label: 'Scheduled', value: scheduled },
    { label: 'Unqualified', value: grouped['Unqualified'] || 0 },
    { label: 'New', value: grouped['New'] || 0 },
  ];

  const insights = [
    {
      label: 'Follow-up coverage',
      value: total ? `${Math.max(0, 100 - Math.round((noFollowUp / total) * 100))}%` : '0%',
      help: 'Leads with a status and notes',
    },
    { label: 'Avg. note length', value: `${avgNotesLength} chars`, help: 'Average note size' },
    { label: 'First contact', value: earliest, help: 'Oldest contact date' },
    { label: 'Last contact', value: latest, help: 'Most recent contact date' },
  ];

  const distribution = [
    { name: 'New', value: grouped['New'] || 0 },
    { name: 'Answered', value: answered },
    { name: 'Qualified', value: qualified },
    { name: 'Scheduled', value: scheduled },
    { name: 'Unqualified', value: grouped['Unqualified'] || 0 },
  ];

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
      <VStack align="stretch" spacing={5}>
        <Box
          bg={pageBg}
          borderRadius="2xl"
          border="1px solid"
          borderColor={borderColor}
          px={{ base: 4, md: 6 }}
          py={{ base: 4, md: 5 }}
        >
          <Flex align="flex-start" justify="space-between" gap={4} flexWrap="wrap">
            <Box>
              <Heading size="sm" mb={1} color={headingColor} letterSpacing="tight">
                Lead report
              </Heading>
              <Text fontSize="xs" color={helperColor}>
                A quick, professional snapshot of pipeline health.
              </Text>
              <HStack mt={3} spacing={2} flexWrap="wrap">
                <Tag size="sm" bg={chipBg} color={chipColor} borderRadius="full">
                  <TagLabel>{total} total</TagLabel>
                </Tag>
                <Tag size="sm" bg={chipBg} color={chipColor} borderRadius="full">
                  <TagLabel>{qualified} qualified</TagLabel>
                </Tag>
                <Tag size="sm" bg={chipBg} color={chipColor} borderRadius="full">
                  <TagLabel>{scheduled} scheduled</TagLabel>
                </Tag>
                <Tag size="sm" bg={chipBg} color={chipColor} borderRadius="full">
                  <TagLabel>{engagementRate}% engagement</TagLabel>
                </Tag>
              </HStack>

              <Text mt={2} fontSize="xs" color={helperColor}>
                Report ID: <Text as="span" fontWeight="semibold" color={accentHeading}>{reportId}</Text>
              </Text>
            </Box>

            <HStack spacing={3}>
              <Button
                size="sm"
                leftIcon={<Icon as={FiDownload} />}
                onClick={handleExport}
                variant="outline"
              >
                Export JSON
              </Button>
              <Badge colorScheme="accent" variant="subtle" fontSize="xs">
                Updated {new Date().toLocaleDateString()}
              </Badge>
            </HStack>
          </Flex>
        </Box>

        <SimpleGrid columns={{ base: 1, md: 4 }} spacing={4}>
          {kpis.map((kpi, i) => (
            <SlideFade in={true} offsetY="10px" key={kpi.label} delay={0.03 * i}>
              <Box
                bg={cardBg}
                borderRadius="2xl"
                border="1px solid"
                borderColor={borderColor}
                boxShadow={surfaceShadow}
                overflow="hidden"
              >
                <Box h="3px" bg={COLORS[i % COLORS.length]} />
                <Box p={4}>
                  <Stat>
                    <StatLabel
                      fontSize="xs"
                      fontWeight="semibold"
                      textTransform="uppercase"
                      letterSpacing="wider"
                      color={labelColor}
                    >
                      {kpi.label}
                    </StatLabel>
                    <HStack justify="space-between" align="baseline" mt={2}>
                      <StatNumber fontSize={{ base: 'xl', md: '2xl' }} lineHeight="1">
                        {kpi.value}
                      </StatNumber>
                      {typeof kpi.value === 'number' ? (
                        <Text fontSize="xs" color={helperColor}>
                          {total ? `${Math.round((kpi.value / total) * 100)}%` : '0%'}
                        </Text>
                      ) : null}
                    </HStack>
                    <StatHelpText fontSize="xs" color={helperColor} mt={2} mb={0}>
                      {kpi.help}
                    </StatHelpText>
                  </Stat>
                </Box>
              </Box>
            </SlideFade>
          ))}
        </SimpleGrid>

        <Grid templateColumns={{ base: '1fr', lg: '1.2fr 0.8fr' }} gap={4}>
          <GridItem>
            <Box
              bg={cardBg}
              borderRadius="2xl"
              border="1px solid"
              borderColor={borderColor}
              boxShadow={surfaceShadow}
              p={{ base: 4, md: 5 }}
            >
              <HStack justify="space-between" mb={4}>
                <Box>
                  <Text
                    fontSize="xs"
                    fontWeight="semibold"
                    textTransform="uppercase"
                    letterSpacing="wider"
                    color={labelColor}
                  >
                    Pipeline distribution
                  </Text>
                  <Text fontSize="xs" color={helperColor}>
                    Share by status.
                  </Text>
                </Box>
                <Text fontSize="sm" color={accentHeading} fontWeight="semibold">
                  {total ? 'Healthy visibility' : 'No data'}
                </Text>
              </HStack>

              <Grid templateColumns={{ base: '1fr', md: '0.9fr 1.1fr' }} gap={4} alignItems="center">
                <GridItem>
                  <Box h={{ base: 240, md: 220 }}>
                    <ResponsiveContainer width="100%" height="100%">
                      <PieChart>
                        <Pie
                          data={distribution}
                          dataKey="value"
                          nameKey="name"
                          innerRadius={55}
                          outerRadius={85}
                          paddingAngle={3}
                        >
                          {distribution.map((_, idx) => (
                            <Cell key={`cell-${idx}`} fill={COLORS[idx % COLORS.length] || accent500} />
                          ))}
                        </Pie>
                        <RechartsTooltip />
                      </PieChart>
                    </ResponsiveContainer>
                  </Box>
                </GridItem>
                <GridItem>
                  <VStack align="stretch" spacing={3}>
                    {statusCards.map((s, i) => (
                      <HStack key={s.label} justify="space-between" w="full">
                        <HStack spacing={2}>
                          <Box w="10px" h="10px" borderRadius="full" bg={COLORS[i % COLORS.length]} />
                          <Text fontSize="xs" color={labelColor} fontWeight="semibold">
                            {s.label}
                          </Text>
                        </HStack>
                        <HStack spacing={3}>
                          <Text fontSize="xs" fontWeight="semibold">
                            {s.value}
                          </Text>
                          <Text fontSize="xs" color={helperColor} w="44px" textAlign="right">
                            {total ? `${Math.round((s.value / total) * 100)}%` : '0%'}
                          </Text>
                        </HStack>
                      </HStack>
                    ))}

                    <Divider />

                    <Box h={110}>
                      <ResponsiveContainer width="100%" height="100%">
                        <BarChart data={distribution} margin={{ top: 0, right: 0, left: 0, bottom: 0 }}>
                          <XAxis dataKey="name" hide />
                          <Bar dataKey="value" fill={accent500} radius={[8, 8, 0, 0]} />
                        </BarChart>
                      </ResponsiveContainer>
                    </Box>
                  </VStack>
                </GridItem>
              </Grid>
            </Box>
          </GridItem>

          <GridItem>
            <Box
              bg={cardBg}
              borderRadius="2xl"
              border="1px solid"
              borderColor={borderColor}
              boxShadow={surfaceShadow}
              p={{ base: 4, md: 5 }}
              h="100%"
            >
              <Heading size="sm" mb={1} color={headingColor} letterSpacing="tight">
                Insights
              </Heading>
              <Text fontSize="xs" color={helperColor} mb={4}>
                Priorities and data quality checks.
              </Text>
              <VStack align="stretch" spacing={3}>
                {insights.map((insight, i) => (
                  <Box
                    key={insight.label}
                    border="1px solid"
                    borderColor={borderColor}
                    borderRadius="xl"
                    p={3}
                    bg={insightItemBg}
                  >
                    <HStack justify="space-between" spacing={3} align="flex-start">
                      <Box>
                        <Text fontSize="xs" fontWeight="semibold" letterSpacing="wider" textTransform="uppercase" color={labelColor}>
                          {insight.label}
                        </Text>
                        <Text fontSize="md" fontWeight="semibold" mt={1}>
                          {insight.value}
                        </Text>
                        <Text fontSize="xs" color={helperColor} mt={1}>
                          {insight.help}
                        </Text>
                      </Box>
                      <Badge
                        px={2}
                        py={1}
                        borderRadius="md"
                        bg={COLORS[i % COLORS.length]}
                        color="white"
                        fontSize="xs"
                      >
                        Insight
                      </Badge>
                    </HStack>
                  </Box>
                ))}
              </VStack>

              <Divider my={4} />
              <Text fontSize="xs" color={helperColor}>
                Report ID: <Text as="span" fontWeight="semibold" color={accentHeading}>{reportId}</Text>
              </Text>
            </Box>
          </GridItem>
        </Grid>
      </VStack>
    </Box>
  );
}

LeadSummary.propTypes = {
  leads: PropTypes.arrayOf(PropTypes.object).isRequired,
};

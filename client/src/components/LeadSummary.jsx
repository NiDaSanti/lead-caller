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
} from "@chakra-ui/react";

export default function LeadSummary({ leads }) {
  const cardBg = useColorModeValue("white", "brand.900");
  const sectionBg = useColorModeValue("brand.50", "brand.800");
  const borderColor = useColorModeValue("brand.200", "brand.700");
  const labelColor = useColorModeValue("brand.600", "brand.200");
  const helperColor = useColorModeValue('brand.500', 'brand.200');

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
    { label: "Engagement Rate", value: `${engagementRate}%`, help: "Answered + Qualified + Scheduled" },
    { label: "Conversion Rate", value: `${conversionRate}%`, help: "Scheduled ÷ Answered" },
    { label: "Needs Follow-Up", value: noFollowUp, help: "Leads missing status or notes" },
    { label: "Avg. Notes Length", value: `${avgNotesLength} chars`, help: "Quality of notes written" },
    { label: "Earliest Contact", value: earliest, help: "Oldest lastContacted date" },
    { label: "Most Recent Contact", value: latest, help: "Latest lastContacted date" },
  ];

  return (
    <Box mt={6} px={{ base: 2, sm: 4, md: 8 }}>
      <VStack align="start" spacing={10}>
        {/* Status Grid */}
        <Box w="100%">
          <Heading size="md" mb={2} color={useColorModeValue('brand.800', 'highlight.200')}>Lead Status Overview</Heading>
          <Text fontSize="sm" color={helperColor} mb={4}>
            A quick glance at how many homeowners sit in each stage of the journey.
          </Text>
          <SimpleGrid columns={{ base: 2, sm: 3, md: 3, lg: 4 }} spacing={6}>
            {statuses.map((stat, i) => (
              <SlideFade in={true} offsetY="10px" key={stat.label} delay={0.05 * i}>
                <Box p={5} bg={cardBg} borderRadius="xl" boxShadow="base" border="1px solid" borderColor={borderColor}>
                  <Stat>
                    <StatLabel fontWeight="medium" color={labelColor}>{stat.label}</StatLabel>
                    <StatNumber fontSize="2xl">{stat.value}</StatNumber>
                    <StatHelpText fontSize="xs" color={helperColor}>
                      {total ? `${Math.round((stat.value / total) * 100)}% of total` : "0%"}
                    </StatHelpText>
                  </Stat>
                </Box>
              </SlideFade>
            ))}
          </SimpleGrid>
        </Box>

        <Divider />

        {/* Insights */}
        <Box w="100%">
          <Heading size="md" mb={2} color={useColorModeValue('brand.800', 'highlight.200')}>Performance Insights</Heading>
          <Text fontSize="sm" color={helperColor} mb={4}>
            Understand momentum at a glance—conversion rates, follow-up needs, and touchpoint recency.
          </Text>
          <SimpleGrid columns={{ base: 1, sm: 2, md: 3 }} spacing={6}>
            {insights.map((insight, i) => (
              <Box
                key={insight.label}
                p={5}
                bg={sectionBg}
                borderRadius="xl"
                boxShadow="sm"
                border="1px solid"
                borderColor={borderColor}
              >
                <Stat>
                  <StatLabel fontSize="sm" fontWeight="semibold" color={labelColor}>{insight.label}</StatLabel>
                  <StatNumber fontSize="xl">{insight.value}</StatNumber>
                  <StatHelpText fontSize="xs" color={helperColor}>
                    {insight.help}
                  </StatHelpText>
                </Stat>
              </Box>
            ))}
          </SimpleGrid>
        </Box>
      </VStack>
    </Box>
  );
}

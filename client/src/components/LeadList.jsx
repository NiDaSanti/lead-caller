/* eslint-disable react/prop-types */
// LeadList.jsx (Card Grid View)
import {
  Text,
  Center,
  Stack,
  Heading,
  useColorModeValue,
  SimpleGrid,
  Box,
} from "@chakra-ui/react";
import LeadCard from "./LeadCard";

const STATUS_LABELS = {
  Qualified: "✅ Qualified",
  Answered: "🟡 Answered",
  Unqualified: "❌ Unqualified",
  New: "🆕 New",
};

export default function LeadList({ leads, onUpdateLead, scrollRef, filter = "All", socket }) {

  const headingColor = useColorModeValue("orange.600", "orange.300");

  const grouped = leads.reduce((acc, lead) => {
    const status = (lead.status || "New").trim();
    if (!acc[status]) acc[status] = [];
    acc[status].push(lead);
    return acc;
  }, {});

  const allStatuses = Object.keys(grouped);
  const visibleStatuses = filter === "All"
    ? allStatuses
    : allStatuses.filter((status) => status === filter);

  const hasVisibleLeads = visibleStatuses.some((status) => grouped[status]?.length > 0);

  if (leads.length === 0) {
    return (
      <Center py={12}>
        <Text fontSize="md" color="gray.500">
          🤷 No leads yet. Use the form above to add one!
        </Text>
      </Center>
    );
  }

  if (!hasVisibleLeads) {
    return (
      <Center py={12}>
        <Text fontSize="md" color="gray.500">
          🔍 No leads found for {filter} filter.
        </Text>
      </Center>
    );
  }

  return (
    <Stack spacing={10} w="100%">
      {visibleStatuses.map((status) => (
        grouped[status]?.length > 0 ? (
          <Box key={status}>
            <Heading
              as="h3"
              fontSize="lg"
              mb={3}
              color={headingColor}
              borderLeft="4px solid"
              borderColor="orange.300"
              pl={3}
            >
              {STATUS_LABELS[status] || `🔖 ${status}`}
            </Heading>

            <SimpleGrid columns={{ base: 1, md: 2 }} spacing={4}>
              {grouped[status].map((lead, idx) => {
                const isLast = idx === grouped[status].length - 1;
                return (
                  <LeadCard
                    key={lead.id}
                    lead={lead}
                    onUpdateLead={onUpdateLead}
                    scrollRef={isLast ? scrollRef : undefined}
                    socket={socket}
                  />
                );
              })}
            </SimpleGrid>
          </Box>
        ) : null
      ))}
    </Stack>
  );
}

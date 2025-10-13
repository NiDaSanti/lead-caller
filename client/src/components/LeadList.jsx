// LeadList.jsx (Modern Professional Card Grid View)
import {
  Text,
  Center,
  Stack,
  Heading,
  Box,
  SimpleGrid,
  HStack,
  Icon
} from "@chakra-ui/react";
import {
  FiCheckCircle,
  FiPhoneCall,
  FiXCircle,
  FiStar,
  FiTag
} from "react-icons/fi";
import LeadCard from "./LeadCard";

const STATUS_ICONS = {
  Qualified: FiCheckCircle,
  Answered: FiPhoneCall,
  Unqualified: FiXCircle,
  New: FiStar,
};

export default function LeadList({
  leads,
  onUpdateLead,
  onDeleteLead,
  scrollRef,
  filter = "All",
  searchQuery = "",
  socket
}) {
  const normalizedQuery = searchQuery.trim().toLowerCase();
  const safeLeads = Array.isArray(leads) ? leads : [];

  const filteredLeads = safeLeads.filter((lead) => {
    const status = (lead.status || "New").trim();
    const matchesStatus = filter === "All" || status === filter;

    if (!normalizedQuery) {
      return matchesStatus;
    }

    const serialized = JSON.stringify(lead, (_, value) => value ?? "")
      .toString()
      .toLowerCase();

    return matchesStatus && serialized.includes(normalizedQuery);
  });

  const grouped = filteredLeads.reduce((acc, lead) => {
    const status = (lead.status || "New").trim();
    if (!acc[status]) acc[status] = [];
    acc[status].push(lead);
    return acc;
  }, {});

  const visibleStatuses = filter === "All"
    ? Object.keys(grouped)
    : Object.keys(grouped).filter((status) => status === filter);

  const hasVisibleLeads = visibleStatuses.some((status) => grouped[status]?.length > 0);

  if (safeLeads.length === 0) {
    return (
      <Center py={12}>
        <Text fontSize="md" color="brand.200">
          No leads yet. Use the form above to add one.
        </Text>
      </Center>
    );
  }

  if (!hasVisibleLeads) {
    return (
      <Center py={12}>
        <Text fontSize="md" color="brand.200">
          No leads found for the current filters.
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
              color="highlight.200"
              borderLeft="4px solid"
              borderColor="accent.500"
              pl={3}
            >
              <HStack>
                <Icon as={STATUS_ICONS[status] || FiTag} aria-label={`${status} leads`} />
                <Text>{status}</Text>
              </HStack>
            </Heading>

            <SimpleGrid columns={{ base: 1, sm: 2, md: 3 }} spacing={4}>
              {grouped[status].map((lead, idx) => {
                const isLast = idx === grouped[status].length - 1;
                return (
                  <LeadCard
                    key={lead.id}
                    lead={lead}
                    onUpdateLead={onUpdateLead}
                    onDeleteLead={onDeleteLead}
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

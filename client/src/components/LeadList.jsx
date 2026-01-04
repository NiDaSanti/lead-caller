// LeadList.jsx (Modern Professional Card Grid View)
import {
  Text,
  Center,
  Stack,
  Heading,
  Box,
  SimpleGrid,
  HStack,
  Icon,
  useColorModeValue
} from "@chakra-ui/react";
import {
  FiCheckCircle,
  FiPhoneCall,
  FiXCircle,
  FiStar,
  FiTag
} from "react-icons/fi";
import LeadCard from "./LeadCard";
import PropTypes from 'prop-types';

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
  const sectionHeadingColor = useColorModeValue('highlight.700', 'highlight.200');

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
          No leads yet. Add one above.
        </Text>
      </Center>
    );
  }

  if (!hasVisibleLeads) {
    return (
      <Center py={12}>
        <Text fontSize="md" color="brand.200">
          No matches.
        </Text>
      </Center>
    );
  }

  return (
    <Stack spacing={10} w="100%">
      {filter !== 'All' ? (
        // When a specific filter is active render a single universal grid
        <SimpleGrid minChildWidth={{ base: '280px', md: '320px', lg: '340px' }} spacing={5}>
          {filteredLeads.map((lead, idx) => (
            <LeadCard
              key={lead.id}
              lead={lead}
              onUpdateLead={onUpdateLead}
              onDeleteLead={onDeleteLead}
              scrollRef={idx === filteredLeads.length - 1 ? scrollRef : undefined}
              socket={socket}
            />
          ))}
        </SimpleGrid>
      ) : (
        // Default: grouped view with headings
        visibleStatuses.map((status) => (
          grouped[status]?.length > 0 ? (
            <Box key={status}>
              <Heading
                as="h3"
                fontSize="lg"
                mb={3}
                color={sectionHeadingColor}
                borderLeft="4px solid"
                borderColor="accent.500"
                pl={3}
              >
                <HStack>
                  <Icon as={STATUS_ICONS[status] || FiTag} aria-label={`${status} leads`} />
                  <Text>{status}</Text>
                </HStack>
              </Heading>

              {status === 'New' ? (
                <Stack spacing={4}>
                  {grouped[status].map((lead, idx) => (
                    <LeadCard
                      key={lead.id}
                      lead={lead}
                      onUpdateLead={onUpdateLead}
                      onDeleteLead={onDeleteLead}
                      scrollRef={idx === grouped[status].length - 1 ? scrollRef : undefined}
                      socket={socket}
                    />
                  ))}
                </Stack>
              ) : (
                <SimpleGrid minChildWidth={{ base: '280px', md: '320px', lg: '340px' }} spacing={5}>
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
              )}
            </Box>
          ) : null
        ))
      )}
    </Stack>
  );
}

LeadList.propTypes = {
  leads: PropTypes.arrayOf(PropTypes.object),
  onUpdateLead: PropTypes.func.isRequired,
  onDeleteLead: PropTypes.func.isRequired,
  scrollRef: PropTypes.oneOfType([
    PropTypes.func,
    PropTypes.shape({ current: PropTypes.any }),
  ]),
  filter: PropTypes.string,
  searchQuery: PropTypes.string,
  socket: PropTypes.shape({
    on: PropTypes.func,
    off: PropTypes.func,
  }),
};

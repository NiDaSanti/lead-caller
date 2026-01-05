// LeadList.jsx (Modern Professional Card Grid View)
import {
  Text,
  Center,
  Stack,
  Heading,
  Box,
  SimpleGrid,
  HStack,
  Flex,
  Button,
  Select,
  Badge,
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
import React from 'react';
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
  socket,
  onResetFilters,
  onAddLead,
}) {
  const sectionHeadingColor = useColorModeValue('highlight.700', 'highlight.200');
  const metaColor = useColorModeValue('brand.600', 'brand.200');
  const cardBg = useColorModeValue('white', 'black');
  const borderColor = useColorModeValue('brand.200', 'brand.700');
  const emptyIconBg = useColorModeValue('brand.50', 'brand.900');

  const normalizedQuery = searchQuery.trim().toLowerCase();
  const safeLeads = Array.isArray(leads) ? leads : [];

  const [sortBy, setSortBy] = React.useState('recent');

  const getLastContactedTs = (lead) => {
    const v = lead?.lastContacted;
    const t = v ? Date.parse(v) : NaN;
    return Number.isFinite(t) ? t : 0;
  };

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

  const sortedLeads = [...filteredLeads].sort((a, b) => {
    if (sortBy === 'name') {
      const an = String(a?.name || '').toLowerCase();
      const bn = String(b?.name || '').toLowerCase();
      return an.localeCompare(bn);
    }
    if (sortBy === 'status') {
      const as = String(a?.status || 'New').toLowerCase();
      const bs = String(b?.status || 'New').toLowerCase();
      return as.localeCompare(bs);
    }

    // recent
    return getLastContactedTs(b) - getLastContactedTs(a);
  });

  const grouped = sortedLeads.reduce((acc, lead) => {
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
        <Stack spacing={3} align="center" textAlign="center" maxW="440px">
          <Box
            w={12}
            h={12}
            borderRadius="xl"
            bg={emptyIconBg}
            border="1px solid"
            borderColor={borderColor}
            display="flex"
            alignItems="center"
            justifyContent="center"
          >
            <Icon as={FiTag} color={metaColor} />
          </Box>
          <Heading size="sm">No leads yet</Heading>
          <Text fontSize="sm" color={metaColor}>
            Add a lead manually or import a CSV to start calling.
          </Text>
          <HStack spacing={2} pt={1}>
            {typeof onAddLead === 'function' && (
              <Button size="sm" colorScheme="accent" onClick={onAddLead}>
                Add lead
              </Button>
            )}
          </HStack>
        </Stack>
      </Center>
    );
  }

  if (!hasVisibleLeads) {
    return (
      <Center py={12}>
        <Stack spacing={3} align="center" textAlign="center" maxW="520px">
          <Box
            w={12}
            h={12}
            borderRadius="xl"
            bg={emptyIconBg}
            border="1px solid"
            borderColor={borderColor}
            display="flex"
            alignItems="center"
            justifyContent="center"
          >
            <Icon as={FiTag} color={metaColor} />
          </Box>
          <Heading size="sm">No leads match your filters</Heading>
          <Text fontSize="sm" color={metaColor}>
            Try removing filters, or adjust your search.
          </Text>
          <HStack spacing={2} pt={1}>
            {typeof onResetFilters === 'function' && (
              <Button size="sm" variant="outline" onClick={onResetFilters}>
                Reset
              </Button>
            )}
            {typeof onAddLead === 'function' && (
              <Button size="sm" colorScheme="accent" onClick={onAddLead}>
                Add lead
              </Button>
            )}
          </HStack>
        </Stack>
      </Center>
    );
  }

  return (
    <Stack spacing={10} w="100%">
      {/* Toolbar */}
      <Flex
        gap={3}
        align={{ base: 'stretch', md: 'center' }}
        justify="space-between"
        direction={{ base: 'column', md: 'row' }}
        bg={cardBg}
        border="1px solid"
        borderColor={borderColor}
        borderRadius="xl"
        p={{ base: 3, md: 4 }}
      >
        <HStack spacing={2} flexWrap="wrap">
          <Badge variant="subtle" colorScheme="accent">
            {sortedLeads.length.toLocaleString()} results
          </Badge>
          {filter !== 'All' && (
            <Badge variant="subtle" colorScheme="highlight">
              {filter}
            </Badge>
          )}
          {normalizedQuery && (
            <Badge variant="subtle" colorScheme="purple">
              “{normalizedQuery}”
            </Badge>
          )}
        </HStack>

        <HStack spacing={2} justify={{ base: 'flex-start', md: 'flex-end' }}>
          <Text fontSize="sm" color={metaColor}>
            Sort
          </Text>
          <Select
            size="sm"
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value)}
            maxW={{ base: '100%', md: '220px' }}
          >
            <option value="recent">Most recent activity</option>
            <option value="name">Name (A–Z)</option>
            <option value="status">Status (A–Z)</option>
          </Select>
        </HStack>
      </Flex>

      {filter !== 'All' ? (
        // When a specific filter is active render a single universal grid
        <SimpleGrid minChildWidth={{ base: '260px', md: '300px', lg: '340px' }} spacing={{ base: 4, md: 5 }}>
          {sortedLeads.map((lead, idx) => (
            <LeadCard
              key={lead.id}
              lead={lead}
              onUpdateLead={onUpdateLead}
              onDeleteLead={onDeleteLead}
              scrollRef={idx === sortedLeads.length - 1 ? scrollRef : undefined}
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
                <SimpleGrid minChildWidth={{ base: '260px', md: '300px', lg: '340px' }} spacing={{ base: 4, md: 5 }}>
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
  onResetFilters: PropTypes.func,
  onAddLead: PropTypes.func,
  socket: PropTypes.shape({
    on: PropTypes.func,
    off: PropTypes.func,
  }),
};

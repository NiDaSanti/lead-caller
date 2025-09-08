// LeadList.jsx (Modern Professional Table List View)
import {
  Text,
  Center,
  Stack,
  Heading,
  useColorModeValue,
  Table,
  Thead,
  Tbody,
  Tr,
  Th,
  Box,
  HStack,
  Icon
} from "@chakra-ui/react";
import {
  FiCheckCircle,
  FiPhoneCall,
  FiXCircle,
  FiStar,
  FiTag,
  FiUser,
  FiPhone,
  FiMoreHorizontal
} from "react-icons/fi";
import LeadCard from "./LeadCard";

const STATUS_ICONS = {
  Qualified: FiCheckCircle,
  Answered: FiPhoneCall,
  Unqualified: FiXCircle,
  New: FiStar,
};

export default function LeadList({ leads, onUpdateLead, scrollRef, filter = "All", socket }) {
  const borderColor = useColorModeValue("gray.200", "gray.700");
  const headerBg = useColorModeValue("gray.100", "gray.700");

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
          🔍 No leads found for "{filter}" filter.
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
              color={useColorModeValue("orange.600", "orange.300")}
              borderLeft="4px solid"
              borderColor="orange.300"
              pl={3}
            >
              <HStack>
                <Icon as={STATUS_ICONS[status] || FiTag} aria-label={`${status} leads`} />
                <Text>{status}</Text>
              </HStack>
            </Heading>

            <Table variant="simple" size="sm">
              <Thead bg={headerBg}>
                <Tr>
                  <Th>
                    <HStack>
                      <Icon as={FiUser} aria-label="Name" />
                      <Text>Name</Text>
                    </HStack>
                  </Th>
                  <Th>
                    <HStack>
                      <Icon as={FiPhone} aria-label="Phone" />
                      <Text>Phone</Text>
                    </HStack>
                  </Th>
                  <Th>
                    <HStack>
                      <Icon as={FiTag} aria-label="Status" />
                      <Text>Status</Text>
                    </HStack>
                  </Th>
                  <Th>
                    <HStack>
                      <Icon as={FiMoreHorizontal} aria-label="Actions" />
                      <Text>Actions</Text>
                    </HStack>
                  </Th>
                </Tr>
              </Thead>
              <Tbody>
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
              </Tbody>
            </Table>
          </Box>
        ) : null
      ))}
    </Stack>
  );
}

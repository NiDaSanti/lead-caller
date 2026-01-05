import { useState } from 'react';
import {
  Box,
  SimpleGrid,
  GridItem,
  Input,
  Button,
  FormControl,
  FormLabel,
  FormHelperText,
  InputGroup,
  InputLeftElement,
  Icon,
  useToast,
  Textarea,
  useColorModeValue,
  Stack,
  HStack,
  Badge,
  Text,
  Divider,
} from '@chakra-ui/react';
import { PhoneIcon } from '@chakra-ui/icons';
import { MdLocationOn } from 'react-icons/md';
import PropTypes from 'prop-types';
import { apiFetch } from '../services/apiClient.js';

export default function LeadForm({ onNewLead }) {
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [phone, setPhone] = useState('');
  const [address, setAddress] = useState('');
  const [city, setCity] = useState('');
  const [state, setState] = useState('');
  const [zipcode, setZipcode] = useState('');
  const [note, setNote] = useState('');
  const toast = useToast();

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!firstName || !lastName || !phone || !address || !city || !state || !zipcode) {
      toast({
        title: "Missing info",
        description: "Please fill out all required fields.",
        status: "warning",
        duration: 3000,
        isClosable: true,
      });
      return;
    }

    const newLead = {
      firstName,
      lastName,
      phone,
      address: {
        street: address,
        city,
        state,
        zip: zipcode
      },
      note
    };

    try {
      const res = await apiFetch('/api/leads', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(newLead),
      });

      const data = await res.json();

      if (res.status === 409) {
        toast({
          title: 'Phone already used',
          description: data.error,
          status: 'warning',
          duration: 3000,
          isClosable: true,
        });
        return;
      }

      if (data.success) {
        onNewLead(data.lead);
        setFirstName('');
        setLastName('');
        setPhone('');
        setAddress('');
        setCity('');
        setState('');
        setZipcode('');
        setNote('');
        toast({
          title: "Lead added",
          description: `${data.lead.firstName} ${data.lead.lastName} was added.`,
          status: "success",
          duration: 3000,
          isClosable: true,
        });
      } else {
        throw new Error(data.error || "Something went wrong");
      }
    } catch (err) {
      toast({
        title: "Error",
        description: err.message,
        status: "error",
        duration: 3000,
        isClosable: true,
      });
    }
  };

  const containerBg = useColorModeValue('surface', 'surface');
  const borderColor = useColorModeValue('surfaceBorder', 'surfaceBorder');
  const sectionBg = useColorModeValue('surfaceMuted', 'surfaceMuted');
  const helperColor = useColorModeValue('textMuted', 'textMuted');

  return (
    <Box
      bg={containerBg}
      border="1px solid"
      borderColor={borderColor}
      borderRadius="2xl"
      p={{ base: 6, md: 8 }}
      boxShadow={useColorModeValue('surface', 'surface')}
    >
      <Stack spacing={8}>
        <Stack spacing={3}>
          <HStack spacing={3}>
            <Badge colorScheme="accent" px={3} py={1} borderRadius="full">
              New lead
            </Badge>
            <Badge colorScheme="highlight" variant="subtle" px={3} py={1} borderRadius="full">
              ~2 min
            </Badge>
          </HStack>
          <Text fontSize={{ base: 'lg', md: 'xl' }} fontWeight="semibold">
            Add a lead.
          </Text>
          <Text fontSize="sm" color={helperColor} maxW="2xl">
            Save the basics now. Add notes if you want.
          </Text>
        </Stack>

        <Divider />

        <form onSubmit={handleSubmit}>
          <SimpleGrid columns={{ base: 1, md: 2 }} spacing={5}>
            <FormControl isRequired>
              <FormLabel>First Name</FormLabel>
              <Input
                placeholder="Jane"
                value={firstName}
                onChange={(e) => setFirstName(e.target.value)}
                bg={sectionBg}
              />
              <FormHelperText color={helperColor}>First name.</FormHelperText>
            </FormControl>

            <FormControl isRequired>
              <FormLabel>Last Name</FormLabel>
              <Input
                placeholder="Doe"
                value={lastName}
                onChange={(e) => setLastName(e.target.value)}
                bg={sectionBg}
              />
              <FormHelperText color={helperColor}>Last name.</FormHelperText>
            </FormControl>

            <FormControl isRequired>
              <FormLabel>Phone</FormLabel>
              <InputGroup>
                <InputLeftElement pointerEvents="none">
                  <PhoneIcon color="accent.500" />
                </InputLeftElement>
                <Input
                  placeholder="555-123-4567"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  bg={sectionBg}
                />
              </InputGroup>
              <FormHelperText color={helperColor}>Include area code.</FormHelperText>
            </FormControl>

            <FormControl isRequired>
              <FormLabel>Street Address</FormLabel>
              <InputGroup>
                <InputLeftElement pointerEvents="none">
                  <Icon as={MdLocationOn} color="accent.500" />
                </InputLeftElement>
                <Input
                  placeholder="1234 Main St"
                  value={address}
                  onChange={(e) => setAddress(e.target.value)}
                  bg={sectionBg}
                />
              </InputGroup>
              <FormHelperText color={helperColor}>Street and number.</FormHelperText>
            </FormControl>

            <FormControl isRequired>
              <FormLabel>City</FormLabel>
              <Input
                placeholder="Los Angeles"
                value={city}
                onChange={(e) => setCity(e.target.value)}
                bg={sectionBg}
              />
              <FormHelperText color={helperColor}>City.</FormHelperText>
            </FormControl>

            <FormControl isRequired>
              <FormLabel>State</FormLabel>
              <Input
                placeholder="CA"
                value={state}
                onChange={(e) => setState(e.target.value)}
                bg={sectionBg}
              />
              <FormHelperText color={helperColor}>State (2 letters).</FormHelperText>
            </FormControl>

            <FormControl isRequired>
              <FormLabel>ZIP Code</FormLabel>
              <Input
                placeholder="90001"
                value={zipcode}
                onChange={(e) => setZipcode(e.target.value)}
                bg={sectionBg}
              />
              <FormHelperText color={helperColor}>ZIP code.</FormHelperText>
            </FormControl>

            <GridItem colSpan={{ base: 1, md: 2 }}>
              <FormControl>
                <FormLabel>Note</FormLabel>
                <Textarea
                  placeholder="Notes (optional)"
                  value={note}
                  onChange={(e) => setNote(e.target.value)}
                  bg={sectionBg}
                />
                <FormHelperText color={helperColor}>Optional.</FormHelperText>
              </FormControl>
            </GridItem>

            <GridItem colSpan={{ base: 1, md: 2 }}>
              <Button
                w="full"
                type="submit"
                colorScheme="accent"
                size="lg"
                borderRadius="xl"
                boxShadow="0 12px 24px rgba(44, 122, 123, 0.2)"
              >
                Submit Lead
              </Button>
            </GridItem>
          </SimpleGrid>
        </form>
      </Stack>
    </Box>
  );
}

LeadForm.propTypes = {
  onNewLead: PropTypes.func.isRequired,
};

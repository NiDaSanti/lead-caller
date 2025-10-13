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
        title: "Missing fields",
        description: "All fields must be filled out.",
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
      const res = await fetch('http://localhost:3000/api/leads', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${localStorage.getItem('token')}`,
        },
        body: JSON.stringify(newLead),
      });

      const data = await res.json();

      if (res.status === 409) {
        toast({
          title: 'Phone already exists',
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
          description: `${data.lead.firstName} ${data.lead.lastName} added successfully.`,
          status: "success",
          duration: 3000,
          isClosable: true,
        });
      } else {
        throw new Error(data.error || "Something went wrong");
      }
    } catch (err) {
      toast({
        title: "Server Error",
        description: err.message,
        status: "error",
        duration: 3000,
        isClosable: true,
      });
    }
  };

  const containerBg = useColorModeValue('white', 'brand.900');
  const borderColor = useColorModeValue('brand.200', 'brand.700');
  const sectionBg = useColorModeValue('brand.50', 'brand.800');
  const helperColor = useColorModeValue('brand.500', 'brand.300');

  return (
    <Box
      bg={containerBg}
      border="1px solid"
      borderColor={borderColor}
      borderRadius="2xl"
      p={{ base: 6, md: 8 }}
      boxShadow={useColorModeValue('xl', 'md')}
    >
      <Stack spacing={8}>
        <Stack spacing={3}>
          <HStack spacing={3}>
            <Badge colorScheme="accent" px={3} py={1} borderRadius="full">
              New homeowner
            </Badge>
            <Badge colorScheme="highlight" variant="subtle" px={3} py={1} borderRadius="full">
              Takes ~2 minutes
            </Badge>
          </HStack>
          <Text fontSize={{ base: 'lg', md: 'xl' }} fontWeight="semibold">
            Capture lead details while the conversation is fresh.
          </Text>
          <Text fontSize="sm" color={helperColor} maxW="2xl">
            Quick notes on every contact help your team personalize follow-ups, schedule site surveys, and close with confidence.
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
              <FormHelperText color={helperColor}>The lead&apos;s given name.</FormHelperText>
            </FormControl>

            <FormControl isRequired>
              <FormLabel>Last Name</FormLabel>
              <Input
                placeholder="Doe"
                value={lastName}
                onChange={(e) => setLastName(e.target.value)}
                bg={sectionBg}
              />
              <FormHelperText color={helperColor}>Family name of the lead.</FormHelperText>
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
              <FormHelperText color={helperColor}>Street number and name.</FormHelperText>
            </FormControl>

            <FormControl isRequired>
              <FormLabel>City</FormLabel>
              <Input
                placeholder="Los Angeles"
                value={city}
                onChange={(e) => setCity(e.target.value)}
                bg={sectionBg}
              />
              <FormHelperText color={helperColor}>City of residence.</FormHelperText>
            </FormControl>

            <FormControl isRequired>
              <FormLabel>State</FormLabel>
              <Input
                placeholder="CA"
                value={state}
                onChange={(e) => setState(e.target.value)}
                bg={sectionBg}
              />
              <FormHelperText color={helperColor}>Two-letter state code.</FormHelperText>
            </FormControl>

            <FormControl isRequired>
              <FormLabel>ZIP Code</FormLabel>
              <Input
                placeholder="90001"
                value={zipcode}
                onChange={(e) => setZipcode(e.target.value)}
                bg={sectionBg}
              />
              <FormHelperText color={helperColor}>5-digit ZIP code.</FormHelperText>
            </FormControl>

            <GridItem colSpan={{ base: 1, md: 2 }}>
              <FormControl>
                <FormLabel>Note</FormLabel>
                <Textarea
                  placeholder="Additional details about the lead"
                  value={note}
                  onChange={(e) => setNote(e.target.value)}
                  bg={sectionBg}
                />
                <FormHelperText color={helperColor}>Optional notes.</FormHelperText>
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

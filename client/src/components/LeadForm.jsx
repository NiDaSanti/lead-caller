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

  return (
    <Box
      bg={useColorModeValue("white", "gray.800")}
      border="1px solid"
      borderColor={useColorModeValue("gray.200", "gray.600")}
      borderRadius="xl"
      p={6}
      boxShadow="md"
    >
      <form onSubmit={handleSubmit}>
        <SimpleGrid columns={{ base: 1, md: 2 }} spacing={5}>
          <FormControl isRequired>
            <FormLabel>First Name</FormLabel>
            <Input
              placeholder="Jane"
              value={firstName}
              onChange={(e) => setFirstName(e.target.value)}
            />
            <FormHelperText>The lead&apos;s given name.</FormHelperText>
          </FormControl>

          <FormControl isRequired>
            <FormLabel>Last Name</FormLabel>
            <Input
              placeholder="Doe"
              value={lastName}
              onChange={(e) => setLastName(e.target.value)}
            />
            <FormHelperText>Family name of the lead.</FormHelperText>
          </FormControl>

          <FormControl isRequired>
            <FormLabel>Phone</FormLabel>
            <InputGroup>
              <InputLeftElement pointerEvents="none">
                <PhoneIcon color="gray.300" />
              </InputLeftElement>
              <Input
                placeholder="555-123-4567"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
              />
            </InputGroup>
            <FormHelperText>Include area code.</FormHelperText>
          </FormControl>

          <FormControl isRequired>
            <FormLabel>Street Address</FormLabel>
            <InputGroup>
              <InputLeftElement pointerEvents="none">
                <Icon as={MdLocationOn} color="gray.300" />
              </InputLeftElement>
              <Input
                placeholder="1234 Main St"
                value={address}
                onChange={(e) => setAddress(e.target.value)}
              />
            </InputGroup>
            <FormHelperText>Street number and name.</FormHelperText>
          </FormControl>

          <FormControl isRequired>
            <FormLabel>City</FormLabel>
            <Input
              placeholder="Los Angeles"
              value={city}
              onChange={(e) => setCity(e.target.value)}
            />
            <FormHelperText>City of residence.</FormHelperText>
          </FormControl>

          <FormControl isRequired>
            <FormLabel>State</FormLabel>
            <Input
              placeholder="CA"
              value={state}
              onChange={(e) => setState(e.target.value)}
            />
            <FormHelperText>Two-letter state code.</FormHelperText>
          </FormControl>

          <FormControl isRequired>
            <FormLabel>ZIP Code</FormLabel>
            <Input
              placeholder="90001"
              value={zipcode}
              onChange={(e) => setZipcode(e.target.value)}
            />
            <FormHelperText>5-digit ZIP code.</FormHelperText>
          </FormControl>

          <GridItem colSpan={{ base: 1, md: 2 }}>
            <FormControl>
              <FormLabel>Note</FormLabel>
              <Textarea
                placeholder="Additional details about the lead"
                value={note}
                onChange={(e) => setNote(e.target.value)}
              />
              <FormHelperText>Optional notes.</FormHelperText>
            </FormControl>
          </GridItem>

          <GridItem colSpan={{ base: 1, md: 2 }}>
            <Button w="full" type="submit" colorScheme="brand">
              Submit Lead
            </Button>
          </GridItem>
        </SimpleGrid>
      </form>
    </Box>
  );
}

LeadForm.propTypes = {
  onNewLead: PropTypes.func.isRequired,
};

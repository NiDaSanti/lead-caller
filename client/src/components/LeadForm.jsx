import { useState } from 'react';
import {
  Box,
  Stack,
  Input,
  Button,
  FormControl,
  FormLabel,
  useToast,
  Textarea,
  useColorModeValue,
} from '@chakra-ui/react';

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
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newLead),
      });

      const data = await res.json();

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
        <Stack spacing={5}>
          <FormControl isRequired>
            <FormLabel>First Name</FormLabel>
            <Input value={firstName} onChange={(e) => setFirstName(e.target.value)} />
          </FormControl>

          <FormControl isRequired>
            <FormLabel>Last Name</FormLabel>
            <Input value={lastName} onChange={(e) => setLastName(e.target.value)} />
          </FormControl>

          <FormControl isRequired>
            <FormLabel>Phone</FormLabel>
            <Input value={phone} onChange={(e) => setPhone(e.target.value)} />
          </FormControl>

          <FormControl isRequired>
            <FormLabel>Street Address</FormLabel>
            <Input value={address} onChange={(e) => setAddress(e.target.value)} />
          </FormControl>

          <FormControl isRequired>
            <FormLabel>City</FormLabel>
            <Input value={city} onChange={(e) => setCity(e.target.value)} />
          </FormControl>

          <FormControl isRequired>
            <FormLabel>State</FormLabel>
            <Input value={state} onChange={(e) => setState(e.target.value)} />
          </FormControl>

          <FormControl isRequired>
            <FormLabel>ZIP Code</FormLabel>
            <Input value={zipcode} onChange={(e) => setZipcode(e.target.value)} />
          </FormControl>

          <FormControl>
            <FormLabel>Note</FormLabel>
            <Textarea value={note} onChange={(e) => setNote(e.target.value)} />
          </FormControl>

          <Button type="submit" colorScheme="blue">Submit Lead</Button>
        </Stack>
      </form>
    </Box>
  );
}

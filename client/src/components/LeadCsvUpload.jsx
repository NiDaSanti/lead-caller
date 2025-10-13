import { useState } from 'react';
import { Box, Input, Button, Stack, useToast, useColorModeValue, Text, Icon, HStack } from '@chakra-ui/react';
import { FiUploadCloud } from 'react-icons/fi';
import Papa from 'papaparse';
import PropTypes from 'prop-types';

export default function LeadCsvUpload({ onNewLead }) {
  const [file, setFile] = useState(null);
  const toast = useToast();

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!file) {
      toast({
        title: 'No file selected',
        status: 'warning',
        duration: 3000,
        isClosable: true,
      });
      return;
    }

    Papa.parse(file, {
      header: true,
      complete: async (results) => {
        let success = 0;
        let errors = 0;
        let duplicates = 0;

        for (const row of results.data) {
          if (Object.values(row).every((val) => val === undefined || val === '')) continue;

          const lead = {
            firstName: row.firstName,
            lastName: row.lastName,
            phone: row.phone,
            address: {
              street: row.street,
              city: row.city,
              state: row.state,
              zip: row.zip,
            },
            note: row.note,
          };

          try {
            const res = await fetch('http://localhost:3000/api/leads', {
              method: 'POST',
              headers: {
                'Content-Type': 'application/json',
                Authorization: `Bearer ${localStorage.getItem('token')}`,
              },
              body: JSON.stringify(lead),
            });
            // Skip adding a lead if the phone number already exists

            if (res.status === 409) {
              duplicates += 1;
              continue;
            }

            const data = await res.json();
            if (data.success) {
              success += 1;
              if (onNewLead) onNewLead(data.lead);
            } else {
              errors += 1;
            }
          } catch (err) {
            errors += 1;
          }
        }

        const message =
          `${success} leads added` +
          `${duplicates ? `, ${duplicates} duplicates` : ''}` +
          `${errors ? `, ${errors} failed` : ''}.`;
        toast({
          title: 'CSV Upload Complete',
          description: message,
          status: duplicates || errors ? 'warning' : 'success',
          duration: 5000,
          isClosable: true,
        });
        setFile(null);
      },
    });
  };

  const containerBg = useColorModeValue('brand.50', 'brand.800');
  const borderColor = useColorModeValue('brand.200', 'brand.700');

  return (
    <Box
      as="form"
      onSubmit={handleSubmit}
      mt={4}
      bg={containerBg}
      border="1px dashed"
      borderColor={borderColor}
      borderRadius="2xl"
      p={6}
    >
      <Stack spacing={4} align="flex-start">
        <HStack spacing={3} color={useColorModeValue('brand.600', 'brand.200')}>
          <Icon as={FiUploadCloud} boxSize={6} color={useColorModeValue('accent.500', 'accent.300')} />
          <Text fontWeight="semibold">Bulk upload homeowners</Text>
        </HStack>
        <Text fontSize="sm" color={useColorModeValue('brand.500', 'brand.300')}>
          Import a spreadsheet of homeowners to populate the pipeline instantly. Use the provided template to ensure headers match your CRM.
        </Text>
        <Stack direction={{ base: 'column', md: 'row' }} spacing={4} w="full">
          <Input type="file" accept=".csv" onChange={(e) => setFile(e.target.files[0])} bg={useColorModeValue('white', 'brand.900')} />
          <Button type="submit" colorScheme="accent" borderRadius="full">
            Upload CSV
          </Button>
        </Stack>
      </Stack>
    </Box>
  );
}

LeadCsvUpload.propTypes = {
  onNewLead: PropTypes.func,
};

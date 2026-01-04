import { useState } from 'react';
import { Box, Input, Button, Stack, useToast, useColorModeValue, Text, Icon, HStack } from '@chakra-ui/react';
import { FiUploadCloud } from 'react-icons/fi';
import Papa from 'papaparse';
import PropTypes from 'prop-types';
import { apiFetch } from '../services/apiClient.js';

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

    // Stream and upload in batches to /api/leads/bulk
    const BATCH_SIZE = 200; // recommended batch size
    let buffer = [];
    let inserted = 0;
    let duplicates = 0;
    let errors = 0;
    let totalRows = 0;

    const uploadBatch = async (batch) => {
      if (!batch.length) return;
      try {
        const res = await apiFetch('/api/leads/bulk', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ leads: batch }),
        });
        const data = await res.json();
        if (res.ok && data) {
          inserted += data.inserted || 0;
          duplicates += data.duplicates || 0;
          errors += data.errors || 0;
          if (Array.isArray(data.leads)) {
            data.leads.forEach((l) => onNewLead && onNewLead(l));
          }
        } else {
          errors += batch.length;
        }
      } catch (err) {
        errors += batch.length;
      }
    };

    const toastId = `csv-upload-${Date.now()}`;
  toast({ title: 'Uploading CSV', description: 'Uploading...', status: 'info', duration: 3000, id: toastId });

    Papa.parse(file, {
      header: true,
      worker: true,
      step: async (results, parser) => {
        const row = results.data;
        totalRows += 1;
        if (Object.values(row).every((val) => val === undefined || val === '')) return;

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

        if (!lead.firstName || !lead.lastName || !lead.phone) {
          errors += 1;
          toast({
            title: 'Row skipped',
            description: `Row ${totalRows} is missing firstName, lastName, or phone.`,
            status: 'warning',
            duration: 3000,
            isClosable: true,
          });
          return;
        }
        buffer.push(lead);
        if (buffer.length >= BATCH_SIZE) {
          parser.pause();
          await uploadBatch(buffer);
          buffer = [];
          parser.resume();
        }
      },
      complete: async () => {
        await uploadBatch(buffer);
        const message = `${inserted} leads added` +
          `${duplicates ? `, ${duplicates} duplicates` : ''}` +
          `${errors ? `, ${errors} failed` : ''}.`;
        toast({
          title: 'Upload done',
          description: message,
          status: duplicates || errors ? 'warning' : 'success',
          duration: 6000,
          isClosable: true,
        });
      },
      error: (err) => {
        toast({
          title: 'CSV error',
          description: String(err),
          status: 'error',
          duration: 6000,
          isClosable: true,
        });
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
          <Text fontWeight="semibold">Upload leads</Text>
        </HStack>
        <Text fontSize="sm" color={useColorModeValue('brand.500', 'brand.300')}>
          Upload a CSV to add leads.
        </Text>
        <Stack direction={{ base: 'column', md: 'row' }} spacing={4} w="full">
          <Input type="file" accept=".csv" onChange={(e) => setFile(e.target.files[0])} bg={useColorModeValue('white', 'brand.900')} />
          <Button type="submit" colorScheme="accent" borderRadius="full">
            Upload
          </Button>
        </Stack>
      </Stack>
    </Box>
  );
}

LeadCsvUpload.propTypes = {
  onNewLead: PropTypes.func,
};

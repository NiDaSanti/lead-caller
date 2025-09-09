import { useState } from 'react';
import { Input, Button, Stack, useToast } from '@chakra-ui/react';
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

  return (
    <form onSubmit={handleSubmit}>
      <Stack direction={{ base: 'column', md: 'row' }} spacing={4}>
        <Input type="file" accept=".csv" onChange={(e) => setFile(e.target.files[0])} />
        <Button type="submit" colorScheme="green">
          Upload CSV
        </Button>
      </Stack>
    </form>
  );
}

LeadCsvUpload.propTypes = {
  onNewLead: PropTypes.func,
};

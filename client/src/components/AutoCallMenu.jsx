import { useEffect, useState } from 'react';
import {
  Box,
  Button,
  FormControl,
  FormLabel,
  Input,
  NumberInput,
  NumberInputField,
  VStack,
  Alert,
  AlertIcon
} from '@chakra-ui/react';

export default function AutoCallMenu() {
  const [config, setConfig] = useState({ startTime: '', stopTime: '', callsPerHour: 1 });
  const [message, setMessage] = useState(null);

  const fetchConfig = async () => {
    const res = await fetch('http://localhost:3000/api/scheduler/config');
    const data = await res.json();
    setConfig(data);
  };

  useEffect(() => {
    fetchConfig();
  }, []);

  const handleChange = (e) => {
    setConfig(prev => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleCallsChange = (_, value) => {
    setConfig(prev => ({ ...prev, callsPerHour: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMessage(null);
    if (config.startTime >= config.stopTime) {
      setMessage({ type: 'error', text: 'Start time must be before stop time' });
      return;
    }
    if (config.callsPerHour <= 0) {
      setMessage({ type: 'error', text: 'Calls per hour must be greater than 0' });
      return;
    }
    try {
      const res = await fetch('http://localhost:3000/api/scheduler/config', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          startTime: config.startTime,
          stopTime: config.stopTime,
          callsPerHour: Number(config.callsPerHour)
        })
      });
      if (!res.ok) throw new Error('Request failed');
      await fetchConfig();
      setMessage({ type: 'success', text: 'Settings saved' });
    } catch (err) {
      setMessage({ type: 'error', text: 'Failed to save settings' });
    }
  };

  return (
    <Box as="form" onSubmit={handleSubmit} maxW="md" mx="auto">
      <VStack spacing={4} align="stretch">
        <FormControl>
          <FormLabel>Start Time</FormLabel>
          <Input type="time" name="startTime" value={config.startTime} onChange={handleChange} />
        </FormControl>
        <FormControl>
          <FormLabel>Stop Time</FormLabel>
          <Input type="time" name="stopTime" value={config.stopTime} onChange={handleChange} />
        </FormControl>
        <FormControl>
          <FormLabel>Calls Per Hour</FormLabel>
          <NumberInput min={1} value={config.callsPerHour} onChange={handleCallsChange}>
            <NumberInputField name="callsPerHour" />
          </NumberInput>
        </FormControl>
        <Button type="submit" colorScheme="blue">Save</Button>
        {message && (
          <Alert status={message.type}>
            <AlertIcon />
            {message.text}
          </Alert>
        )}
      </VStack>
    </Box>
  );
}

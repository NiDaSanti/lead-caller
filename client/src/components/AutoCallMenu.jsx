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
  AlertIcon,
  Switch,
  Checkbox,
  HStack,
  Heading,
  Divider,
  useColorModeValue
} from '@chakra-ui/react';

const DAYS = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];

export default function AutoCallMenu() {
  const [config, setConfig] = useState({
    startTime: '',
    stopTime: '',
    callsPerHour: 1,
    enabled: false,
    days: DAYS.slice(0, 5)
  });
  const [message, setMessage] = useState(null);

  const fetchConfig = async () => {
    const res = await fetch('http://localhost:3000/api/scheduler/config', {
      headers: { Authorization: `Bearer ${localStorage.getItem('token')}` },
    });
    const data = await res.json();
    setConfig({
      startTime: data.startTime || '',
      stopTime: data.stopTime || '',
      callsPerHour: data.callsPerHour ?? 1,
      enabled: data.enabled ?? false,
      days: data.days || DAYS.slice(0, 5)
    });
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

  const handleEnabledChange = (e) => {
    setConfig(prev => ({ ...prev, enabled: e.target.checked }));
  };

  const toggleDay = (day) => {
    setConfig(prev => ({
      ...prev,
      days: prev.days.includes(day)
        ? prev.days.filter(d => d !== day)
        : [...prev.days, day]
    }));
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
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${localStorage.getItem('token')}`,
        },
        body: JSON.stringify({
          startTime: config.startTime,
          stopTime: config.stopTime,
          callsPerHour: Number(config.callsPerHour),
          enabled: config.enabled,
          days: config.days
        })
      });
      if (!res.ok) throw new Error('Request failed');
      await fetchConfig();
      setMessage({ type: 'success', text: 'Settings saved' });
    } catch (err) {
      setMessage({ type: 'error', text: 'Failed to save settings' });
    }
  };

  const cardBg = useColorModeValue('white', 'gray.700');

  return (
    <Box as="form" onSubmit={handleSubmit} maxW="md" mx="auto" bg={cardBg} p={6} borderRadius="xl" shadow="md">
      <VStack spacing={6} align="stretch">
        <Heading size="md" textAlign="center">Auto Call Settings</Heading>
        <FormControl display="flex" alignItems="center">
          <FormLabel flex="1" mb="0">Enable Auto Calls</FormLabel>
          <Switch isChecked={config.enabled} onChange={handleEnabledChange} />
        </FormControl>
        <Divider />
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
        <FormControl>
          <FormLabel>Active Days</FormLabel>
          <HStack spacing={2} flexWrap="wrap">
            {DAYS.map(day => (
              <Checkbox
                key={day}
                isChecked={config.days.includes(day)}
                onChange={() => toggleDay(day)}
              >
                {day}
              </Checkbox>
            ))}
          </HStack>
        </FormControl>
        <Button type="submit" colorScheme="brand" alignSelf="flex-end">Save</Button>
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

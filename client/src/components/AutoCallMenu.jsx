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
  useColorModeValue,
  Text,
  FormHelperText,
  Tag,
  SimpleGrid
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

  const cardBg = useColorModeValue('white', 'brand.900');
  const borderColor = useColorModeValue('brand.200', 'brand.700');
  const helperColor = useColorModeValue('brand.500', 'brand.300');

  return (
    <Box
      as="form"
      onSubmit={handleSubmit}
      maxW="lg"
      mx="auto"
      bg={cardBg}
      p={{ base: 6, md: 8 }}
      borderRadius="2xl"
      shadow={useColorModeValue('xl', 'md')}
      border="1px solid"
      borderColor={borderColor}
    >
      <VStack spacing={6} align="stretch">
        <VStack spacing={1} align="stretch">
          <Heading size="md" textAlign="left" color={useColorModeValue('brand.800', 'highlight.200')}>
            Auto Call Settings
          </Heading>
          <Text fontSize="sm" color={helperColor}>
            Define a respectful calling cadence so your team connects with homeowners when they&apos;re most likely to answer.
          </Text>
        </VStack>
        <FormControl display="flex" alignItems="center">
          <FormLabel flex="1" mb="0">Enable Auto Calls</FormLabel>
          <Switch isChecked={config.enabled} onChange={handleEnabledChange} colorScheme="accent" />
        </FormControl>
        <Divider />
        <SimpleGrid columns={{ base: 1, md: 2 }} spacing={4}>
          <FormControl>
            <FormLabel>Start Time</FormLabel>
            <Input type="time" name="startTime" value={config.startTime} onChange={handleChange} bg={useColorModeValue('brand.50', 'brand.800')} />
            <FormHelperText color={helperColor}>Local time to begin dialing.</FormHelperText>
          </FormControl>
          <FormControl>
            <FormLabel>Stop Time</FormLabel>
            <Input type="time" name="stopTime" value={config.stopTime} onChange={handleChange} bg={useColorModeValue('brand.50', 'brand.800')} />
            <FormHelperText color={helperColor}>Last call will start before this time.</FormHelperText>
          </FormControl>
        </SimpleGrid>
        <FormControl>
          <FormLabel>Calls Per Hour</FormLabel>
          <NumberInput min={1} value={config.callsPerHour} onChange={handleCallsChange}>
            <NumberInputField name="callsPerHour" bg={useColorModeValue('brand.50', 'brand.800')} />
          </NumberInput>
          <FormHelperText color={helperColor}>Balance agent focus with prompt responses.</FormHelperText>
        </FormControl>
        <FormControl>
          <FormLabel>Active Days</FormLabel>
          <HStack spacing={2} flexWrap="wrap">
            {DAYS.map(day => (
              <Tag
                key={day}
                size="lg"
                variant={config.days.includes(day) ? 'solid' : 'subtle'}
                colorScheme={config.days.includes(day) ? 'accent' : 'gray'}
                cursor="pointer"
                onClick={() => toggleDay(day)}
              >
                {day}
              </Tag>
            ))}
          </HStack>
        </FormControl>
        <Button type="submit" alignSelf="flex-end" colorScheme="accent" borderRadius="full">
          Save schedule
        </Button>
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

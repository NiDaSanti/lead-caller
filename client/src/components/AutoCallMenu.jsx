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
  Heading,
  useColorModeValue,
  Text,
  Wrap
} from '@chakra-ui/react';
import { apiFetch } from '../services/apiClient.js';

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
  const [loading, setLoading] = useState(false);

  const fetchConfig = async () => {
    setLoading(true);
    try {
      const res = await apiFetch('/api/scheduler/config');
      const data = await res.json();
      setConfig({
        startTime: data.startTime || '',
        stopTime: data.stopTime || '',
        callsPerHour: data.callsPerHour ?? 1,
        enabled: data.enabled ?? false,
        days: data.days || DAYS.slice(0, 5)
      });
    } catch {
      setMessage({ type: 'error', text: 'Could not load settings.' });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchConfig();
  }, []);

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
      setMessage({ type: 'error', text: 'Start time must be before stop time.' });
      return;
    }
    if (Number(config.callsPerHour) <= 0) {
      setMessage({ type: 'error', text: 'Calls per hour must be more than 0.' });
      return;
    }

    setLoading(true);
    try {
      const res = await apiFetch('/api/scheduler/config', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(config),
      });
      if (!res.ok) throw new Error('Could not save settings.');
      setMessage({ type: 'success', text: 'Saved.' });
    } catch (err) {
      setMessage({ type: 'error', text: err.message });
    } finally {
      setLoading(false);
    }
  };

  const cardBg = useColorModeValue('white', 'brand.900');
  const borderColor = useColorModeValue('brand.200', 'brand.700');
  const helperColor = useColorModeValue('brand.600', 'brand.300');
  const pageBg = useColorModeValue('brand.50', 'brand.900');
  const headingColor = useColorModeValue('brand.900', 'brand.50');
  const labelColor = useColorModeValue('brand.800', 'brand.100');
  const inputBg = useColorModeValue('white', 'brand.800');
  const inputBorder = useColorModeValue('brand.200', 'brand.700');
  const inputHoverBorder = useColorModeValue('brand.300', 'brand.600');
  const inputFocusBorder = useColorModeValue('accent.500', 'accent.400');
  const alertBg = useColorModeValue('brand.100', 'brand.800');
  const alertColor = useColorModeValue('brand.800', 'brand.100');
  const alertIconColor = useColorModeValue('brand.700', 'brand.100');

  return (
    <Box p={6} bg={pageBg} minH="100vh">
      <Box maxW="800px" mx="auto" bg={cardBg} p={6} borderRadius="md" shadow="lg" border="1px solid" borderColor={borderColor}>
        <Heading size="lg" mb={4} textAlign="center" color={headingColor}>
          Auto Calls
        </Heading>
        <Text fontSize="sm" mb={6} color={helperColor} textAlign="center">
          Set when calls can run.
        </Text>

        <VStack spacing={4} align="stretch" as="form" onSubmit={handleSubmit}>
          <FormControl>
            <FormLabel color={labelColor}>Start Time</FormLabel>
            <Input
              type="time"
              value={config.startTime}
              onChange={(e) => setConfig({ ...config, startTime: e.target.value })}
              bg={inputBg}
              borderColor={inputBorder}
              _hover={{ borderColor: inputHoverBorder }}
              _focusVisible={{ borderColor: inputFocusBorder, boxShadow: '0 0 0 1px var(--chakra-colors-accent-500)' }}
            />
          </FormControl>

          <FormControl>
            <FormLabel color={labelColor}>Stop Time</FormLabel>
            <Input
              type="time"
              value={config.stopTime}
              onChange={(e) => setConfig({ ...config, stopTime: e.target.value })}
              bg={inputBg}
              borderColor={inputBorder}
              _hover={{ borderColor: inputHoverBorder }}
              _focusVisible={{ borderColor: inputFocusBorder, boxShadow: '0 0 0 1px var(--chakra-colors-accent-500)' }}
            />
          </FormControl>

          <FormControl>
            <FormLabel color={labelColor}>Calls per hour</FormLabel>
            <NumberInput
              value={config.callsPerHour}
              onChange={(value) => setConfig({ ...config, callsPerHour: value })}
              min={1}
              max={100}
            >
              <NumberInputField
                bg={inputBg}
                borderColor={inputBorder}
                _hover={{ borderColor: inputHoverBorder }}
                _focusVisible={{ borderColor: inputFocusBorder, boxShadow: '0 0 0 1px var(--chakra-colors-accent-500)' }}
              />
            </NumberInput>
          </FormControl>

          <FormControl>
            <FormLabel color={labelColor}>On</FormLabel>
            <Switch
              isChecked={config.enabled}
              onChange={(e) => setConfig({ ...config, enabled: e.target.checked })}
              colorScheme="accent"
            />
          </FormControl>

          <FormControl>
            <FormLabel color={labelColor}>Days</FormLabel>
            <Wrap spacing={2}>
              {DAYS.map((day) => (
                <Button
                  key={day}
                  size="sm"
                  variant={config.days.includes(day) ? 'solid' : 'outline'}
                  colorScheme="accent"
                  onClick={() => toggleDay(day)}
                >
                  {day}
                </Button>
              ))}
            </Wrap>
          </FormControl>

          {message && (
            <Alert
              status={message.type}
              borderRadius="md"
              bg={alertBg}
              color={alertColor}
            >
              <AlertIcon color={alertIconColor} />
              {message.text}
            </Alert>
          )}

           <Button colorScheme="accent" size="lg" type="submit" isLoading={loading}>
            Save
          </Button>
        </VStack>
      </Box>
    </Box>
  );
}

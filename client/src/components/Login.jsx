import { useState } from 'react';
import {
  Box,
  Button,
  FormControl,
  FormLabel,
  Heading,
  Input,
  VStack,
  useToast,
  InputGroup,
  InputLeftElement,
  Image,
  useColorModeValue,
  Text,
  Stack
} from '@chakra-ui/react';
import { FiUser, FiLock } from 'react-icons/fi';
import PropTypes from 'prop-types';

export default function Login({ onLogin }) {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const toast = useToast();

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const res = await fetch('http://localhost:3000/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, password })
      });
      if (!res.ok) throw new Error('Login failed');
      const data = await res.json();
      localStorage.setItem('token', data.token);
      onLogin();
    } catch (err) {
      toast({ title: 'Login failed', status: 'error', duration: 3000, isClosable: true });
    }
  };

  const pageBg = useColorModeValue('linear-gradient(135deg, #F5F9FF 0%, #E8FFFB 100%)', 'brand.900');
  const cardBg = useColorModeValue('white', 'brand.800');
  const borderColor = useColorModeValue('brand.200', 'brand.700');
  const textMuted = useColorModeValue('brand.500', 'brand.200');

  return (
    <Box
      minH="100vh"
      display="flex"
      alignItems="center"
      justifyContent="center"
      bg={pageBg}
      p={4}
    >
      <Box
        as="form"
        onSubmit={handleSubmit}
        p={{ base: 8, md: 10 }}
        maxW="md"
        w="full"
        bg={cardBg}
        borderWidth="1px"
        borderColor={borderColor}
        borderRadius="2xl"
        boxShadow={useColorModeValue('xl', 'lg')}
      >
        <VStack spacing={8} align="stretch">
          <VStack spacing={3}>
            <Image src="/sunrun.svg" alt="Sunrun Logo" boxSize="60px" />
            <Heading size="lg" color={useColorModeValue('brand.800', 'highlight.200')}>Lead Caller</Heading>
            <Text fontSize="sm" color={textMuted}>Sign in to manage your outreach queue and nurture every homeowner relationship.</Text>
          </VStack>
          <Stack spacing={4}>
            <FormControl>
              <FormLabel>Username</FormLabel>
              <InputGroup>
                <InputLeftElement pointerEvents="none" color={textMuted}>
                  <FiUser />
                </InputLeftElement>
                <Input
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  borderRadius="lg"
                  bg={useColorModeValue('brand.50', 'brand.900')}
                />
              </InputGroup>
            </FormControl>
            <FormControl>
              <FormLabel>Password</FormLabel>
              <InputGroup>
                <InputLeftElement pointerEvents="none" color={textMuted}>
                  <FiLock />
                </InputLeftElement>
                <Input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  borderRadius="lg"
                  bg={useColorModeValue('brand.50', 'brand.900')}
                />
              </InputGroup>
            </FormControl>
          </Stack>
          <Button
            type="submit"
            colorScheme="accent"
            w="full"
            borderRadius="full"
            size="lg"
          >
            Login
          </Button>
        </VStack>
      </Box>
    </Box>
  );
}

Login.propTypes = {
  onLogin: PropTypes.func.isRequired,
};

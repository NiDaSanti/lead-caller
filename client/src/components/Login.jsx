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
  Image
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

  return (
    <Box
      minH="100vh"
      display="flex"
      alignItems="center"
      justifyContent="center"
      bg="brand.900"
      p={4}
    >
      <Box
        as="form"
        onSubmit={handleSubmit}
        p={10}
        maxW="md"
        w="full"
        bg="brand.800"
        borderWidth="1px"
        borderColor="brand.700"
        borderRadius="lg"
        boxShadow="lg"
      >
          <VStack spacing={8}>
            <Image src="/sunrun.svg" alt="Sunrun Logo" boxSize="60px" />
            <Heading size="lg" color="highlight.200">Lead Caller</Heading>
            <Heading size="md" color="brand.200">Sign In</Heading>
          <FormControl>
            <FormLabel>Username</FormLabel>
            <InputGroup>
              <InputLeftElement pointerEvents="none" color="brand.400">
                <FiUser />
              </InputLeftElement>
              <Input
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                borderRadius="md"
                color="highlight.50"
              />
            </InputGroup>
          </FormControl>
          <FormControl>
            <FormLabel>Password</FormLabel>
            <InputGroup>
              <InputLeftElement pointerEvents="none" color="brand.400">
                <FiLock />
              </InputLeftElement>
              <Input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                borderRadius="md"
                color="highlight.50"
              />
            </InputGroup>
          </FormControl>
          <Button
            type="submit"
            colorScheme="accent"
            w="full"
            borderRadius="md"
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

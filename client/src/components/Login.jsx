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
} from '@chakra-ui/react';
import { motion } from 'framer-motion';
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

  const MotionBox = motion(Box);

  return (
    <Box
      minH="100vh"
      display="flex"
      alignItems="center"
      justifyContent="center"
      bgGradient="linear(to-br, brand.500, accent.500)"
      p={4}
    >
      <MotionBox
        as="form"
        onSubmit={handleSubmit}
        p={8}
        maxW="md"
        w="full"
        bg="white"
        borderWidth="1px"
        borderRadius="lg"
        boxShadow="lg"
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <VStack spacing={6}>
          <Image src="/faviLogo.png" alt="Lead Caller Logo" boxSize="60px" />
          <Heading size="md">Sign In</Heading>
          <FormControl>
            <FormLabel>Username</FormLabel>
            <InputGroup>
              <InputLeftElement pointerEvents="none" color="gray.400">
                <FiUser />
              </InputLeftElement>
              <Input
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                borderRadius="md"
              />
            </InputGroup>
          </FormControl>
          <FormControl>
            <FormLabel>Password</FormLabel>
            <InputGroup>
              <InputLeftElement pointerEvents="none" color="gray.400">
                <FiLock />
              </InputLeftElement>
              <Input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                borderRadius="md"
              />
            </InputGroup>
          </FormControl>
          <Button
            type="submit"
            colorScheme="brand"
            w="full"
            borderRadius="md"
            _hover={{ bgGradient: 'linear(to-r, brand.600, accent.600)' }}
          >
            Login
          </Button>
        </VStack>
      </MotionBox>
    </Box>
  );
}

Login.propTypes = {
  onLogin: PropTypes.func.isRequired,
};

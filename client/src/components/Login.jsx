import { useState } from 'react';
import { Box, Button, FormControl, FormLabel, Heading, Input, VStack, useToast } from '@chakra-ui/react';
import { motion } from 'framer-motion';
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
    <Box minH="100vh" display="flex" alignItems="center" justifyContent="center">
      <MotionBox
        as="form"
        onSubmit={handleSubmit}
        p={8}
        borderWidth="1px"
        borderRadius="lg"
        boxShadow="md"
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <VStack spacing={4}>
          <Heading size="md">Sign In</Heading>
          <FormControl>
            <FormLabel>Username</FormLabel>
            <Input value={username} onChange={(e) => setUsername(e.target.value)} />
          </FormControl>
          <FormControl>
            <FormLabel>Password</FormLabel>
            <Input type="password" value={password} onChange={(e) => setPassword(e.target.value)} />
          </FormControl>
          <Button type="submit" colorScheme="blue" w="full">Login</Button>
        </VStack>
      </MotionBox>
    </Box>
  );
}

Login.propTypes = {
  onLogin: PropTypes.func.isRequired,
};

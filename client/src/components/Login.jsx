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
  useColorModeValue,
  Text,
  InputRightElement,
  IconButton,
  HStack,
  Checkbox,
  Divider,
  Icon
} from '@chakra-ui/react';
import { FiUser, FiLock, FiEye, FiEyeOff, FiLogIn, FiGithub, FiMail } from 'react-icons/fi';
import PropTypes from 'prop-types';
import { login as loginWithCookie } from '../services/auth.js';
import { getApiBase } from '../services/apiClient.js';

export default function Login({ onLogin }) {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const toast = useToast();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      await loginWithCookie({ username, password, apiBase: getApiBase() });
      onLogin();
    } catch (err) {
      toast({
        title: 'Sign in failed',
        description: err?.message || 'Check your username and password.',
        status: 'error',
        duration: 3500,
        isClosable: true
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const pageBg = useColorModeValue(
    'radial-gradient(1000px circle at 0% 0%, rgba(59,130,246,0.14), transparent 55%), radial-gradient(900px circle at 100% 20%, rgba(15,23,42,0.06), transparent 50%), linear-gradient(180deg, #F8FAFC 0%, #F1F5F9 100%)',
    'radial-gradient(900px circle at 10% 0%, rgba(59,130,246,0.16), transparent 55%), linear-gradient(180deg, #0F172A 0%, #020617 100%)'
  );
  const cardBg = useColorModeValue('white', 'brand.900');
  const borderColor = useColorModeValue('brand.200', 'brand.700');
  const textMuted = useColorModeValue('brand.600', 'brand.300');
  const headingColor = useColorModeValue('brand.900', 'brand.50');
  const cardShadow = useColorModeValue('0 18px 55px rgba(15,23,42,0.10)', '0 18px 55px rgba(0,0,0,0.55)');

  const [showPassword, setShowPassword] = useState(false);
  const [remember, setRemember] = useState(true);

  return (
    <Box minH="100vh" bg={pageBg} p={{ base: 6, md: 10 }} display="flex" alignItems="center" justifyContent="center">
      <Box
        as="form"
        onSubmit={handleSubmit}
        bg={cardBg}
        borderRadius="2xl"
        p={{ base: 7, md: 9 }}
        w={{ base: '100%', sm: '420px' }}
        boxShadow={cardShadow}
        border="1px solid"
        borderColor={borderColor}
        backdropFilter="saturate(180%) blur(10px)"
      >
        <VStack spacing={5} align="stretch">
          <VStack spacing={1} textAlign="center">
            <HStack spacing={2} justify="center">
              <Box
                w={10}
                h={10}
                borderRadius="full"
                bg={useColorModeValue('accent.100', 'whiteAlpha.200')}
                display="flex"
                alignItems="center"
                justifyContent="center"
              >
                <Icon as={FiLogIn} color={useColorModeValue('accent.700', 'accent.200')} />
              </Box>
              <Heading size="lg" color={headingColor}>Sign in</Heading>
            </HStack>
            <Text fontSize="sm" color={textMuted}>Use your account to continue.</Text>
          </VStack>

          <FormControl id="username" isRequired>
            <FormLabel>Username</FormLabel>
            <InputGroup>
              <InputLeftElement pointerEvents="none">
                <Icon as={FiUser} color={textMuted} />
              </InputLeftElement>
              <Input
                type="text"
                placeholder="Username"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                autoComplete="username"
              />
            </InputGroup>
          </FormControl>

          <FormControl id="password" isRequired>
            <FormLabel>Password</FormLabel>
            <InputGroup>
              <InputLeftElement pointerEvents="none">
                <Icon as={FiLock} color={textMuted} />
              </InputLeftElement>
              <Input
                type={showPassword ? 'text' : 'password'}
                placeholder="Password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                autoComplete={remember ? 'current-password' : 'off'}
              />
              <InputRightElement>
                <IconButton
                  aria-label="Toggle password visibility"
                  icon={showPassword ? <FiEyeOff /> : <FiEye />}
                  onClick={() => setShowPassword(!showPassword)}
                  variant="ghost"
                  size="sm"
                />
              </InputRightElement>
            </InputGroup>
          </FormControl>

          <HStack justify="space-between" align="center">
            <Checkbox
              isChecked={remember}
              onChange={(e) => setRemember(e.target.checked)}
              colorScheme="accent"
              size="sm"
            >
              Remember me
            </Checkbox>
            <Text fontSize="sm" color={textMuted}>
              {isSubmitting ? 'Signing in…' : ' '}
            </Text>
          </HStack>

          <Button
            type="submit"
            size="lg"
            w="full"
            isLoading={isSubmitting}
            loadingText="Signing in"
            isDisabled={!username || !password}
            leftIcon={<Icon as={FiLogIn} />}
          >
            Sign in
          </Button>

          <Divider />

          <VStack spacing={2}>
            <Text fontSize="xs" color={textMuted}>
              Need access? Update credentials on the server.
            </Text>
            <HStack spacing={2} justify="center">
              <Icon as={FiMail} color={textMuted} />
              <Icon as={FiGithub} color={textMuted} />
            </HStack>
          </VStack>
        </VStack>
      </Box>
    </Box>
  );
}

Login.propTypes = {
  onLogin: PropTypes.func.isRequired,
};

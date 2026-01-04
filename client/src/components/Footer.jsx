import PropTypes from 'prop-types';
import {
  Box,
  Divider,
  Stack,
  Text,
  useColorModeValue,
} from '@chakra-ui/react';

export default function Footer({ appName = 'Call Leads' }) {
  const year = new Date().getFullYear();
  const bg = useColorModeValue('white', 'black');
  const border = useColorModeValue('brand.200', 'brand.700');
  const muted = useColorModeValue('brand.600', 'brand.300');

  return (
    <Box as="footer" bg={bg} borderTop="1px solid" borderColor={border} mt={10} w="100%">
      <Divider borderColor={border} opacity={0.6} />
      <Box px={{ base: 6, md: 10 }} py={5} w="100%">
        <Stack
          direction={{ base: 'column', md: 'row' }}
          align={{ base: 'flex-start', md: 'center' }}
          justify="space-between"
          spacing={2}
        >
          <Text fontWeight="semibold">{appName}</Text>
          <Text fontSize="sm" color={muted}>
            © {year} • Support: admin
          </Text>
        </Stack>
      </Box>
    </Box>
  );
}

Footer.propTypes = {
  appName: PropTypes.string,
};

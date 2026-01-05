import { useEffect, useState } from 'react';
import PropTypes from 'prop-types';
import {
  Box, VStack, HStack, Heading, Text, Switch, FormControl, FormLabel,
  Button, Divider, NumberInput, NumberInputField, useColorModeValue, useToast,
  SimpleGrid, Icon, Input
} from '@chakra-ui/react';
import { FiSettings, FiDownload, FiUpload, FiTrash2 } from 'react-icons/fi';

const DEFAULTS = {
  compactView: false,
  itemsPerPage: 20,
  notifyEmail: true,
  notifySMS: false
};

export default function SettingsPanel({ showForm, setShowForm, showLeads, setShowLeads, colorMode, toggleColorMode, setModalView }) {
  const toast = useToast();
  const [compactView, setCompactView] = useState(DEFAULTS.compactView);
  const [itemsPerPage, setItemsPerPage] = useState(DEFAULTS.itemsPerPage);
  const [notifyEmail, setNotifyEmail] = useState(DEFAULTS.notifyEmail);
  const [notifySMS, setNotifySMS] = useState(DEFAULTS.notifySMS);

  useEffect(() => {
    const cfg = JSON.parse(localStorage.getItem('uiSettings') || '{}');
    if (cfg.compactView !== undefined) setCompactView(cfg.compactView);
    if (cfg.itemsPerPage) setItemsPerPage(cfg.itemsPerPage);
    if (cfg.notifyEmail !== undefined) setNotifyEmail(cfg.notifyEmail);
    if (cfg.notifySMS !== undefined) setNotifySMS(cfg.notifySMS);
  }, []);

  const saveSettings = () => {
    const cfg = { compactView, itemsPerPage, notifyEmail, notifySMS };
    localStorage.setItem('uiSettings', JSON.stringify(cfg));
    toast({ title: 'Settings saved', status: 'success', duration: 3000, isClosable: true });
  };

  const resetDefaults = () => {
    setCompactView(DEFAULTS.compactView);
    setItemsPerPage(DEFAULTS.itemsPerPage);
    setNotifyEmail(DEFAULTS.notifyEmail);
    setNotifySMS(DEFAULTS.notifySMS);
    localStorage.removeItem('uiSettings');
    toast({ title: 'Settings reset', status: 'info', duration: 3000, isClosable: true });
  };

  const exportSettings = () => {
    const data = JSON.stringify({ uiSettings: JSON.parse(localStorage.getItem('uiSettings') || '{}') }, null, 2);
    const blob = new Blob([data], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'lead-caller-settings.json';
    a.click();
    URL.revokeObjectURL(url);
    toast({ title: 'Export started', status: 'info', duration: 2000 });
  };

  const importSettings = (file) => {
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const parsed = JSON.parse(e.target.result);
        const cfg = parsed.uiSettings || parsed;
        localStorage.setItem('uiSettings', JSON.stringify(cfg));
        setCompactView(!!cfg.compactView);
        setItemsPerPage(cfg.itemsPerPage || DEFAULTS.itemsPerPage);
        setNotifyEmail(!!cfg.notifyEmail);
        setNotifySMS(!!cfg.notifySMS);
        toast({ title: 'Settings imported', status: 'success', duration: 3000 });
      } catch (err) {
        toast({
          title: 'Import Failed',
          description: 'The uploaded file is not a valid settings file. Please check the format and try again.',
          status: 'error',
          duration: 4000,
          isClosable: true
        });
      }
    };
    reader.readAsText(file);
  };

  const headerBg = useColorModeValue('linear-gradient(90deg,#e0f2fe,#eff6ff)', 'linear-gradient(90deg,#1f2937,#0f172a)');

  return (
    <Box>
      <Box bg={headerBg} p={4} borderRadius="lg" mb={4}>
        <HStack justify="space-between">
          <HStack>
            <Icon as={FiSettings} boxSize={6} />
            <VStack align="start" spacing={0}>
              <Heading size="md">Settings</Heading>
              <Text fontSize="sm">Set up your app.</Text>
            </VStack>
          </HStack>
          <HStack>
            <Button size="sm" leftIcon={<FiDownload />} variant="ghost" onClick={exportSettings}>Export</Button>
            <label>
              <Input type="file" display="none" accept="application/json" onChange={(e) => importSettings(e.target.files[0])} />
              <Button size="sm" leftIcon={<FiUpload />} variant="ghost">Import</Button>
            </label>
            <Button size="sm" leftIcon={<FiTrash2 />} variant="ghost" onClick={resetDefaults}>Reset</Button>
          </HStack>
        </HStack>
      </Box>

      <VStack spacing={6} align="stretch">
        <Box>
          <Heading size="sm" mb={2}>Interface</Heading>
          <SimpleGrid columns={{ base: 1, md: 2 }} spacing={4}>
            <FormControl display="flex" alignItems="center">
              <FormLabel mb={0} flex="1">Show lead form</FormLabel>
              <Switch isChecked={showForm} onChange={(e) => setShowForm(e.target.checked)} />
            </FormControl>
            <FormControl display="flex" alignItems="center">
              <FormLabel mb={0} flex="1">Show lead list</FormLabel>
              <Switch isChecked={showLeads} onChange={(e) => setShowLeads(e.target.checked)} />
            </FormControl>

            <FormControl display="flex" alignItems="center">
              <FormLabel mb={0} flex="1">Dark mode</FormLabel>
              <Switch isChecked={colorMode === 'dark'} onChange={toggleColorMode} />
            </FormControl>
            <FormControl>
              <FormLabel>Compact list view</FormLabel>
              <HStack>
                <Switch isChecked={compactView} onChange={(e) => setCompactView(e.target.checked)} />
                <Text fontSize="sm" color={useColorModeValue('textMuted', 'textMuted')}>Tighter list</Text>
              </HStack>
            </FormControl>
            <FormControl>
              <FormLabel>Items per page</FormLabel>
              <NumberInput min={5} max={200} value={itemsPerPage} onChange={(_, v) => setItemsPerPage(Number(v))}>
                <NumberInputField />
              </NumberInput>
            </FormControl>
          </SimpleGrid>
        </Box>

        <Divider />

        <Box>
          <Heading size="sm" mb={2}>Notifications</Heading>
          <SimpleGrid columns={{ base: 1, md: 2 }} spacing={4}>
            <FormControl display="flex" alignItems="center">
              <FormLabel mb={0} flex="1">Email notifications</FormLabel>
              <Switch isChecked={notifyEmail} onChange={(e) => setNotifyEmail(e.target.checked)} />
            </FormControl>
            <FormControl display="flex" alignItems="center">
              <FormLabel mb={0} flex="1">SMS notifications</FormLabel>
              <Switch isChecked={notifySMS} onChange={(e) => setNotifySMS(e.target.checked)} />
            </FormControl>
          </SimpleGrid>
        </Box>

        <Divider />

        <Box>
          <Heading size="sm" mb={2}>Integrations & Tools</Heading>
          <VStack align="stretch" spacing={3}>
            <HStack justify="space-between">
              <Text>Auto Call Settings</Text>
              <Button size="sm" onClick={() => setModalView('autoCall')}>Open</Button>
            </HStack>
            <HStack justify="space-between">
              <Text>Import / Export</Text>
              <Text fontSize="sm" color={useColorModeValue('textMuted', 'textMuted')}>Save settings to a file</Text>
            </HStack>
          </VStack>
        </Box>

        <Divider />

        <HStack justify="flex-end" spacing={3}>
          <Button variant="ghost" onClick={resetDefaults}>Reset</Button>
          <Button colorScheme="accent" onClick={saveSettings}>Save</Button>
        </HStack>
      </VStack>
    </Box>
  );
}

SettingsPanel.propTypes = {
  showForm: PropTypes.bool.isRequired,
  setShowForm: PropTypes.func.isRequired,
  showLeads: PropTypes.bool.isRequired,
  setShowLeads: PropTypes.func.isRequired,
  colorMode: PropTypes.string.isRequired,
  toggleColorMode: PropTypes.func.isRequired,
  setModalView: PropTypes.func.isRequired,
};

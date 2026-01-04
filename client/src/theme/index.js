import { extendTheme } from '@chakra-ui/react'

const theme = extendTheme({
  colors: {
    brand: {
      // Neutral slate base (professional, readable)
      50: '#F8FAFC',
      100: '#F1F5F9',
      200: '#E2E8F0',
      300: '#CBD5E1',
      400: '#94A3B8',
      500: '#64748B',
      600: '#475569',
      700: '#334155',
      800: '#1E293B',
      900: '#0F172A',
    },
    accent: {
      // Blue accent (modern, trustworthy)
      50: '#EFF6FF',
      100: '#DBEAFE',
      200: '#BFDBFE',
      300: '#93C5FD',
      400: '#60A5FA',
      500: '#3B82F6',
      600: '#2563EB',
      700: '#1D4ED8',
      800: '#1E40AF',
      900: '#1E3A8A',
    },
    highlight: {
      // Teal highlight (accessible alternative to yellow)
      50: '#F0FDFA',
      100: '#CCFBF1',
      200: '#99F6E4',
      300: '#5EEAD4',
      400: '#2DD4BF',
      500: '#14B8A6',
      600: '#0D9488',
      700: '#0F766E',
      800: '#115E59',
      900: '#134E4A',
    },
  },
  fonts: {
    heading: 'Roboto, sans-serif',
    body: 'Roboto, sans-serif',
  },
  styles: {
    global: (props) => ({
      body: {
        bg: props.colorMode === 'dark' ? 'brand.900' : 'brand.50',
        color: props.colorMode === 'dark' ? 'brand.50' : 'brand.900',
        fontFeatureSettings: "'tnum'",
      },
    }),
  },
  components: {
    Button: {
      baseStyle: {
        borderRadius: 'md',
        fontWeight: 'semibold',
        letterSpacing: 'normal',
      },
      variants: {
        solid: {
          bg: 'accent.600',
          color: 'white',
          _hover: {
            bg: 'accent.700',
          },
          _active: {
            bg: 'accent.800',
          },
        },
        outline: {
          borderColor: 'brand.300',
          color: 'brand.700',
          _hover: {
            bg: 'brand.100',
            borderColor: 'brand.400',
          },
        },
        ghost: {
          color: 'brand.700',
          _hover: {
            bg: 'brand.100',
          },
        },
      },
      defaultProps: {
        colorScheme: 'accent',
      },
    },
    Badge: {
      baseStyle: {
        textTransform: 'uppercase',
        letterSpacing: 'wider',
      },
    },
    Input: {
      defaultProps: {
        focusBorderColor: 'accent.500',
        variant: 'filled',
      },
      baseStyle: {
        field: {
          borderRadius: 'lg',
        },
      },
      variants: {
        filled: {
          field: {
            bg: 'white',
            _dark: {
              bg: 'brand.800',
            },
            border: '1px solid',
            borderColor: 'brand.200',
            _hover: {
              borderColor: 'brand.300',
            },
            _focusVisible: {
              borderColor: 'accent.500',
              boxShadow: '0 0 0 1px var(--chakra-colors-accent-500)',
            },
          },
        },
      },
    },
    Textarea: {
      defaultProps: {
        focusBorderColor: 'accent.500',
        variant: 'filled',
      },
      baseStyle: {
        borderRadius: 'lg',
      },
      variants: {
        filled: {
          bg: 'white',
          _dark: {
            bg: 'brand.800',
          },
          border: '1px solid',
          borderColor: 'brand.200',
          _hover: {
            borderColor: 'brand.300',
          },
        },
      },
    },
    NumberInput: {
      defaultProps: {
        focusBorderColor: 'accent.500',
      },
    },
  },
})

export default theme

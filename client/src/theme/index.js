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
  radii: {
    xl: '1rem',
    '2xl': '1.25rem',
  },
  shadows: {
    // Consistent surface shadows across the app
    surface: '0 10px 30px rgba(15, 23, 42, 0.10)',
    surfaceDark: '0 12px 34px rgba(0, 0, 0, 0.45)',
  },
  semanticTokens: {
    colors: {
      surface: { default: 'white', _dark: 'brand.900' },
      surfaceMuted: { default: 'brand.50', _dark: 'brand.800' },
      surfaceBorder: { default: 'brand.200', _dark: 'brand.700' },
      textMuted: { default: 'brand.600', _dark: 'brand.300' },
    },
    shadows: {
      surface: { default: 'surface', _dark: 'surfaceDark' },
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
    Card: {
      baseStyle: {
        container: {
          borderRadius: '2xl',
          border: '1px solid',
          borderColor: 'surfaceBorder',
          bg: 'surface',
          boxShadow: 'surface',
        },
      },
    },
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
          _dark: {
            borderColor: 'brand.600',
            color: 'brand.100',
            _hover: {
              bg: 'brand.800',
              borderColor: 'brand.500',
            },
          },
        },
        ghost: {
          color: 'brand.700',
          _hover: {
            bg: 'brand.100',
          },
          _dark: {
            color: 'brand.100',
            _hover: {
              bg: 'brand.800',
            },
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
            bg: 'surface',
            _dark: {
              bg: 'brand.800',
            },
            border: '1px solid',
            borderColor: 'surfaceBorder',
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
          bg: 'surface',
          _dark: {
            bg: 'brand.800',
          },
          border: '1px solid',
          borderColor: 'surfaceBorder',
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

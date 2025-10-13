import { extendTheme } from '@chakra-ui/react'

const theme = extendTheme({
  colors: {
    brand: {
      50: '#F5F8FF',
      100: '#E6EEFF',
      200: '#CBD9FF',
      300: '#A5BFFE',
      400: '#7AA2FA',
      500: '#567EEB',
      600: '#3D63CD',
      700: '#2D4AA7',
      800: '#243A82',
      900: '#1D2E66',
    },
    accent: {
      50: '#E6FFFA',
      100: '#B2F5EA',
      200: '#81E6D9',
      300: '#4FD1C5',
      400: '#38B2AC',
      500: '#2C7A7B',
      600: '#285E61',
      700: '#234E52',
      800: '#1E3F43',
      900: '#1A3538',
    },
    highlight: {
      50: '#FFF8EB',
      100: '#FFE2B8',
      200: '#FFC685',
      300: '#FFA455',
      400: '#FF8A2B',
      500: '#F97012',
      600: '#D65A0C',
      700: '#B14609',
      800: '#823205',
      900: '#4F1D02',
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
        color: props.colorMode === 'dark' ? 'highlight.50' : 'brand.900',
        fontFeatureSettings: "'tnum'",
      },
    }),
  },
  components: {
    Button: {
      baseStyle: {
        borderRadius: 'full',
        fontWeight: 'semibold',
        letterSpacing: 'wide',
      },
      variants: {
        solid: {
          bg: 'accent.500',
          color: 'white',
          _hover: {
            bg: 'accent.400',
          },
          _active: {
            bg: 'accent.600',
          },
        },
        outline: {
          borderColor: 'highlight.400',
          color: 'highlight.400',
          _hover: {
            bg: 'highlight.50',
            color: 'brand.900',
          },
        },
        ghost: {
          color: 'brand.500',
          _hover: {
            bg: 'brand.100',
          },
        },
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
        focusBorderColor: 'accent.400',
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
          },
        },
      },
    },
    Textarea: {
      defaultProps: {
        focusBorderColor: 'accent.400',
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
        },
      },
    },
    NumberInput: {
      defaultProps: {
        focusBorderColor: 'accent.400',
      },
    },
  },
})

export default theme

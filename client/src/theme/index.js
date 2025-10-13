import { extendTheme } from '@chakra-ui/react'

const theme = extendTheme({
  colors: {
    brand: {
      50: '#E9E9ED',
      100: '#CACBD4',
      200: '#A4A6B3',
      300: '#7D8091',
      400: '#56596F',
      500: '#3B3E57',
      600: '#2B2D40',
      700: '#1C1E2A',
      800: '#12141C',
      900: '#08090F',
    },
    accent: {
      50: '#FBEAEA',
      100: '#F4C5C5',
      200: '#EAA0A0',
      300: '#DD7A7A',
      400: '#C35353',
      500: '#9F3636',
      600: '#812727',
      700: '#641D1D',
      800: '#431212',
      900: '#240808',
    },
    highlight: {
      50: '#FFF8E5',
      100: '#FDE5B5',
      200: '#F8CF7F',
      300: '#F1B84A',
      400: '#E7A31E',
      500: '#C88512',
      600: '#9C6510',
      700: '#70470C',
      800: '#432B07',
      900: '#1E1402',
    },
  },
  fonts: {
    heading: 'Roboto, sans-serif',
    body: 'Roboto, sans-serif',
  },
  styles: {
    global: (props) => ({
      body: {
        bg: props.colorMode === 'dark' ? 'brand.900' : 'white',
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
          color: 'highlight.300',
          _hover: {
            bg: 'highlight.400',
            color: 'brand.900',
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
  },
})

export default theme

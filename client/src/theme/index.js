import { extendTheme } from '@chakra-ui/react'

const theme = extendTheme({
  colors: {
    brand: {
      50: '#f5faff',
      100: '#e0eaff',
      200: '#b3ccff',
      300: '#80aaff',
      400: '#4d88ff',
      500: '#1a66ff',
      600: '#004de6',
      700: '#0038b4',
      800: '#002282',
      900: '#000c51',
    },
  },
  fonts: {
    heading: 'Inter, sans-serif',
    body: 'Inter, sans-serif',
  },
  components: {
    Button: {
      baseStyle: {
        borderRadius: 'md',
      },
      variants: {
        solid: {
          bg: 'brand.500',
          color: 'white',
          _hover: {
            bg: 'brand.600',
          },
        },
      },
    },
  },
})

export default theme

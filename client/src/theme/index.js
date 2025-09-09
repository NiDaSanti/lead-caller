import { extendTheme } from '@chakra-ui/react'

const theme = extendTheme({
  colors: {
    brand: {
      50: '#e6f9ff',
      100: '#b3ecff',
      200: '#80e0ff',
      300: '#4dd3ff',
      400: '#1ac7ff',
      500: '#00adee',
      600: '#0089bb',
      700: '#006588',
      800: '#004155',
      900: '#001c22',
    },
    accent: {
      50: '#fff9e6',
      100: '#ffeec4',
      200: '#ffe2a1',
      300: '#ffd57f',
      400: '#ffc95c',
      500: '#fdb913',
      600: '#d99c0e',
      700: '#b57f0a',
      800: '#926206',
      900: '#6e4503',
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
          bgGradient: 'linear(to-r, brand.500, accent.400)',
          color: 'white',
          _hover: {
            bgGradient: 'linear(to-r, brand.600, accent.500)',
          },
        },
      },
    },
  },
})

export default theme

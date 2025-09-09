import { extendTheme } from '@chakra-ui/react'

const theme = extendTheme({
  colors: {
    brand: {
      50: '#e6f9fe',
      100: '#b3ecfc',
      200: '#80def9',
      300: '#4dd0f6',
      400: '#26c1f2',
      500: '#00AEEF',
      600: '#009bd6',
      700: '#0082b3',
      800: '#006a91',
      900: '#004560',
    },
    accent: {
      50: '#fff8e1',
      100: '#ffecb3',
      200: '#ffe082',
      300: '#ffd54f',
      400: '#ffca28',
      500: '#FFB612',
      600: '#f0a400',
      700: '#d98f00',
      800: '#b37a00',
      900: '#805700',
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
          bgGradient: 'linear(to-r, brand.500, accent.500)',
          color: 'white',
          _hover: {
            bgGradient: 'linear(to-r, brand.600, accent.600)',
          },
        },
      },
    },
  },
})

export default theme

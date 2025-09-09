import { extendTheme } from '@chakra-ui/react'

const theme = extendTheme({
  colors: {
    brand: {
      50: '#E3F8FF',
      100: '#B3ECFF',
      200: '#81E0FF',
      300: '#4DD4FF',
      400: '#1AC8FF',
      500: '#00AEEF',
      600: '#008BC8',
      700: '#006A9E',
      800: '#004873',
      900: '#002648',
    },
    accent: {
      50: '#F2F2F2',
      100: '#E6E7E8',
      200: '#D1D3D4',
      300: '#BBBDBF',
      400: '#A5A7A9',
      500: '#808285',
      600: '#64666A',
      700: '#4D4F51',
      800: '#2F3033',
      900: '#1A1B1D',
    },
  },
  fonts: {
    heading: 'Roboto, sans-serif',
    body: 'Roboto, sans-serif',
  },
  styles: {
    global: (props) => ({
      body: {
        bg: props.colorMode === 'dark' ? 'gray.900' : 'gray.50',
        color: props.colorMode === 'dark' ? 'gray.50' : 'gray.800',
      },
    }),
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

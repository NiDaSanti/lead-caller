import { extendTheme } from '@chakra-ui/react'

const theme = extendTheme({
  colors: {
    brand: {
      50: '#ffe5f0',
      100: '#ffc2db',
      200: '#ff9dc5',
      300: '#ff76af',
      400: '#ff4d99',
      500: '#e60082',
      600: '#b40066',
      700: '#820049',
      800: '#50002d',
      900: '#210011',
    },
    accent: {
      50: '#e0f7fa',
      100: '#b2ebf2',
      200: '#80deea',
      300: '#4dd0e1',
      400: '#26c6da',
      500: '#00bcd4',
      600: '#00acc1',
      700: '#0097a7',
      800: '#00838f',
      900: '#006064',
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

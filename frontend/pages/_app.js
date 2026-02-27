import { Box, ChakraProvider, extendTheme } from "@chakra-ui/react";
import "../styles/globals.css";

const theme = extendTheme({
  config: {
    initialColorMode: "dark",
    useSystemColorMode: false,
  },
  styles: {
    global: {
      body: {
        bg: "#0a0a0a",
        color: "#c0c0c0",
      },
    },
  },
  fontSizes: {
    xs: "13px",
    sm: "15px",
    md: "17px",
    lg: "19px",
    xl: "22px",
    "2xl": "26px",
    "3xl": "30px",
    "4xl": "36px",
  },
  colors: {
    brand: {
      orange: "#ff6600",
      plomo: "#8a8a8a",
      surface: "#111111",
      elevated: "#1a1a1a",
      border: "#2a2a2a",
    },
    stress: {
      low: "#00e87a",
      medium: "#ff9500",
      high: "#ff2244",
    },
  },
  fonts: {
    heading: `'Segoe UI', system-ui, sans-serif`,
    body: `'Segoe UI', system-ui, sans-serif`,
  },
  components: {
    Input: {
      variants: {
        outline: {
          field: {
            bg: "#0d0d0d",
            borderColor: "#484848",
            color: "#c0c0c0",
            fontSize: "15px",
            _placeholder: { color: "#7a7a7a" },
            _focus: { borderColor: "#ff6600", boxShadow: "0 0 0 1px rgba(255,102,0,0.5)" },
            _hover: { borderColor: "#6a6a6a" },
          },
        },
      },
    },
    Textarea: {
      variants: {
        outline: {
          bg: "#0d0d0d",
          borderColor: "#484848",
          color: "#c0c0c0",
          fontSize: "15px",
          _placeholder: { color: "#7a7a7a" },
          _focus: { borderColor: "#ff6600", boxShadow: "0 0 0 1px rgba(255,102,0,0.5)" },
          _hover: { borderColor: "#6a6a6a" },
        },
      },
    },
  },
});

export default function App({ Component, pageProps }) {
  return (
    <ChakraProvider theme={theme}>
      {/* Mosaico diagonal de fondo — sobredimensionado para cubrir el viewport al rotar */}
      <Box
        position="fixed"
        top="-50%"
        left="-50%"
        w="200vw"
        h="200vh"
        bgImage="url('/img/yachaFlexlogo.png')"
        bgRepeat="repeat"
        bgSize="201px 201px"
        opacity={0.25}
        transform="rotate(-25deg)"
        pointerEvents="none"
        zIndex={0}
      />
      {/* Contenido de la app — siempre encima del mosaico */}
      <Box position="relative" zIndex={1} minH="100vh">
        <Component {...pageProps} />
      </Box>
    </ChakraProvider>
  );
}

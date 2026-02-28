import { Box, ChakraProvider, extendTheme } from "@chakra-ui/react";
import ThemeToggle from "../components/ui/ThemeToggle";
import "../styles/globals.css";

const theme = extendTheme({
  config: {
    initialColorMode: "dark",
    useSystemColorMode: false,
  },
  semanticTokens: {
    colors: {
      "ui.surface": { default: "#f5f5f0", _dark: "#0a0a0a" },
      "ui.card": { default: "#ffffff", _dark: "#111111" },
      "ui.deep": { default: "#f8f8f3", _dark: "#0d0d0d" },
      "ui.elevated": { default: "#f0f0eb", _dark: "#1a1a1a" },
      "ui.text": { default: "#1a1a1a", _dark: "#c0c0c0" },
      "ui.textSub": { default: "#555555", _dark: "#8a8a8a" },
      "ui.textMuted": { default: "#888888", _dark: "#6d6b6b" },
      "ui.textLight": { default: "#666666", _dark: "#9c9c9c" },
      "ui.textBright": { default: "#333333", _dark: "#dddddd" },
      "ui.border": { default: "#d0d0d0", _dark: "#484848" },
      "ui.borderMid": { default: "#bbbbbb", _dark: "#555555" },
      "ui.borderLight": { default: "#eeeeee", _dark: "#2a2a2a" },
      "ui.disabledBg": { default: "#e0e0e0", _dark: "#1e1e1e" },
      "ui.disabledText": { default: "#aaaaaa", _dark: "#3a3a3a" },
      "ui.errorBg": { default: "#fff0f3", _dark: "#1a0810" },
    },
  },
  styles: {
    global: {
      body: {
        bg: "ui.surface",
        color: "ui.text",
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
            bg: "ui.deep",
            borderColor: "ui.border",
            color: "ui.text",
            fontSize: "15px",
            _placeholder: { color: "ui.textMuted" },
            _focus: { borderColor: "#ff6600", boxShadow: "0 0 0 1px rgba(255,102,0,0.5)" },
            _hover: { borderColor: "ui.textMuted" },
          },
        },
      },
    },
    Textarea: {
      variants: {
        outline: {
          bg: "ui.deep",
          borderColor: "ui.border",
          color: "ui.text",
          fontSize: "15px",
          _placeholder: { color: "ui.textMuted" },
          _focus: { borderColor: "#ff6600", boxShadow: "0 0 0 1px rgba(255,102,0,0.5)" },
          _hover: { borderColor: "ui.textMuted" },
        },
      },
    },
  },
});

import HealthBadge from "../components/HealthBadge";

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
        opacity={0.10}
        transform="rotate(-25deg)"
        pointerEvents="none"
        zIndex={0}
      />
      {/* Contenido de la app — siempre encima del mosaico */}
      <Box position="relative" zIndex={1} minH="100vh">
        <ThemeToggle />
        <Component {...pageProps} />
        <HealthBadge />
      </Box>
    </ChakraProvider>
  );
}

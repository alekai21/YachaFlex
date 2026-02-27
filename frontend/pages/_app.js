import { ChakraProvider, extendTheme } from "@chakra-ui/react";
import "../styles/globals.css";

const theme = extendTheme({
  colors: {
    brand: {
      50: "#e8f5e9",
      500: "#4caf50",
      600: "#43a047",
      700: "#388e3c",
    },
    stress: {
      low: "#4caf50",
      medium: "#ff9800",
      high: "#f44336",
    },
  },
  fonts: {
    heading: `'Segoe UI', sans-serif`,
    body: `'Segoe UI', sans-serif`,
  },
});

export default function App({ Component, pageProps }) {
  return (
    <ChakraProvider theme={theme}>
      <Component {...pageProps} />
    </ChakraProvider>
  );
}

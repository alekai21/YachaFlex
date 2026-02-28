import { Box, Grid, Text } from "@chakra-ui/react";
import { useState } from "react";

export default function FlashCards({ cards }) {
  const [flipped, setFlipped] = useState({});

  return (
    <Grid templateColumns="repeat(auto-fill, minmax(220px, 1fr))" gap={4}>
      {cards.map((card, i) => (
        <Box
          key={i}
          p={4}
          borderRadius="6px"
          border="1px solid"
          borderColor={flipped[i] ? "rgba(255,102,0,0.55)" : "#555555"}
          bg={flipped[i] ? "rgba(255,102,0,0.05)" : "#0d0d0d"}
          cursor="pointer"
          onClick={() => setFlipped((f) => ({ ...f, [i]: !f[i] }))}
          minH="120px"
          display="flex"
          alignItems="center"
          justifyContent="center"
          textAlign="center"
          transition="all 0.2s"
          _hover={{ borderColor: "#7a7a7a", boxShadow: "0 0 12px rgba(138,138,138,0.12)" }}
        >
          <Box>
            <Text fontSize="xs" color={flipped[i] ? "#8a8a8a" : "#6d6b6b"} letterSpacing="0.08em" mb={2} textTransform="uppercase">
              {flipped[i] ? "Respuesta" : "Pregunta"}
            </Text>
            <Text fontWeight={flipped[i] ? "400" : "600"} color={flipped[i] ? "#c0c0c0" : "#e0e0e0"} fontSize="sm" lineHeight="1.5">
              {flipped[i] ? card.answer : card.question}
            </Text>
          </Box>
        </Box>
      ))}
    </Grid>
  );
}

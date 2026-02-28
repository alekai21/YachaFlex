import { Box, Grid, Text, useColorModeValue } from "@chakra-ui/react";
import { useState } from "react";

export default function FlashCards({ cards }) {
  const [flipped, setFlipped] = useState({});
  const cardBg = useColorModeValue("#f8f8f3", "#0d0d0d");

  return (
    <Grid templateColumns="repeat(auto-fill, minmax(220px, 1fr))" gap={4}>
      {cards.map((card, i) => (
        <Box
          key={i}
          p={4}
          borderRadius="6px"
          border="1px solid"
          borderColor={flipped[i] ? "rgba(255,102,0,0.55)" : "ui.borderMid"}
          bg={flipped[i] ? "rgba(255,102,0,0.05)" : cardBg}
          cursor="pointer"
          onClick={() => setFlipped((f) => ({ ...f, [i]: !f[i] }))}
          minH="120px"
          display="flex"
          alignItems="center"
          justifyContent="center"
          textAlign="center"
          transition="all 0.2s"
          _hover={{ borderColor: "ui.textSub", boxShadow: "0 0 12px rgba(138,138,138,0.12)" }}
        >
          <Box>
            <Text fontSize="xs" color={flipped[i] ? "ui.textSub" : "ui.textMuted"} letterSpacing="0.08em" mb={2} textTransform="uppercase">
              {flipped[i] ? "Respuesta" : "Pregunta"}
            </Text>
            <Text fontWeight={flipped[i] ? "400" : "600"} color={flipped[i] ? "ui.text" : "ui.text"} fontSize="sm" lineHeight="1.5">
              {flipped[i] ? card.answer : card.question}
            </Text>
          </Box>
        </Box>
      ))}
    </Grid>
  );
}

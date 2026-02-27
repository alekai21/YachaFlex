import {
  Box,
  Button,
  Slider,
  SliderFilledTrack,
  SliderMark,
  SliderThumb,
  SliderTrack,
  Text,
  Tooltip,
  VStack,
} from "@chakra-ui/react";
import { useState } from "react";

const questions = [
  {
    key: "bienestar",
    label: "Como te sientes en general hoy?",
    lowLabel: "Muy mal",
    highLabel: "Excelente",
  },
  {
    key: "sueno",
    label: "Como dormiste anoche?",
    lowLabel: "Muy mal",
    highLabel: "Muy bien",
  },
  {
    key: "concentracion",
    label: "Cual es tu nivel de concentracion ahora?",
    lowLabel: "Sin concentracion",
    highLabel: "Completamente enfocado",
  },
];

function StressSlider({ label, lowLabel, highLabel, value, onChange }) {
  const [showTooltip, setShowTooltip] = useState(false);

  return (
    <Box w="100%">
      <Text fontWeight="600" mb={4} color="#c0c0c0" fontSize="md" letterSpacing="0.03em">
        {label}
      </Text>
      <Slider
        min={1}
        max={5}
        step={1}
        value={value}
        onChange={onChange}
        onMouseEnter={() => setShowTooltip(true)}
        onMouseLeave={() => setShowTooltip(false)}
      >
        {[1, 2, 3, 4, 5].map((v) => (
          <SliderMark key={v} value={v} mt={3} ml="-2.5" fontSize="xs" color="#4a4a4a" fontFamily="monospace">
            {v}
          </SliderMark>
        ))}
        <SliderTrack bg="#484848" h="4px" borderRadius="full">
          <SliderFilledTrack bg="linear-gradient(90deg, #5a5a5a, #8a8a8a)" />
        </SliderTrack>
        <Tooltip
          hasArrow
          label={value}
          isOpen={showTooltip}
          placement="top"
          bg="#ff6600"
          color="white"
          fontWeight="700"
          fontFamily="monospace"
          fontSize="sm"
        >
          <SliderThumb
            boxSize={5}
            bg="#ff6600"
            border="2px solid #ff8800"
            sx={{ boxShadow: "0 0 12px rgba(255,102,0,0.7)" }}
          />
        </Tooltip>
      </Slider>
      <Box display="flex" justifyContent="space-between" mt={6}>
        <Text fontSize="sm" color="#4a4a4a" letterSpacing="0.03em">{lowLabel}</Text>
        <Text fontSize="sm" color="#4a4a4a" letterSpacing="0.03em">{highLabel}</Text>
      </Box>
    </Box>
  );
}

export default function StressForm({ onSubmit, isLoading }) {
  const [values, setValues] = useState({ bienestar: 3, sueno: 3, concentracion: 3 });

  const handleChange = (key) => (val) => setValues((prev) => ({ ...prev, [key]: val }));

  const handleSubmit = (e) => {
    e.preventDefault();
    onSubmit(values);
  };

  return (
    <Box as="form" onSubmit={handleSubmit} w="100%">
      <VStack spacing={10} align="start">
        {questions.map((q) => (
          <StressSlider
            key={q.key}
            label={q.label}
            lowLabel={q.lowLabel}
            highLabel={q.highLabel}
            value={values[q.key]}
            onChange={handleChange(q.key)}
          />
        ))}

        <Button
          type="submit"
          size="lg"
          w="100%"
          isLoading={isLoading}
          loadingText="ANALIZANDO..."
          bg="#ff6600"
          color="white"
          _hover={{ bg: "#ff8800", boxShadow: "0 0 28px rgba(255,102,0,0.5)" }}
          letterSpacing="0.12em"
          fontWeight="700"
          fontSize="sm"
          boxShadow="0 0 16px rgba(255,102,0,0.3)"
          borderRadius="6px"
        >
          ANALIZAR MI NIVEL DE ESTRES
        </Button>
      </VStack>
    </Box>
  );
}

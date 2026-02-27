import {
  Box,
  Button,
  Heading,
  Slider,
  SliderFilledTrack,
  SliderMark,
  SliderThumb,
  SliderTrack,
  Stack,
  Text,
  Tooltip,
  VStack,
} from "@chakra-ui/react";
import { useState } from "react";

const questions = [
  {
    key: "bienestar",
    label: "¿Cómo te sientes en general hoy?",
    lowLabel: "Muy mal",
    highLabel: "Excelente",
  },
  {
    key: "sueno",
    label: "¿Cómo dormiste anoche?",
    lowLabel: "Muy mal",
    highLabel: "Muy bien",
  },
  {
    key: "concentracion",
    label: "¿Cuál es tu nivel de concentración ahora?",
    lowLabel: "No puedo concentrarme",
    highLabel: "Completamente enfocado",
  },
];

function StressSlider({ label, lowLabel, highLabel, value, onChange }) {
  const [showTooltip, setShowTooltip] = useState(false);

  return (
    <Box w="100%">
      <Text fontWeight="600" mb={4}>
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
          <SliderMark key={v} value={v} mt={3} ml="-2.5" fontSize="sm" color="gray.500">
            {v}
          </SliderMark>
        ))}
        <SliderTrack bg="gray.200">
          <SliderFilledTrack bg="brand.500" />
        </SliderTrack>
        <Tooltip hasArrow label={value} isOpen={showTooltip} placement="top">
          <SliderThumb boxSize={6} />
        </Tooltip>
      </Slider>
      <Box display="flex" justifyContent="space-between" mt={6}>
        <Text fontSize="xs" color="gray.400">{lowLabel}</Text>
        <Text fontSize="xs" color="gray.400">{highLabel}</Text>
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
          colorScheme="green"
          size="lg"
          w="100%"
          isLoading={isLoading}
          loadingText="Analizando..."
        >
          Ver mi nivel de estrés
        </Button>
      </VStack>
    </Box>
  );
}

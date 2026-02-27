import {
  Accordion,
  AccordionButton,
  AccordionIcon,
  AccordionItem,
  AccordionPanel,
  Badge,
  Box,
  Button,
  Grid,
  Heading,
  HStack,
  Radio,
  RadioGroup,
  Stack,
  Text,
  VStack,
} from "@chakra-ui/react";
import { useState } from "react";

const levelColors = { low: "green", medium: "orange", high: "red" };
const levelLabels = { low: "Bajo", medium: "Medio", high: "Alto" };

function FlashCards({ cards }) {
  const [flipped, setFlipped] = useState({});

  return (
    <Grid templateColumns="repeat(auto-fill, minmax(220px, 1fr))" gap={4}>
      {cards.map((card, i) => (
        <Box
          key={i}
          p={4}
          borderRadius="lg"
          border="2px solid"
          borderColor={flipped[i] ? "brand.500" : "gray.200"}
          cursor="pointer"
          onClick={() => setFlipped((f) => ({ ...f, [i]: !f[i] }))}
          minH="120px"
          display="flex"
          alignItems="center"
          justifyContent="center"
          textAlign="center"
          transition="all 0.2s"
          _hover={{ shadow: "md" }}
        >
          <Text fontWeight={flipped[i] ? "normal" : "600"} color={flipped[i] ? "gray.600" : "gray.800"}>
            {flipped[i] ? card.answer : card.question}
          </Text>
        </Box>
      ))}
    </Grid>
  );
}

function Quiz({ questions }) {
  const [answers, setAnswers] = useState({});
  const [submitted, setSubmitted] = useState(false);

  const score = submitted
    ? questions.filter((q, i) => String(answers[i]) === String(q.correct_index)).length
    : null;

  return (
    <VStack align="start" spacing={6}>
      {questions.map((q, i) => (
        <Box key={i} w="100%">
          <Text fontWeight="600" mb={2}>
            {i + 1}. {q.question}
          </Text>
          <RadioGroup
            value={String(answers[i] ?? "")}
            onChange={(val) => !submitted && setAnswers((a) => ({ ...a, [i]: val }))}
          >
            <Stack>
              {q.options.map((opt, j) => {
                let color = "inherit";
                if (submitted) {
                  if (j === q.correct_index) color = "green.600";
                  else if (String(answers[i]) === String(j)) color = "red.500";
                }
                return (
                  <Radio key={j} value={String(j)} colorScheme="green">
                    <Text color={color}>{opt}</Text>
                  </Radio>
                );
              })}
            </Stack>
          </RadioGroup>
        </Box>
      ))}

      {!submitted ? (
        <Button colorScheme="green" onClick={() => setSubmitted(true)} isDisabled={Object.keys(answers).length < questions.length}>
          Verificar respuestas
        </Button>
      ) : (
        <Box p={3} bg="green.50" borderRadius="md" w="100%">
          <Text fontWeight="bold" color="green.700">
            Resultado: {score}/{questions.length} correctas
          </Text>
        </Box>
      )}
    </VStack>
  );
}

export default function ContentCard({ data }) {
  if (!data) return null;

  const { stress_level, summary, flashcards, quiz } = data;
  const color = levelColors[stress_level] || "gray";
  const label = levelLabels[stress_level] || stress_level;

  return (
    <Box w="100%">
      <HStack mb={6}>
        <Heading size="md">Contenido adaptado</Heading>
        <Badge colorScheme={color} fontSize="0.9em" px={3} py={1} borderRadius="full">
          Estrés {label}
        </Badge>
      </HStack>

      <Accordion defaultIndex={[0]} allowMultiple>
        {/* Summary */}
        <AccordionItem>
          <AccordionButton>
            <Box flex="1" textAlign="left" fontWeight="600">
              📄 Resumen
            </Box>
            <AccordionIcon />
          </AccordionButton>
          <AccordionPanel>
            <Text whiteSpace="pre-wrap" color="gray.700" lineHeight="1.8">
              {summary}
            </Text>
          </AccordionPanel>
        </AccordionItem>

        {/* Flashcards */}
        {flashcards && flashcards.length > 0 && (
          <AccordionItem>
            <AccordionButton>
              <Box flex="1" textAlign="left" fontWeight="600">
                🃏 Flashcards ({flashcards.length}) — haz clic para revelar
              </Box>
              <AccordionIcon />
            </AccordionButton>
            <AccordionPanel>
              <FlashCards cards={flashcards} />
            </AccordionPanel>
          </AccordionItem>
        )}

        {/* Quiz */}
        {quiz && quiz.length > 0 && (
          <AccordionItem>
            <AccordionButton>
              <Box flex="1" textAlign="left" fontWeight="600">
                ✏️ Quiz ({quiz.length} preguntas)
              </Box>
              <AccordionIcon />
            </AccordionButton>
            <AccordionPanel>
              <Quiz questions={quiz} />
            </AccordionPanel>
          </AccordionItem>
        )}
      </Accordion>
    </Box>
  );
}

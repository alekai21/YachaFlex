import { Box, HStack, Radio, RadioGroup, Stack, Text, VStack } from "@chakra-ui/react";
import { useState } from "react";
import PrimaryButton from "./ui/PrimaryButton";

export default function Quiz({ questions }) {
  const [answers, setAnswers] = useState({});
  const [submitted, setSubmitted] = useState(false);

  const score = submitted
    ? questions.filter((q, i) => String(answers[i]) === String(q.correct_index)).length
    : null;

  return (
    <VStack align="start" spacing={6}>
      {questions.map((q, i) => (
        <Box key={i} w="100%">
          <Text fontWeight="600" mb={3} color="#c0c0c0" fontSize="md" letterSpacing="0.02em">
            <Text as="span" color="#ff6600" fontFamily="monospace" mr={2}>{i + 1}.</Text>
            {q.question}
          </Text>
          <RadioGroup
            value={String(answers[i] ?? "")}
            onChange={(val) => !submitted && setAnswers((a) => ({ ...a, [i]: val }))}
          >
            <Stack spacing={2}>
              {q.options.map((opt, j) => {
                let optColor = "#9c9c9c";
                if (submitted) {
                  if (j === q.correct_index) optColor = "#00e87a";
                  else if (String(answers[i]) === String(j)) optColor = "#ff2244";
                }
                return (
                  <Radio
                    key={j}
                    value={String(j)}
                    sx={{
                      "& .chakra-radio__control": {
                        borderColor: "#555555",
                        bg: "#0d0d0d",
                        _checked: { bg: "#ff6600", borderColor: "#ff6600" },
                      },
                    }}
                  >
                    <Text color={optColor} fontSize="md" transition="color 0.2s">{opt}</Text>
                  </Radio>
                );
              })}
            </Stack>
          </RadioGroup>
        </Box>
      ))}

      {!submitted ? (
        <PrimaryButton
          onClick={() => setSubmitted(true)}
          isDisabled={Object.keys(answers).length < questions.length}
        >
          VERIFICAR RESPUESTAS
        </PrimaryButton>
      ) : (
        <Box p={4} bg="rgba(0,232,122,0.06)" border="1px solid rgba(0,232,122,0.2)" borderRadius="6px" w="100%">
          <HStack spacing={3}>
            <Box w="8px" h="8px" borderRadius="full" bg="#00e87a" sx={{ boxShadow: "0 0 8px #00e87a" }} />
            <Text fontWeight="700" color="#00e87a" letterSpacing="0.05em" fontSize="sm">
              RESULTADO: {score}/{questions.length} CORRECTAS
            </Text>
          </HStack>
        </Box>
      )}
    </VStack>
  );
}

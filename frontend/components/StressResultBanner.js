import { Box, CircularProgress, CircularProgressLabel, HStack, Stack, Text, useColorModeValue } from "@chakra-ui/react";
import { STRESS_BG_DARK, STRESS_BG_LIGHT, STRESS_BORDER, STRESS_COLORS, STRESS_DESCRIPTIONS, STRESS_LABELS } from "../lib/constants";

export default function StressResultBanner({ score, level }) {
  const color   = STRESS_COLORS[level] ?? STRESS_COLORS.medium;
  const stressBg = useColorModeValue(STRESS_BG_LIGHT, STRESS_BG_DARK);

  return (
    <Box
      bg={stressBg[level]}
      border="1px solid"
      borderColor={STRESS_BORDER[level]}
      borderRadius="8px"
      p={8}
      mb={8}
    >
      <Stack direction={{ base: "column", md: "row" }} align="center" spacing={10}>
        <Box position="relative" flexShrink={0}>
          <CircularProgress
            value={score}
            color={color}
            trackColor="rgba(255,255,255,0.21)"
            size="130px"
            thickness="8px"
          >
            <CircularProgressLabel
              fontWeight="900"
              fontSize="2xl"
              color={color}
              fontFamily="monospace"
              sx={{ textShadow: `0 0 16px ${color}` }}
            >
              {Math.round(score)}
            </CircularProgressLabel>
          </CircularProgress>
        </Box>

        <Box>
          <Text color="ui.textBright" fontSize="xs" mb={2} letterSpacing="0.12em" textTransform="uppercase">
            Nivel de estres actual
          </Text>
          <HStack spacing={3} mb={3}>
            <Box w="8px" h="8px" borderRadius="full" bg={color} sx={{ boxShadow: `0 0 10px ${color}` }} />
            <Text
              fontSize="2xl"
              fontWeight="900"
              color={color}
              letterSpacing="0.15em"
              sx={{ textShadow: `0 0 20px ${color}40` }}
            >
              {STRESS_LABELS[level]}
            </Text>
          </HStack>
          <Text color="ui.textLight" fontSize="md" lineHeight="1.7" maxW="400px">
            {STRESS_DESCRIPTIONS[level]}
          </Text>
        </Box>
      </Stack>
    </Box>
  );
}

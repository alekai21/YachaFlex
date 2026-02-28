import {
  Accordion,
  AccordionButton,
  AccordionIcon,
  AccordionItem,
  AccordionPanel,
  Box,
  HStack,
  Text,
} from "@chakra-ui/react";
import { STRESS_COLORS, STRESS_LABELS } from "../lib/constants";
import FlashCards from "./FlashCards";
import Quiz from "./Quiz";
import SectionHeading from "./ui/SectionHeading";

function AccordionSection({ label, borderExpanded, children }) {
  return (
    <AccordionItem border="none" mb={2}>
      <AccordionButton
        bg="ui.deep"
        border="1px solid"
        borderColor="ui.borderMid"
        borderRadius="6px"
        _hover={{ bg: "ui.elevated", borderColor: "ui.textSub" }}
        _expanded={{ borderColor: borderExpanded ?? "ui.textSub", borderBottomRadius: 0 }}
        py={3}
        px={4}
      >
        <Box flex="1" textAlign="left" fontWeight="700" color="ui.text" fontSize="md" letterSpacing="0.08em">
          {label}
        </Box>
        <AccordionIcon color="ui.textMuted" />
      </AccordionButton>
      <AccordionPanel
        bg="ui.deep"
        border="1px solid"
        borderColor="ui.border"
        borderTop="none"
        borderBottomRadius="6px"
        pt={4}
        pb={5}
        px={4}
      >
        {children}
      </AccordionPanel>
    </AccordionItem>
  );
}

export default function ContentCard({ data }) {
  if (!data) return null;

  const { stress_level, summary, flashcards, quiz } = data;
  const color = STRESS_COLORS[stress_level] ?? "#8a8a8a";
  const label = STRESS_LABELS[stress_level] ?? stress_level;

  return (
    <Box w="100%">
      <HStack mb={6} spacing={4}>
        <SectionHeading title="CONTENIDO ADAPTADO" accentColor="orange" />
        <Box
          px={3}
          py={1}
          border="1px solid"
          borderColor={color}
          borderRadius="4px"
          sx={{ boxShadow: `0 0 10px ${color}50` }}
        >
          <Text color={color} fontSize="xs" fontWeight="700" letterSpacing="0.1em">
            ESTRES {label}
          </Text>
        </Box>
      </HStack>

      <Accordion defaultIndex={[0]} allowMultiple>
        <AccordionSection label="RESUMEN" borderExpanded="ui.textSub">
          <Text whiteSpace="pre-wrap" color="ui.textSub" lineHeight="1.9" fontSize="md">
            {summary}
          </Text>
        </AccordionSection>

        {flashcards?.length > 0 && (
          <AccordionSection
            label={<>FLASHCARDS <Text as="span" color="ui.textMuted" fontWeight="400" ml={2} fontSize="xs">({flashcards.length}) — clic para revelar</Text></>}
            borderExpanded="rgba(255,102,0,0.5)"
          >
            <FlashCards cards={flashcards} />
          </AccordionSection>
        )}

        {quiz?.length > 0 && (
          <AccordionSection
            label={<>QUIZ <Text as="span" color="ui.textMuted" fontWeight="400" ml={2} fontSize="xs">({quiz.length} preguntas)</Text></>}
            borderExpanded="rgba(255,102,0,0.5)"
          >
            <Quiz questions={quiz} />
          </AccordionSection>
        )}
      </Accordion>
    </Box>
  );
}

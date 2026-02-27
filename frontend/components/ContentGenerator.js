import { Box, HStack, Text, Textarea } from "@chakra-ui/react";
import { useState } from "react";
import { useGenerate } from "../hooks/useGenerate";
import ContentCard from "./ContentCard";
import ErrorAlert from "./ui/ErrorAlert";
import PrimaryButton from "./ui/PrimaryButton";
import SectionHeading from "./ui/SectionHeading";

export default function ContentGenerator({ recordId }) {
  const [text, setText] = useState("");
  const { content, loading, error, generate } = useGenerate();

  const handleGenerate = () => generate(text, recordId);

  return (
    <>
      <Box
        bg="#111111"
        p={8}
        border="1px solid"
        borderColor="rgba(255,102,0,0.4)"
        borderRadius="8px"
        mb={8}
        boxShadow="0 0 40px rgba(0,0,0,0.5), 0 0 0 1px rgba(255,102,0,0.07)"
      >
        <SectionHeading title="GENERAR CONTENIDO EDUCATIVO" accentColor="gray" />
        <Text color="#4a4a4a" mb={5} fontSize="md" letterSpacing="0.02em" pl={3}>
          Pega el texto de tu apunte o tema de estudio. La IA lo adaptara a tu nivel de estres actual.
        </Text>
        <Textarea
          placeholder="Pega aqui tu texto de estudio... (minimo 50 caracteres)"
          value={text}
          onChange={(e) => setText(e.target.value)}
          rows={6}
          mb={4}
          resize="vertical"
          fontSize="sm"
        />
        {error && <ErrorAlert message={error} />}
        <HStack align="center" spacing={4} mt={error ? 4 : 0}>
          <PrimaryButton
            onClick={handleGenerate}
            isLoading={loading}
            loadingText="GENERANDO CON IA..."
            isDisabled={text.trim().length < 50}
            px={6}
          >
            GENERAR CONTENIDO
          </PrimaryButton>
          {text.trim().length > 0 && text.trim().length < 50 && (
            <Text fontSize="xs" color="#4a4a4a" letterSpacing="0.05em">
              {text.trim().length}/50 caracteres
            </Text>
          )}
        </HStack>
      </Box>

      {content && (
        <Box
          bg="#111111"
          p={8}
          border="1px solid #555555"
          borderRadius="8px"
          mb={8}
          boxShadow="0 0 40px rgba(0,0,0,0.5)"
        >
          <ContentCard data={content} />
        </Box>
      )}
    </>
  );
}

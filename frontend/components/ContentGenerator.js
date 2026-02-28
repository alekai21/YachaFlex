import {
  Box,
  Button,
  HStack,
  Input,
  Tab,
  TabList,
  TabPanel,
  TabPanels,
  Tabs,
  Text,
  Textarea,
} from "@chakra-ui/react";
import { useRef, useState } from "react";
import { useGenerate } from "../hooks/useGenerate";
import ContentCard from "./ContentCard";
import ErrorAlert from "./ui/ErrorAlert";
import PrimaryButton from "./ui/PrimaryButton";
import SectionHeading from "./ui/SectionHeading";

export default function ContentGenerator({ recordId }) {
  const [text, setText] = useState("");
  const [pdfFile, setPdfFile] = useState(null);
  const fileInputRef = useRef(null);
  const { content, loading, error, generate, generateFromPdf } = useGenerate();

  const handleGenerateText = () => generate(text, recordId);

  const handleGeneratePdf = () => {
    if (pdfFile) generateFromPdf(pdfFile, recordId);
  };

  const handleFileChange = (e) => {
    const file = e.target.files?.[0];
    if (file) setPdfFile(file);
  };

  return (
    <>
      <Box
        bg="ui.card"
        p={8}
        border="1px solid"
        borderColor="rgba(255,102,0,0.4)"
        borderRadius="8px"
        mb={8}
        boxShadow="0 0 40px rgba(0,0,0,0.5), 0 0 0 1px rgba(255,102,0,0.07)"
      >
        <SectionHeading title="GENERAR CONTENIDO EDUCATIVO" accentColor="gray" />

        <Tabs variant="unstyled" mb={4}>
          <TabList mb={5} gap={2}>
            <Tab
              fontSize="xs"
              letterSpacing="0.08em"
              fontWeight="bold"
              px={5}
              py={2}
              border="1px solid"
              borderColor="rgba(255,102,0,0.3)"
              borderRadius="4px"
              color="ui.textMuted"
              _selected={{
                color: "#ff6600",
                borderColor: "#ff6600",
                bg: "rgba(255,102,0,0.07)",
              }}
            >
              TEXTO
            </Tab>
            <Tab
              fontSize="xs"
              letterSpacing="0.08em"
              fontWeight="bold"
              px={5}
              py={2}
              border="1px solid"
              borderColor="rgba(255,102,0,0.3)"
              borderRadius="4px"
              color="ui.textMuted"
              _selected={{
                color: "#ff6600",
                borderColor: "#ff6600",
                bg: "rgba(255,102,0,0.07)",
              }}
            >
              PDF
            </Tab>
          </TabList>

          <TabPanels>
            {/* ── Texto ── */}
            <TabPanel p={0}>
              <Text color="ui.textMuted" mb={5} fontSize="md" letterSpacing="0.02em" pl={3}>
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
                  onClick={handleGenerateText}
                  isLoading={loading}
                  loadingText="GENERANDO CON IA..."
                  isDisabled={text.trim().length < 50}
                  px={6}
                >
                  GENERAR CONTENIDO
                </PrimaryButton>
                {text.trim().length > 0 && text.trim().length < 50 && (
                  <Text fontSize="xs" color="ui.textMuted" letterSpacing="0.05em">
                    {text.trim().length}/50 caracteres
                  </Text>
                )}
              </HStack>
            </TabPanel>

            {/* ── PDF ── */}
            <TabPanel p={0}>
              <Text color="ui.textMuted" mb={5} fontSize="md" letterSpacing="0.02em" pl={3}>
                Sube un PDF con tu material de estudio. La IA extraera el texto y lo adaptara a tu nivel de estres.
              </Text>
              <Box
                border="1px dashed"
                borderColor={pdfFile ? "#ff6600" : "rgba(255,102,0,0.3)"}
                borderRadius="6px"
                p={6}
                mb={4}
                textAlign="center"
                cursor="pointer"
                onClick={() => fileInputRef.current?.click()}
                _hover={{ borderColor: "#ff6600", bg: "rgba(255,102,0,0.03)" }}
                transition="all 0.2s"
              >
                <Input
                  ref={fileInputRef}
                  type="file"
                  accept=".pdf"
                  display="none"
                  onChange={handleFileChange}
                />
                {pdfFile ? (
                  <>
                    <Text color="#ff6600" fontSize="sm" fontWeight="bold" letterSpacing="0.05em">
                      {pdfFile.name}
                    </Text>
                    <Text color="ui.textMuted" fontSize="xs" mt={1}>
                      {(pdfFile.size / 1024).toFixed(0)} KB — click para cambiar
                    </Text>
                  </>
                ) : (
                  <>
                    <Text color="ui.textSub" fontSize="sm" letterSpacing="0.05em">
                      CLICK PARA SELECCIONAR PDF
                    </Text>
                    <Text color="ui.disabledText" fontSize="xs" mt={1}>
                      Solo archivos .pdf
                    </Text>
                  </>
                )}
              </Box>
              {error && <ErrorAlert message={error} />}
              <HStack align="center" spacing={4} mt={error ? 4 : 0}>
                <PrimaryButton
                  onClick={handleGeneratePdf}
                  isLoading={loading}
                  loadingText="PROCESANDO PDF..."
                  isDisabled={!pdfFile}
                  px={6}
                >
                  GENERAR DESDE PDF
                </PrimaryButton>
                {pdfFile && (
                  <Button
                    size="sm"
                    variant="ghost"
                    color="ui.textMuted"
                    fontSize="xs"
                    letterSpacing="0.05em"
                    onClick={() => {
                      setPdfFile(null);
                      if (fileInputRef.current) fileInputRef.current.value = "";
                    }}
                  >
                    QUITAR
                  </Button>
                )}
              </HStack>
            </TabPanel>
          </TabPanels>
        </Tabs>
      </Box>

      {content && (
        <Box
          bg="ui.card"
          p={8}
          border="1px solid"
          borderColor="ui.borderMid"
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

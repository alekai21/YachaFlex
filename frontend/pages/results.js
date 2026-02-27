import {
  Alert,
  AlertDescription,
  AlertIcon,
  Badge,
  Box,
  Button,
  CircularProgress,
  CircularProgressLabel,
  Container,
  Divider,
  Heading,
  HStack,
  Spinner,
  Stack,
  Text,
  Textarea,
  useToast,
  VStack,
} from "@chakra-ui/react";
import { useRouter } from "next/router";
import { useEffect, useRef, useState } from "react";
import ContentCard from "../components/ContentCard";
import StressChart from "../components/StressChart";
import { generateContent, getHistory } from "../lib/api";

const levelColors = { low: "green", medium: "orange", high: "red" };
const levelLabels = { low: "Bajo 😌", medium: "Medio 😐", high: "Alto 😰" };
const levelBg = { low: "#f0fdf4", medium: "#fffbeb", high: "#fff5f5" };

export default function Results() {
  const router = useRouter();
  const { record_id, stress_level, stress_score } = router.query;

  const [history, setHistory] = useState([]);
  const [historyLoading, setHistoryLoading] = useState(true);

  const [text, setText] = useState("");
  const [generating, setGenerating] = useState(false);
  const [content, setContent] = useState(null);
  const [genError, setGenError] = useState("");
  const toast = useToast();

  const score = parseFloat(stress_score || 0);
  const level = stress_level || "medium";

  useEffect(() => {
    // Check auth
    const token = typeof window !== "undefined" ? localStorage.getItem("yachaflex_token") : null;
    if (!token) { router.replace("/"); return; }

    getHistory()
      .then((res) => setHistory(res.data.records))
      .catch(() => {})
      .finally(() => setHistoryLoading(false));
  }, [router]);

  const handleGenerate = async () => {
    if (!text.trim()) return;
    setGenError("");
    setGenerating(true);
    try {
      const res = await generateContent({ text, stress_record_id: record_id ? parseInt(record_id) : undefined });
      setContent(res.data);
      toast({ title: "Contenido generado", status: "success", duration: 2000 });
    } catch (err) {
      const msg = err.response?.data?.detail || "Error generando contenido. ¿Ollama está corriendo?";
      setGenError(msg);
    } finally {
      setGenerating(false);
    }
  };

  return (
    <Box minH="100vh" bg="gray.50" py={10}>
      <Container maxW="container.lg">
        <HStack mb={6} justify="space-between">
          <Heading size="lg">🧠 YachaFlex</Heading>
          <Button size="sm" variant="outline" onClick={() => router.push("/")}>
            ← Nuevo check-in
          </Button>
        </HStack>

        {/* Stress result banner */}
        <Box bg={levelBg[level]} border="2px solid" borderColor={`${levelColors[level]}.200`} borderRadius="2xl" p={8} mb={8}>
          <Stack direction={{ base: "column", md: "row" }} align="center" spacing={8}>
            <CircularProgress value={score} color={`${levelColors[level]}.400`} size="120px" thickness="10px">
              <CircularProgressLabel fontWeight="bold" fontSize="lg">
                {Math.round(score)}
              </CircularProgressLabel>
            </CircularProgress>
            <Box>
              <Text color="gray.500" fontSize="sm" mb={1}>Tu nivel de estrés ahora</Text>
              <Badge colorScheme={levelColors[level]} fontSize="1.2em" px={4} py={1} borderRadius="full">
                {levelLabels[level]}
              </Badge>
              <Text mt={3} color="gray.600" fontSize="sm">
                {level === "low" && "¡Estás en buena forma! Aprovecha para estudiar contenido detallado."}
                {level === "medium" && "Estrés moderado detectado. Te damos resúmenes simplificados y flashcards."}
                {level === "high" && "Estrés alto. Respira hondo. Aquí tienes lo más importante en formato breve."}
              </Text>
            </Box>
          </Stack>
        </Box>

        {/* Generate content section */}
        <Box bg="white" p={8} borderRadius="2xl" shadow="sm" mb={8}>
          <Heading size="md" mb={2}>Generar contenido educativo</Heading>
          <Text color="gray.500" mb={4} fontSize="sm">
            Pega el texto de tu apunte o tema de estudio. La IA lo adaptará a tu nivel de estrés actual.
          </Text>
          <Textarea
            placeholder="Pega aquí tu texto de estudio... (mínimo 100 caracteres)"
            value={text}
            onChange={(e) => setText(e.target.value)}
            rows={6}
            mb={4}
            resize="vertical"
          />
          {genError && (
            <Alert status="error" mb={4} borderRadius="md">
              <AlertIcon /><AlertDescription>{genError}</AlertDescription>
            </Alert>
          )}
          <Button
            colorScheme="green"
            onClick={handleGenerate}
            isLoading={generating}
            loadingText="Generando con IA..."
            isDisabled={text.trim().length < 50}
            w={{ base: "100%", md: "auto" }}
          >
            ✨ Generar contenido adaptado
          </Button>
          {text.trim().length > 0 && text.trim().length < 50 && (
            <Text fontSize="xs" color="gray.400" mt={2}>Mínimo 50 caracteres ({text.trim().length}/50)</Text>
          )}
        </Box>

        {/* Generated content */}
        {content && (
          <Box bg="white" p={8} borderRadius="2xl" shadow="sm" mb={8}>
            <ContentCard data={content} />
          </Box>
        )}

        <Divider my={8} />

        {/* Stress history chart */}
        <Box bg="white" p={8} borderRadius="2xl" shadow="sm">
          <Heading size="md" mb={6}>Evolución de tu estrés</Heading>
          {historyLoading ? (
            <VStack py={8}><Spinner color="green.500" /><Text color="gray.400">Cargando historial...</Text></VStack>
          ) : (
            <StressChart records={history} />
          )}
        </Box>
      </Container>
    </Box>
  );
}

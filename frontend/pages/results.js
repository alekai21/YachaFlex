import {
  Alert,
  AlertDescription,
  Box,
  Button,
  Container,
  Divider,
  HStack,
  Spinner,
  Text,
  VStack,
} from "@chakra-ui/react";
import { useRouter } from "next/router";
import { useEffect } from "react";
import ContentGenerator from "../components/ContentGenerator";
import StressChart from "../components/StressChart";
import StressResultBanner from "../components/StressResultBanner";
import Logo from "../components/ui/Logo";
import SectionHeading from "../components/ui/SectionHeading";
import { getToken } from "../lib/auth";
import { useHistory } from "../hooks/useHistory";

export default function Results() {
  const router = useRouter();
  const { record_id, stress_level, stress_score } = router.query;
  const { records, loading: historyLoading, error: historyError } = useHistory();

  const score = parseFloat(stress_score || 0);
  const level = stress_level || "medium";

  useEffect(() => {
    if (!getToken()) router.replace("/");
  }, [router]);

  return (
    <Box minH="100vh" bgSize="40px 40px" py={10}>
      <Container maxW="container.lg">

        {/* Header */}
        <HStack mb={8} justify="space-between">
          <Logo size="sm" />
          <Button
            size="sm"
            variant="ghost"
            color="ui.textSub"
            onClick={() => router.push("/")}
            border="1px solid"
            borderColor="ui.borderMid"
            _hover={{ bg: "ui.elevated", borderColor: "ui.textSub", color: "ui.text" }}
            letterSpacing="0.08em"
            fontSize="xs"
            fontWeight="700"
          >
            NUEVO CHECK-IN
          </Button>
        </HStack>

        {/* Resultado de estrés */}
        <StressResultBanner score={score} level={level} />

        {/* Generador de contenido educativo */}
        <ContentGenerator recordId={record_id} />

        <Divider borderColor="ui.border" my={8} />

        {/* Historial de estrés */}
        <Box
          bg="ui.card"
          p={8}
          border="1px solid"
          borderColor="rgba(255,102,0,0.35)"
          borderRadius="8px"
          boxShadow="0 0 40px rgba(0,0,0,0.5), 0 0 0 1px rgba(255,102,0,0.06)"
        >
          <SectionHeading title="EVOLUCION DE TU ESTRES" accentColor="orange" />
          <Box mt={6}>
            {historyLoading ? (
              <VStack py={8} spacing={3}>
                <Spinner color="ui.textSub" size="md" />
                <Text color="ui.textMuted" fontSize="sm" letterSpacing="0.05em">CARGANDO HISTORIAL...</Text>
              </VStack>
            ) : historyError ? (
              <Alert status="error" borderRadius="6px" bg="rgba(255,34,68,0.12)" border="1px solid rgba(255,34,68,0.3)">
                <AlertDescription color="#ff2244" fontSize="sm" letterSpacing="0.05em">
                  {historyError}
                </AlertDescription>
              </Alert>
            ) : (
              <StressChart records={records} />
            )}
          </Box>
        </Box>

      </Container>
    </Box>
  );
}

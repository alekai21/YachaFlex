import {
  Box,
  Button,
  Container,
  HStack,
  Icon,
  Input,
  InputGroup,
  InputRightElement,
  Tab,
  TabList,
  TabPanel,
  TabPanels,
  Tabs,
  Text,
  useToast,
  VStack,
} from "@chakra-ui/react";
import { ViewIcon, ViewOffIcon } from "@chakra-ui/icons";
import dynamic from "next/dynamic";
import { useRouter } from "next/router";
import { useEffect, useState } from "react";
import StressForm from "../components/StressForm";
import ErrorAlert from "../components/ui/ErrorAlert";
import Logo from "../components/ui/Logo";
import PrimaryButton from "../components/ui/PrimaryButton";
import SectionHeading from "../components/ui/SectionHeading";
import { useAuth } from "../hooks/useAuth";
import { useCheckin } from "../hooks/useCheckin";
import { getToken } from "../lib/auth";

const QRCodeSVG = dynamic(
  () => import("qrcode.react").then((m) => m.QRCodeSVG),
  { ssr: false }
);

function BiometricQRCard() {
  const [qrUrl, setQrUrl] = useState("");
  const apiUrl = process.env.NEXT_PUBLIC_API_URL || "";

  useEffect(() => {
    const token = getToken();
    if (token && apiUrl) {
      const endpoint = `${apiUrl}/biometrics`;
      setQrUrl(
        `yachaflex://connect?endpoint=${encodeURIComponent(endpoint)}&token=${encodeURIComponent(token)}`
      );
    }
  }, [apiUrl]);

  if (!qrUrl) return null;

  return (
    <Box
      bg="ui.card"
      p={6}
      border="1px solid"
      borderColor="rgba(255,102,0,0.35)"
      borderRadius="8px"
      boxShadow="0 0 40px rgba(0,0,0,0.5), 0 0 0 1px rgba(255,102,0,0.06)"
      mt={6}
    >
      <SectionHeading title="CONECTAR SMARTWATCH" accentColor="orange" />
      <VStack spacing={3} mt={4} align="center">
        <VStack spacing={1} align="center">
          <Text color="ui.textSub" fontSize="sm" letterSpacing="0.05em" textAlign="center">
            <Text as="span" color="#ff6600" fontWeight="700">Paso 1</Text>
            {" "}— Escanea el QR con la app YachaFlex Forwarder
          </Text>
          <Text color="ui.textMuted" fontSize="xs" textAlign="center" letterSpacing="0.03em">
            El app leerá los biométricos de tu smartwatch y esperará.
          </Text>
        </VStack>
        <Box p={4} bg="white" borderRadius="8px" display="inline-block">
          <QRCodeSVG value={qrUrl} size={180} />
        </Box>
        <VStack spacing={1} align="center">
          <Text color="ui.textSub" fontSize="sm" letterSpacing="0.05em" textAlign="center">
            <Text as="span" color="#ff6600" fontWeight="700">Paso 2</Text>
            {" "}— Completa el formulario de bienestar y envía
          </Text>
          <Text color="ui.textMuted" fontSize="xs" textAlign="center" letterSpacing="0.03em">
            Luego pulsa <Text as="span" fontWeight="700">Send</Text> en el app para combinar ambos datos.
          </Text>
        </VStack>
      </VStack>
    </Box>
  );
}

// ─── AuthPanel ───────────────────────────────────────────────────────────────
// Responsabilidad: renderizar formulario login/register y delegar la lógica
// de auth a las funciones recibidas por props (D: depende de abstracciones)
function AuthPanel({ onLogin, onRegister }) {
  const [tab, setTab] = useState(0);
  const [form, setForm] = useState({ email: "", password: "", nombre: "" });
  const [showPwd, setShowPwd] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const toast = useToast();

  const handleChange = (e) => setForm((f) => ({ ...f, [e.target.name]: e.target.value }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      if (tab === 0) {
        await onLogin({ email: form.email, password: form.password });
      } else {
        await onRegister({ email: form.email, password: form.password, nombre: form.nombre });
      }
      toast({ title: "Acceso concedido", status: "success", duration: 2000 });
    } catch (err) {
      setError(err.response?.data?.detail || "Error de autenticacion");
    } finally {
      setLoading(false);
    }
  };

  const tabProps = {
    _selected: { color: "ui.text", borderBottomColor: "ui.textSub" },
    color: "ui.textMuted",
    fontSize: "sm",
    letterSpacing: "0.08em",
    fontWeight: "700",
    _hover: { color: "ui.textSub" },
  };

  const PasswordInput = (
    <InputGroup>
      <Input
        name="password"
        type={showPwd ? "text" : "password"}
        placeholder="CONTRASENA"
        value={form.password}
        onChange={handleChange}
        required
        fontSize="sm"
        letterSpacing="0.05em"
      />
      <InputRightElement>
        <Button
          h="1.75rem"
          size="sm"
          onClick={() => setShowPwd((v) => !v)}
          variant="ghost"
          color="ui.textSub"
          _hover={{ bg: "ui.elevated", color: "ui.text" }}
          aria-label={showPwd ? "Ocultar contraseña" : "Ver contraseña"}
        >
          <Icon as={showPwd ? ViewOffIcon : ViewIcon} boxSize={4} />
        </Button>
      </InputRightElement>
    </InputGroup>
  );

  return (
    <Box
      maxW="420px"
      mx="auto"
      mt={8}
      p={8}
      bg="ui.card"
      border="1px solid"
      borderColor="rgba(255,102,0,0.4)"
      borderRadius="8px"
      boxShadow="0 0 60px rgba(0,0,0,0.9), 0 0 0 1px rgba(255,102,0,0.08)"
    >
      <VStack spacing={1} mb={8}>
        <Logo size="lg" />
        <Text color="ui.textSub" fontSize="sm" letterSpacing="0.15em" textTransform="uppercase" mt={1}>
          Aprendizaje Adaptativo por IA
        </Text>
        <Box h="1px" w="200px" mt={2} bg="linear-gradient(90deg, transparent, #ff6600, transparent)" />
      </VStack>

      <Tabs isFitted index={tab} onChange={setTab}>
        <TabList mb={6} borderColor="ui.border">
          <Tab {...tabProps}>INICIAR SESION</Tab>
          <Tab {...tabProps}>REGISTRARSE</Tab>
        </TabList>

        <TabPanels>
          <TabPanel p={0}>
            <form onSubmit={handleSubmit}>
              <VStack spacing={4}>
                <Input name="email" type="email" placeholder="EMAIL" value={form.email} onChange={handleChange} required fontSize="sm" letterSpacing="0.05em" />
                {PasswordInput}
                <ErrorAlert message={error} />
                <PrimaryButton type="submit" w="100%" isLoading={loading}>ENTRAR</PrimaryButton>
              </VStack>
            </form>
          </TabPanel>

          <TabPanel p={0}>
            <form onSubmit={handleSubmit}>
              <VStack spacing={4}>
                <Input name="nombre" placeholder="NOMBRE" value={form.nombre} onChange={handleChange} required fontSize="sm" letterSpacing="0.05em" />
                <Input name="email" type="email" placeholder="EMAIL" value={form.email} onChange={handleChange} required fontSize="sm" letterSpacing="0.05em" />
                {PasswordInput}
                <ErrorAlert message={error} />
                <PrimaryButton type="submit" w="100%" isLoading={loading}>CREAR CUENTA</PrimaryButton>
              </VStack>
            </form>
          </TabPanel>
        </TabPanels>
      </Tabs>
    </Box>
  );
}

// ─── CheckinPanel ─────────────────────────────────────────────────────────────
// Responsabilidad: orquestar el check-in (formulario + navegación a resultados)
function CheckinPanel({ user, onLogout }) {
  const router = useRouter();
  const toast = useToast();
  const { submit, loading, error } = useCheckin();

  const handleCheckin = async (values) => {
    const data = await submit(values);
    if (!data) return;
    const { stress_level, stress_score, record_id } = data;
    toast({
      title: `Estres detectado: ${stress_level.toUpperCase()}`,
      description: data.message,
      status: stress_level === "low" ? "success" : stress_level === "medium" ? "warning" : "error",
      duration: 3000,
    });
    router.push(`/results?record_id=${record_id}&stress_level=${stress_level}&stress_score=${stress_score}`);
  };

  return (
    <Box>
      <HStack justify="space-between" mb={8}>
        <Logo size="sm" />
        <HStack spacing={4}>
          <Text color="#ff6600f6" fontWeight="bold" fontSize="sm" letterSpacing="0.05em" textTransform="uppercase">
            {user.nombre}
          </Text>
          <Button
            size="sm"
            variant="ghost"
            color="ui.textSub"
            onClick={onLogout}
            border="1px solid"
            borderColor="ui.borderMid"
            _hover={{ bg: "ui.elevated", borderColor: "ui.textSub", color: "ui.text" }}
            letterSpacing="0.08em"
            fontSize="xs"
            fontWeight="700"
          >
            SALIR
          </Button>
        </HStack>
      </HStack>

      <Box
        bg="ui.card"
        p={8}
        border="1px solid"
        borderColor="rgba(255,102,0,0.35)"
        borderRadius="8px"
        boxShadow="0 0 40px rgba(0,0,0,0.7), 0 0 0 1px rgba(255,102,0,0.06)"
      >
        <HStack mb={2}>
          <Box w="3px" h="22px" bg="#ff6600" borderRadius="full" sx={{ boxShadow: "0 0 10px rgba(255,102,0,0.7)" }} />
          <Text fontWeight="700" fontSize="md" color="ui.text" letterSpacing="0.1em">CHECK-IN DE BIENESTAR</Text>
        </HStack>
        <Text color="ui.textMuted" mb={8} fontSize="md" letterSpacing="0.02em" pl={3}>
          Responde estas 3 preguntas para detectar tu nivel de estres y recibir contenido adaptado.
        </Text>
        <ErrorAlert message={error} />
        <Box mt={error ? 4 : 0}>
          <StressForm onSubmit={handleCheckin} isLoading={loading} />
        </Box>
      </Box>

      <BiometricQRCard />
    </Box>
  );
}

// ─── Home (orquestador) ───────────────────────────────────────────────────────
// Responsabilidad: decidir qué panel mostrar según estado de autenticación
export default function Home() {
  const { user, login, register, logout } = useAuth();

  return (
    <Box
      minH="100vh"
      bgImage="linear-gradient(rgba(140,140,140,0.04) 1px, transparent 1px), linear-gradient(90deg, rgba(140,140,140,0.04) 1px, transparent 1px)"
      bgSize="40px 40px"
      py={10}
    >
      <Container maxW="container.md">
        {!user ? (
          <AuthPanel onLogin={login} onRegister={register} />
        ) : (
          <CheckinPanel user={user} onLogout={logout} />
        )}
      </Container>
    </Box>
  );
}

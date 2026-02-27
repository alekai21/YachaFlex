import {
  Alert,
  AlertDescription,
  AlertIcon,
  Box,
  Button,
  Container,
  Divider,
  Heading,
  HStack,
  Input,
  InputGroup,
  InputRightElement,
  Link,
  Tab,
  TabList,
  TabPanel,
  TabPanels,
  Tabs,
  Text,
  useToast,
  VStack,
} from "@chakra-ui/react";
import { useRouter } from "next/router";
import { useState } from "react";
import StressForm from "../components/StressForm";
import { login, register, submitCheckin } from "../lib/api";

function AuthPanel({ onSuccess }) {
  const [tab, setTab] = useState(0);
  const [form, setForm] = useState({ email: "", password: "", nombre: "" });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [showPwd, setShowPwd] = useState(false);
  const toast = useToast();

  const handleChange = (e) => setForm((f) => ({ ...f, [e.target.name]: e.target.value }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      let res;
      if (tab === 0) {
        res = await login({ email: form.email, password: form.password });
      } else {
        res = await register({ email: form.email, password: form.password, nombre: form.nombre });
      }
      localStorage.setItem("yachaflex_token", res.data.access_token);
      localStorage.setItem("yachaflex_user", JSON.stringify(res.data.user));
      toast({ title: "¡Bienvenido!", status: "success", duration: 2000 });
      onSuccess();
    } catch (err) {
      setError(err.response?.data?.detail || "Error de autenticación");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Box maxW="420px" mx="auto" mt={8} p={8} bg="white" borderRadius="2xl" shadow="lg">
      <Heading size="lg" mb={2} textAlign="center">
        🧠 YachaFlex
      </Heading>
      <Text color="gray.500" textAlign="center" mb={6} fontSize="sm">
        Aprende según tu nivel de estrés
      </Text>

      <Tabs isFitted index={tab} onChange={setTab} colorScheme="green">
        <TabList mb={6}>
          <Tab>Iniciar sesión</Tab>
          <Tab>Registrarse</Tab>
        </TabList>
        <TabPanels>
          <TabPanel p={0}>
            <form onSubmit={handleSubmit}>
              <VStack spacing={4}>
                <Input name="email" type="email" placeholder="Email" value={form.email} onChange={handleChange} required />
                <InputGroup>
                  <Input name="password" type={showPwd ? "text" : "password"} placeholder="Contraseña" value={form.password} onChange={handleChange} required />
                  <InputRightElement width="4.5rem">
                    <Button h="1.75rem" size="sm" onClick={() => setShowPwd((v) => !v)} variant="ghost">
                      {showPwd ? "Ocultar" : "Ver"}
                    </Button>
                  </InputRightElement>
                </InputGroup>
                {error && <Alert status="error" borderRadius="md"><AlertIcon /><AlertDescription>{error}</AlertDescription></Alert>}
                <Button type="submit" colorScheme="green" w="100%" isLoading={loading}>
                  Entrar
                </Button>
              </VStack>
            </form>
          </TabPanel>
          <TabPanel p={0}>
            <form onSubmit={handleSubmit}>
              <VStack spacing={4}>
                <Input name="nombre" placeholder="Tu nombre" value={form.nombre} onChange={handleChange} required />
                <Input name="email" type="email" placeholder="Email" value={form.email} onChange={handleChange} required />
                <InputGroup>
                  <Input name="password" type={showPwd ? "text" : "password"} placeholder="Contraseña" value={form.password} onChange={handleChange} required />
                  <InputRightElement width="4.5rem">
                    <Button h="1.75rem" size="sm" onClick={() => setShowPwd((v) => !v)} variant="ghost">
                      {showPwd ? "Ocultar" : "Ver"}
                    </Button>
                  </InputRightElement>
                </InputGroup>
                {error && <Alert status="error" borderRadius="md"><AlertIcon /><AlertDescription>{error}</AlertDescription></Alert>}
                <Button type="submit" colorScheme="green" w="100%" isLoading={loading}>
                  Crear cuenta
                </Button>
              </VStack>
            </form>
          </TabPanel>
        </TabPanels>
      </Tabs>
    </Box>
  );
}

function CheckinPanel({ user, onLogout }) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const router = useRouter();
  const toast = useToast();

  const handleCheckin = async (values) => {
    setError("");
    setLoading(true);
    try {
      const res = await submitCheckin(values);
      const { stress_level, stress_score, record_id } = res.data;
      toast({
        title: `Estrés detectado: ${stress_level}`,
        description: res.data.message,
        status: stress_level === "low" ? "success" : stress_level === "medium" ? "warning" : "error",
        duration: 3000,
      });
      router.push(`/results?record_id=${record_id}&stress_level=${stress_level}&stress_score=${stress_score}`);
    } catch (err) {
      setError(err.response?.data?.detail || "Error al enviar check-in");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Box>
      <HStack justify="space-between" mb={8}>
        <Heading size="lg">🧠 YachaFlex</Heading>
        <HStack>
          <Text color="gray.500" fontSize="sm">Hola, {user.nombre}</Text>
          <Button size="sm" variant="ghost" onClick={onLogout}>Salir</Button>
        </HStack>
      </HStack>

      <Box bg="white" p={8} borderRadius="2xl" shadow="sm">
        <Heading size="md" mb={2}>Check-in de bienestar</Heading>
        <Text color="gray.500" mb={8} fontSize="sm">
          Responde estas 3 preguntas para detectar tu nivel de estrés y recibir contenido adaptado.
        </Text>
        {error && (
          <Alert status="error" mb={4} borderRadius="md">
            <AlertIcon /><AlertDescription>{error}</AlertDescription>
          </Alert>
        )}
        <StressForm onSubmit={handleCheckin} isLoading={loading} />
      </Box>
    </Box>
  );
}

export default function Home() {
  const [user, setUser] = useState(() => {
    if (typeof window !== "undefined") {
      try { return JSON.parse(localStorage.getItem("yachaflex_user")); } catch { return null; }
    }
    return null;
  });

  const handleAuthSuccess = () => {
    setUser(JSON.parse(localStorage.getItem("yachaflex_user")));
  };

  const handleLogout = () => {
    localStorage.removeItem("yachaflex_token");
    localStorage.removeItem("yachaflex_user");
    setUser(null);
  };

  return (
    <Box minH="100vh" bg="gray.50" py={10}>
      <Container maxW="container.md">
        {!user ? (
          <AuthPanel onSuccess={handleAuthSuccess} />
        ) : (
          <CheckinPanel user={user} onLogout={handleLogout} />
        )}
      </Container>
    </Box>
  );
}

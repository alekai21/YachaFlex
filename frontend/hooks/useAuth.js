import { useEffect, useState } from "react";
import { clearSession, getUser, setSession } from "../lib/auth";
import { login as apiLogin, register as apiRegister, loginDemo as apiLoginDemo } from "../lib/api";

export function useAuth() {
  // null en SSR (servidor no tiene window/localStorage).
  // useEffect sincroniza con localStorage solo en cliente → evita hydration mismatch.
  const [user, setUser] = useState(null);

  useEffect(() => {
    setUser(getUser());
  }, []);

  const login = async ({ email, password }) => {
    const res = await apiLogin({ email, password });
    setSession(res.data.access_token, res.data.user);
    setUser(res.data.user);
    return res.data;
  };

  const register = async ({ email, password, nombre }) => {
    const res = await apiRegister({ email, password, nombre });
    setSession(res.data.access_token, res.data.user);
    setUser(res.data.user);
    return res.data;
  };

  const loginDemo = async () => {
    const res = await apiLoginDemo();
    setSession(res.data.access_token, res.data.user);
    setUser(res.data.user);
    return res.data;
  };

  const logout = () => {
    clearSession();
    setUser(null);
  };

  return { user, login, register, loginDemo, logout };
}

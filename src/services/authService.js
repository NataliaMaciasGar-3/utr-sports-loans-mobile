import { apiClient, tokenStorage } from "./apiClient";

export const login = async (email, password) => {
    const data = await apiClient.post("/api/auth/login", { email, password });
    await tokenStorage.set(data.token);
    return data.user;
};

export const register = ({ nombre, matricula, email, password }) =>
    apiClient.post("/api/auth/register", { nombre, matricula, email, password });

// Restaura la sesión al abrir la app
export const getMe = async () => {
    const data = await apiClient.get("/api/auth/me");
    return data.user;
};

export const logout = () => tokenStorage.clear();
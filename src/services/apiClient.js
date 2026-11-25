import axios from "axios";
import * as SecureStore from "expo-secure-store";

const API_URL = process.env.EXPO_PUBLIC_API_URL;
const API_APP_TOKEN = process.env.EXPO_PUBLIC_API_APP_TOKEN;
const TOKEN_KEY = "user_jwt_token";

export const tokenStorage = {
    get: () => SecureStore.getItemAsync(TOKEN_KEY),
    set: (token) => SecureStore.setItemAsync(TOKEN_KEY, token),
    clear: () => SecureStore.deleteItemAsync(TOKEN_KEY),
};

// La navegación define qué hacer (ir a Login, mostrar pantalla 403)
let onUnauthorized = null;
let onForbidden = null;
export const setUnauthorizedHandler = (fn) => (onUnauthorized = fn);
export const setForbiddenHandler = (fn) => (onForbidden = fn);

export const apiClient = axios.create({
    baseURL: API_URL,
    timeout: 60000, 
    headers: { "Content-Type": "application/json" },
});

// x-api-token siempre, Authorization si hay sesión
apiClient.interceptors.request.use(async (config) => {
    config.headers["x-api-token"] = API_APP_TOKEN;
    const userToken = await tokenStorage.get();
    if (userToken) config.headers.Authorization = `Bearer ${userToken}`;
    return config;
});

const SESSION_CODES = ["TOKEN_MISSING", "TOKEN_INVALID", "TOKEN_EXPIRED", "USER_INACTIVE"];

apiClient.interceptors.response.use(
    (res) => res.data,
    async (error) => {
        const { response } = error;
        if (!response) {
            return Promise.reject(new Error("No hay conexión con el servidor"));
        }

        const { status, data } = response;
        const err = new Error(data?.message || "Error del servidor");
        err.status = status;
        err.code = data?.code;
        err.errors = data?.errors;

        // 401 de sesión: limpiar token y volver a Login
        if (status === 401 && SESSION_CODES.includes(data?.code)) {
            await tokenStorage.clear();
            if (onUnauthorized) onUnauthorized();
        }
        // 403: pantalla de acceso restringido
        if (status === 403 && onForbidden) onForbidden();

        return Promise.reject(err);
    }
);

export default apiClient;
import { createContext, useContext, useEffect, useState } from "react";
import { tokenStorage, setUnauthorizedHandler, setForbiddenHandler } from "../services/apiClient";
import * as authService from "../services/authService";
import { navigationRef } from "../navigation/navigationRef";

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        // 401: sesión inválida -> sin usuario, el navegador muestra Login
        setUnauthorizedHandler(() => setUser(null));
        // 403: pantalla de acceso restringido
        setForbiddenHandler(() => {
            if (navigationRef.isReady()) navigationRef.navigate("Forbidden");
        });
    }, []);

    // Al abrir la app, si hay token guardado, recupera al usuario
    useEffect(() => {
        const restoreSession = async () => {
            try {
                if (await tokenStorage.get()) setUser(await authService.getMe());
            } catch {
                await tokenStorage.clear();
            } finally {
                setLoading(false);
            }
        };
        restoreSession();
    }, []);

    const login = async (email, password) => {
        const loggedUser = await authService.login(email, password);
        setUser(loggedUser);
        return loggedUser;
    };

    const logout = async () => {
        await authService.logout();
        setUser(null);
    };

    const value = { user, loading, isAdmin: user?.rol === "ADMIN", login, logout };

    return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export const useAuth = () => useContext(AuthContext);
import { CommonActions } from "@react-navigation/native";
import { SafeAreaView } from "react-native-safe-area-context";
import StatusMessage from "../components/StatusMessage";
import { useAuth } from "../context/AuthContext";
import { colors } from "../utils/theme";

export default function NotFoundScreen({ navigation }) {
    const { user } = useAuth();

    const handleGoHome = () =>
        navigation.dispatch(
            CommonActions.reset({ index: 0, routes: [{ name: user ? "MainTabs" : "Login" }] })
        );

    return (
        <SafeAreaView style={{ flex: 1, backgroundColor: colors.bg }}>
            <StatusMessage
                icon="compass-outline"
                code="ERROR 404"
                title="Pantalla no encontrada"
                text="La pantalla que buscas no existe o fue movida."
                buttonLabel={user ? "Volver al inventario" : "Ir al inicio de sesión"}
                onPress={handleGoHome}
            />
        </SafeAreaView>
    );
}
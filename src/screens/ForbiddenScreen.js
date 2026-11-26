import { CommonActions } from "@react-navigation/native";
import ScreenLayout from "../components/ScreenLayout";
import StatusMessage from "../components/StatusMessage";

export default function ForbiddenScreen({ navigation }) {
    const handleGoHome = () =>
        navigation.dispatch(CommonActions.reset({ index: 0, routes: [{ name: "MainTabs" }] }));

    return (
        <ScreenLayout back>
            <StatusMessage
                icon="lock-closed-outline"
                code="ERROR 403"
                title="No tienes permiso para ver esta sección"
                text="Esta área está reservada para personal de Coordinación Deportiva."
                buttonLabel="Volver al inventario"
                onPress={handleGoHome}
            />
        </ScreenLayout>
    );
}
import { View, Text, Image, Pressable, Alert, StyleSheet } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useNavigation } from "@react-navigation/native";
import { Ionicons } from "@expo/vector-icons";
import { useAuth } from "../context/AuthContext";
import { colors } from "../utils/theme";

export default function ScreenLayout({ children, back = false }) {
    const navigation = useNavigation();
    const { isAdmin, logout } = useAuth();

    const handleBack = () => navigation.goBack();

    const handleLogout = () => {
        Alert.alert("Cerrar sesión", "¿Quieres salir de tu cuenta?", [
            { text: "Cancelar", style: "cancel" },
            { text: "Salir", style: "destructive", onPress: logout },
        ]);
    };

    return (
        <View style={styles.root}>
            <SafeAreaView edges={["top"]} style={styles.header}>
                <View style={styles.row}>
                    <View style={styles.left}>
                        {back && (
                            <Pressable onPress={handleBack} hitSlop={12} accessibilityLabel="Volver">
                                <Ionicons name="arrow-back" size={26} color="#fff" />
                            </Pressable>
                        )}
                        <Image
                            source={require("../../assets/logo-sports.png")}
                            style={styles.logo}
                            resizeMode="contain"
                        />
                        <Text style={styles.brandText}>UTR Sports</Text>
                    </View>

                    <View style={styles.right}>
                        <View style={styles.chip}>
                            <Text style={styles.chipText}>{isAdmin ? "ADMIN" : "ALUMNO"}</Text>
                        </View>
                        <Pressable onPress={handleLogout} hitSlop={12} accessibilityLabel="Cerrar sesión">
                            <Ionicons name="log-out-outline" size={26} color="#fff" />
                        </Pressable>
                    </View>
                </View>
            </SafeAreaView>

            <View style={styles.content}>{children}</View>
        </View>
    );
}

const styles = StyleSheet.create({
    root: { flex: 1, backgroundColor: colors.bg },
    header: { backgroundColor: colors.red },
    row: {
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "space-between",
        paddingHorizontal: 16,
        paddingVertical: 12,
    },
    left: { flexDirection: "row", alignItems: "center", gap: 10 },
    right: { flexDirection: "row", alignItems: "center", gap: 12 },
    logo: { width: 40, height: 28, tintColor: "#fff" },
    brandText: { color: "#fff", fontSize: 18, fontWeight: "700" },
    chip: { backgroundColor: colors.redDark, paddingHorizontal: 12, paddingVertical: 6, borderRadius: 8 },
    chipText: { color: "#fff", fontSize: 11, fontWeight: "700", letterSpacing: 0.5 },
    content: { flex: 1 },
});
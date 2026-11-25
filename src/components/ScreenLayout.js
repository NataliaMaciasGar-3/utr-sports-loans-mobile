import { useState } from "react";
import { View, Text, Image, Pressable, StyleSheet } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { useAuth } from "../context/AuthContext";
import SideMenu from "./SideMenu";
import { colors } from "../utils/theme";

export default function ScreenLayout({ children }) {
    const { isAdmin } = useAuth();
    const [menuOpen, setMenuOpen] = useState(false);

    const handleOpenMenu = () => setMenuOpen(true);
    const handleCloseMenu = () => setMenuOpen(false);

    return (
        <View style={styles.root}>
            <SafeAreaView edges={["top"]} style={styles.header}>
                <View style={styles.row}>
                    <Pressable onPress={handleOpenMenu} hitSlop={12} accessibilityLabel="Abrir menú">
                        <Ionicons name="menu" size={28} color="#fff" />
                    </Pressable>

                    <View style={styles.brand}>
                        <Image
                            source={require("../../assets/logo-sports.png")}
                            style={styles.logo}
                            resizeMode="contain"
                        />
                        <Text style={styles.brandText}>UTR Sports</Text>
                    </View>

                    <View style={styles.chip}>
                        <Text style={styles.chipText}>{isAdmin ? "ADMIN" : "ALUMNO"}</Text>
                    </View>
                </View>
            </SafeAreaView>

            <View style={styles.content}>{children}</View>

            <SideMenu visible={menuOpen} onClose={handleCloseMenu} />
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
    brand: { flexDirection: "row", alignItems: "center", gap: 8 },
    logo: { width: 40, height: 28, tintColor: "#fff" },
    brandText: { color: "#fff", fontSize: 18, fontWeight: "700" },
    chip: { backgroundColor: colors.redDark, paddingHorizontal: 12, paddingVertical: 6, borderRadius: 8 },
    chipText: { color: "#fff", fontSize: 11, fontWeight: "700", letterSpacing: 0.5 },
    content: { flex: 1 },
});
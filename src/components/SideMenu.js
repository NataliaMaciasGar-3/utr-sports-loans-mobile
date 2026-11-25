import { useState } from "react";
import { Modal, View, Text, Image, Pressable, ScrollView, StyleSheet } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { CommonActions, useNavigation, useRoute } from "@react-navigation/native";
import { Ionicons } from "@expo/vector-icons";
import { useAuth } from "../context/AuthContext";
import { colors } from "../utils/theme";

const MENU = [
    {
        key: "inventory",
        label: "Inventario",
        icon: "grid-outline",
        screen: "Inventory",
        children: [
            { label: "Catálogo de material", params: {} },
            { label: "Disponibles", params: { onlyAvailable: true } },
        ],
    },
    {
        key: "loans",
        label: "Mis préstamos",
        icon: "clipboard-outline",
        screen: "Loans",
        children: [
            { label: "Todos", params: { filter: "TODOS" } },
            { label: "Activos", params: { filter: "ACTIVO" } },
            { label: "Finalizados", params: { filter: "FINALIZADO" } },
        ],
    },
];

export default function SideMenu({ visible, onClose }) {
    const navigation = useNavigation();
    const route = useRoute();
    const { user, isAdmin, logout } = useAuth();
    const [expanded, setExpanded] = useState(route.name === "Loans" ? "loans" : "inventory");

    const handleToggleGroup = (key) => setExpanded(expanded === key ? null : key);

    const handleGo = (screen, params = {}) => {
        onClose();
        navigation.dispatch(
            CommonActions.reset({ index: 0, routes: [{ name: screen, params }] })
        );
    };

    const handleLogout = () => {
        onClose();
        logout();
    };

    return (
        <Modal visible={visible} transparent animationType="fade" onRequestClose={onClose}>
            <View style={styles.overlay}>
                <SafeAreaView style={styles.panel}>
                    <View style={styles.head}>
                        <Image
                            source={require("../../assets/logo-sports.png")}
                            style={styles.logo}
                            resizeMode="contain"
                        />
                        <Pressable onPress={onClose} hitSlop={12} accessibilityLabel="Cerrar menú">
                            <Ionicons name="close" size={28} color="#fff" />
                        </Pressable>
                    </View>

                    <ScrollView contentContainerStyle={styles.body}>
                        <Text style={styles.name}>{user.nombre}</Text>
                        <Text style={styles.sub}>
                            {isAdmin ? "Administrador" : "Alumno"} · Matrícula {user.matricula}
                        </Text>
                        <View style={styles.divider} />

                        {MENU.map((group) => {
                            const open = expanded === group.key;
                            const current = route.name === group.screen;
                            return (
                                <View key={group.key}>
                                    <Pressable
                                        style={[styles.item, current && styles.itemActive]}
                                        onPress={() => handleToggleGroup(group.key)}
                                    >
                                        <Ionicons name={group.icon} size={20} color={current ? colors.red : colors.text} />
                                        <Text style={[styles.itemText, current && { color: colors.red }]}>{group.label}</Text>
                                        <Ionicons name={open ? "chevron-up" : "chevron-down"} size={18} color={colors.muted} />
                                    </Pressable>

                                    {open &&
                                        group.children.map((child) => (
                                            <Pressable key={child.label} onPress={() => handleGo(group.screen, child.params)}>
                                                <Text style={styles.subItem}>{child.label}</Text>
                                            </Pressable>
                                        ))}
                                </View>
                            );
                        })}

                        {isAdmin && (
                            <Pressable
                                style={[styles.item, route.name === "Admin" && styles.itemActive]}
                                onPress={() => handleGo("Admin")}
                            >
                                <Ionicons name="settings-outline" size={20} color={colors.text} />
                                <Text style={styles.itemText}>Administración</Text>
                            </Pressable>
                        )}
                    </ScrollView>

                    <Pressable style={styles.logout} onPress={handleLogout}>
                        <Ionicons name="log-out-outline" size={20} color={colors.text} />
                        <Text style={styles.itemText}>Cerrar sesión</Text>
                    </Pressable>
                </SafeAreaView>

                {/* Zona oscura a la derecha: tocar para cerrar */}
                <Pressable style={styles.backdrop} onPress={onClose} />
            </View>
        </Modal>
    );
}

const styles = StyleSheet.create({
    overlay: { flex: 1, flexDirection: "row", backgroundColor: "rgba(15,23,42,0.55)" },
    panel: { width: "82%", backgroundColor: "#fff" },
    backdrop: { flex: 1 },
    head: {
        backgroundColor: colors.red,
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "center",
        paddingHorizontal: 20,
        paddingVertical: 18,
    },
    logo: { width: 80, height: 40, tintColor: "#fff" },
    body: { padding: 20 },
    name: { fontSize: 22, fontWeight: "700", color: colors.text },
    sub: { fontSize: 13, color: colors.muted, marginTop: 4 },
    divider: { height: 1, backgroundColor: colors.border, marginVertical: 18 },
    item: {
        flexDirection: "row",
        alignItems: "center",
        gap: 12,
        padding: 12,
        borderRadius: 10,
        marginBottom: 4,
    },
    itemActive: { backgroundColor: colors.redSoft },
    itemText: { flex: 1, fontSize: 16, fontWeight: "600", color: colors.text },
    subItem: { paddingVertical: 10, paddingLeft: 44, fontSize: 14, color: colors.muted },
    logout: {
        flexDirection: "row",
        alignItems: "center",
        gap: 12,
        margin: 20,
        padding: 14,
        borderRadius: 10,
        backgroundColor: "#f1f5f9",
    },
});
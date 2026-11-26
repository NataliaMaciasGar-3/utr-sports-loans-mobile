import { View, Text, Pressable, StyleSheet } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { colors } from "../utils/theme";

const STATUS = {
    NUEVO: { bg: "#e0f2fe", color: "#0369a1" },
    BUENO: { bg: "#d1fae5", color: "#047857" },
    DESGASTADO: { bg: "#fef3c7", color: "#b45309" },
};

export default function ItemCard({ item, onRequest }) {
    const soldOut = item.disponibles === 0;
    const status = STATUS[item.estadoFisico] || { bg: "#f1f5f9", color: colors.muted };
    const ratio = item.cantidadTotal > 0 ? item.disponibles / item.cantidadTotal : 0;

    const handlePress = () => onRequest(item);

    return (
        <View style={styles.card}>
            <View style={styles.top}>
                <Text style={styles.code}>{item.codigo}</Text>
                <View style={[styles.badge, { backgroundColor: status.bg }]}>
                    <Text style={[styles.badgeText, { color: status.color }]}>{item.estadoFisico}</Text>
                </View>
            </View>

            <View style={styles.sportRow}>
                <Ionicons name="globe-outline" size={16} color={colors.muted} />
                <Text style={styles.sport}>{item.deporte}</Text>
            </View>

            <Text style={styles.name}>{item.nombre}</Text>

            <View style={styles.stockRow}>
                <Text style={styles.stockLabel}>Stock disponible</Text>
                <Text style={styles.stockValue}>{item.disponibles}/{item.cantidadTotal}</Text>
            </View>
            <View style={styles.bar}>
                <View style={[styles.barFill, { width: `${ratio * 100}%` }]} />
            </View>

            <Pressable
                style={[styles.button, soldOut && styles.buttonDisabled]}
                onPress={handlePress}
                disabled={soldOut}
            >
                {soldOut ? (
                    <Text style={[styles.buttonText, { color: colors.muted }]}>Agotado</Text>
                ) : (
                    <>
                        <Ionicons name="add-circle-outline" size={20} color="#fff" />
                        <Text style={styles.buttonText}>Solicitar préstamo</Text>
                    </>
                )}
            </Pressable>
        </View>
    );
}

const styles = StyleSheet.create({
    card: {
        backgroundColor: "#fff", borderRadius: 16, borderWidth: 1, borderColor: colors.border,
        padding: 16, gap: 8,
    },
    top: { flexDirection: "row", justifyContent: "space-between", alignItems: "center" },
    code: { fontSize: 13, color: colors.muted, fontWeight: "600" },
    badge: { paddingHorizontal: 12, paddingVertical: 4, borderRadius: 8 },
    badgeText: { fontSize: 11, fontWeight: "700" },
    sportRow: { flexDirection: "row", alignItems: "center", gap: 6 },
    sport: { fontSize: 14, color: colors.muted },
    name: { fontSize: 20, fontWeight: "700", color: colors.text, marginBottom: 4 },
    stockRow: { flexDirection: "row", justifyContent: "space-between" },
    stockLabel: { fontSize: 13, color: colors.muted },
    stockValue: { fontSize: 14, fontWeight: "700", color: colors.text },
    bar: { height: 6, borderRadius: 3, backgroundColor: "#e2e8f0", overflow: "hidden" },
    barFill: { height: "100%", backgroundColor: "#10b981", borderRadius: 3 },
    button: {
        marginTop: 6, minHeight: 48, borderRadius: 10, backgroundColor: colors.red,
        flexDirection: "row", alignItems: "center", justifyContent: "center", gap: 8,
    },
    buttonDisabled: { backgroundColor: "#f1f5f9" },
    buttonText: { color: "#fff", fontSize: 15, fontWeight: "700" },
});
import { View, Text, Pressable, StyleSheet } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { colors } from "../utils/theme";

export default function StatusMessage({ icon, code, title, text, buttonLabel, onPress }) {
    return (
        <View style={styles.wrap}>
            <View style={styles.card}>
                <View style={styles.iconBox}>
                    <Ionicons name={icon} size={34} color={colors.red} />
                </View>
                <Text style={styles.code}>{code}</Text>
                <Text style={styles.title}>{title}</Text>
                <Text style={styles.text}>{text}</Text>

                <Pressable style={styles.button} onPress={onPress}>
                    <Ionicons name="arrow-back" size={18} color="#fff" />
                    <Text style={styles.buttonText}>{buttonLabel}</Text>
                </Pressable>
            </View>
        </View>
    );
}

const styles = StyleSheet.create({
    wrap: { flex: 1, justifyContent: "center", padding: 24 },
    card: {
        alignItems: "center", gap: 10, padding: 28,
        backgroundColor: "#fff", borderRadius: 18, borderWidth: 1, borderColor: colors.border,
    },
    iconBox: {
        width: 68, height: 68, borderRadius: 16, backgroundColor: colors.redSoft,
        alignItems: "center", justifyContent: "center", marginBottom: 6,
    },
    code: { fontSize: 12, fontWeight: "700", letterSpacing: 1, color: "#94a3b8" },
    title: { fontSize: 22, fontWeight: "800", color: colors.text, textAlign: "center" },
    text: { fontSize: 14, color: colors.muted, textAlign: "center", lineHeight: 21 },
    button: {
        marginTop: 12, alignSelf: "stretch", minHeight: 50, borderRadius: 10,
        backgroundColor: colors.red, flexDirection: "row",
        alignItems: "center", justifyContent: "center", gap: 8,
    },
    buttonText: { color: "#fff", fontSize: 15, fontWeight: "700" },
});
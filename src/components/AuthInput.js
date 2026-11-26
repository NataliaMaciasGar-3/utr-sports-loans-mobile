import { useState } from "react";
import { View, Text, TextInput, Pressable, StyleSheet } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { colors } from "../utils/theme";

export default function AuthInput({ label, error, secure = false, style, ...inputProps }) {
    const [hidden, setHidden] = useState(secure);

    const handleToggleHidden = () => setHidden((h) => !h);

    return (
        <View style={styles.field}>
            <Text style={styles.label}>{label}</Text>

            <View style={[styles.box, error && styles.boxError]}>
                <TextInput
                    style={[styles.input, style]}
                    placeholderTextColor="#9ca3af"
                    secureTextEntry={hidden}
                    {...inputProps}
                />
                {secure && (
                    <Pressable onPress={handleToggleHidden} hitSlop={10} accessibilityLabel="Mostrar u ocultar contraseña">
                        <Ionicons name={hidden ? "eye-outline" : "eye-off-outline"} size={22} color={colors.muted} />
                    </Pressable>
                )}
            </View>

            {error ? <Text style={styles.error}>{error}</Text> : null}
        </View>
    );
}

const styles = StyleSheet.create({
    field: { gap: 6 },
    label: { fontSize: 13, fontWeight: "600", color: "#000" },
    box: {
        flexDirection: "row",
        alignItems: "center",
        borderWidth: 1.5,
        borderColor: colors.red,
        borderRadius: 10,
        backgroundColor: "#fff",
        paddingHorizontal: 14,
    },
    boxError: { borderColor: "#b91c1c" },
    input: { flex: 1, paddingVertical: 13, fontSize: 15, fontWeight: "700", color: "#000" },
    error: { fontSize: 12, color: "#b91c1c" },
});
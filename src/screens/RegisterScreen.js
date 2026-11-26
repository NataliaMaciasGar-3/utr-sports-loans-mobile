import { useState } from "react";
import { View, Text, Pressable, ActivityIndicator, StyleSheet } from "react-native";
import { useAuth } from "../context/AuthContext";
import { register } from "../services/authService";
import AuthScreenLayout from "../components/AuthScreenLayout";
import AuthInput from "../components/AuthInput";
import { colors } from "../utils/theme";

const INITIAL = { nombre: "", matricula: "", email: "", password: "" };

export default function RegisterScreen({ navigation }) {
    const { login } = useAuth();

    const [form, setForm] = useState(INITIAL);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");
    const [fieldErrors, setFieldErrors] = useState({});

    const handleChange = (name, value) => {
        setForm((prev) => ({ ...prev, [name]: value }));
        setFieldErrors((prev) => ({ ...prev, [name]: "" }));
    };

    const handleSubmit = async () => {
        setError("");
        setFieldErrors({});
        setLoading(true);
        try {
            await register({
                nombre: form.nombre.trim(),
                matricula: form.matricula.trim(),
                email: form.email.trim(),
                password: form.password,
            });
            await login(form.email.trim(), form.password);
        } catch (err) {
            if (err.errors?.length) {
                setFieldErrors(Object.fromEntries(err.errors.map((x) => [x.campo, x.mensaje])));
            } else {
                setError(err.message); // por ejemplo 409: correo o matrícula duplicados
            }
            setLoading(false);
        }
    };

    const handleGoToLogin = () => navigation.navigate("Login");

    return (
        <AuthScreenLayout
            title="Crea tu cuenta"
            subtitle={
                <Text style={styles.subtitleText}>
                    ¿Ya tienes cuenta?{" "}
                    <Text style={styles.link} onPress={handleGoToLogin}>Inicia sesión</Text>
                </Text>
            }
        >
            {error ? (
                <View style={styles.alert}>
                    <Text style={styles.alertText}>⚠ {error}</Text>
                </View>
            ) : null}

            <AuthInput
                label="Nombre completo"
                placeholder="Juanito Pérez"
                value={form.nombre}
                onChangeText={(v) => handleChange("nombre", v)}
                error={fieldErrors.nombre}
                autoCapitalize="words"
                textContentType="name"
            />

            <AuthInput
                label="Matrícula"
                placeholder="Ej. UTR22001"
                value={form.matricula}
                onChangeText={(v) => handleChange("matricula", v)}
                error={fieldErrors.matricula}
                autoCapitalize="characters"
                autoCorrect={false}
            />

            <AuthInput
                label="Correo electrónico"
                placeholder="Ej. st1123@utr.edu.mx"
                value={form.email}
                onChangeText={(v) => handleChange("email", v)}
                error={fieldErrors.email}
                autoCapitalize="none"
                autoCorrect={false}
                keyboardType="email-address"
                textContentType="emailAddress"
            />

            <AuthInput
                label="Contraseña"
                placeholder="••••••••"
                secure
                value={form.password}
                onChangeText={(v) => handleChange("password", v)}
                error={fieldErrors.password}
                autoCapitalize="none"
                textContentType="newPassword"
                returnKeyType="go"
                onSubmitEditing={handleSubmit}
            />

            <Pressable
                style={[styles.button, loading && styles.buttonDisabled]}
                onPress={handleSubmit}
                disabled={loading}
            >
                {loading ? (
                    <ActivityIndicator color="#fff" />
                ) : (
                    <Text style={styles.buttonText}>Crear cuenta</Text>
                )}
            </Pressable>

            <Text style={styles.support}>¿Problemas para registrarte? Contacta a soporte.</Text>
        </AuthScreenLayout>
    );
}

const styles = StyleSheet.create({
    subtitleText: { fontSize: 14, color: "#000" },
    link: { color: "#0369a1", fontWeight: "700" },
    alert: {
        padding: 12, borderRadius: 10, backgroundColor: colors.redSoft,
        borderWidth: 1, borderColor: "#f5b5c0",
    },
    alertText: { color: "#b91c1c", fontSize: 13 },
    button: {
        backgroundColor: colors.red, borderRadius: 10, paddingVertical: 14,
        alignItems: "center", justifyContent: "center", minHeight: 50,
    },
    buttonDisabled: { opacity: 0.6 },
    buttonText: { color: "#fff", fontSize: 16, fontWeight: "700" },
    support: { textAlign: "center", fontSize: 12, color: colors.muted },
});
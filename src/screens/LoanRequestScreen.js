import { useState } from "react";
import { View, Text, TextInput, Pressable, ActivityIndicator, StyleSheet } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import ScreenLayout from "../components/ScreenLayout";
import KeyboardAwareScroll, { useEnsureVisible } from "../components/KeyboardAwareScroll";
import { createLoan } from "../services/loansService";
import { colors } from "../utils/theme";

const SUGGESTIONS = ["Cancha 1 - Fútbol", "Cancha 2 - Torneo", "Gimnasio - Básquetbol", "Clase Educación Física"];

const formatDate = (value) =>
    value ? new Date(value).toLocaleString("es-MX", { dateStyle: "medium", timeStyle: "short" }) : "—";

// Campo de texto que se mantiene visible sobre el teclado
function Field({ label, hint, error, style, ...inputProps }) {
    const ensureVisible = useEnsureVisible();
    return (
        <View style={styles.field}>
            <View style={styles.labelRow}>
                <Text style={styles.label}>{label}</Text>
                {hint ? <Text style={styles.hint}>{hint}</Text> : null}
            </View>
            <TextInput
                style={[styles.input, error && styles.inputError, style]}
                placeholderTextColor="#9ca3af"
                onFocus={ensureVisible}
                {...inputProps}
            />
            {error ? <Text style={styles.error}>{error}</Text> : null}
        </View>
    );
}

export default function LoanRequestScreen({ route, navigation }) {
    const { item } = route.params;
    const max = item.disponibles;

    const [cantidad, setCantidad] = useState("1");
    const [cancha, setCancha] = useState("");
    const [accepted, setAccepted] = useState(false);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");
    const [fieldErrors, setFieldErrors] = useState({});
    const [created, setCreated] = useState(null); // respuesta de la API al crear

    const clearFieldError = (name) => setFieldErrors((prev) => ({ ...prev, [name]: "" }));

    const handleQuantityChange = (text) => {
        setCantidad(text.replace(/\D/g, ""));
        clearFieldError("cantidad");
    };
    const handleStep = (delta) => {
        const next = Math.min(max, Math.max(1, (Number(cantidad) || 0) + delta));
        setCantidad(String(next));
        clearFieldError("cantidad");
    };
    const handleCanchaChange = (text) => {
        setCancha(text);
        clearFieldError("canchaOActividad");
    };
    const handleSelectSuggestion = (text) => {
        setCancha(text);
        clearFieldError("canchaOActividad");
    };
    const handleToggleAccepted = () => {
        setAccepted((a) => !a);
        clearFieldError("accepted");
    };

    const validate = () => {
        const errors = {};
        const qty = Number(cantidad);
        if (!qty || qty < 1) errors.cantidad = "Indica al menos 1 unidad";
        else if (qty > max) errors.cantidad = `Máximo ${max} unidades disponibles`;
        if (!cancha.trim()) errors.canchaOActividad = "Indica la cancha o actividad";
        if (!accepted) errors.accepted = "Debes aceptar el compromiso";
        return errors;
    };

    const handleSubmit = async () => {
        setError("");
        const errors = validate();
        setFieldErrors(errors);
        if (Object.keys(errors).length) return;

        setLoading(true);
        try {
            const loan = await createLoan({
                itemId: item.id,
                cantidad: Number(cantidad),
                canchaOActividad: cancha.trim(),
            });
            setCreated(loan);
        } catch (err) {
            if (err.errors?.length) {
                setFieldErrors(Object.fromEntries(err.errors.map((x) => [x.campo, x.mensaje])));
            } else {
                setError(err.message); // por ejemplo 409: sin stock suficiente
            }
        } finally {
            setLoading(false);
        }
    };

    const handleCancel = () => navigation.goBack();
    const handleGoToLoans = () => navigation.navigate("MainTabs", { screen: "Loans" });

    // ----- Vista de confirmación -----
    if (created) {
        return (
            <ScreenLayout>
                <KeyboardAwareScroll contentContainerStyle={styles.success}>
                    <View style={styles.successIcon}>
                        <Ionicons name="checkmark" size={36} color="#047857" />
                    </View>
                    <Text style={styles.successTitle}>¡Vale confirmado!</Text>
                    <Text style={styles.successText}>
                        Presenta este folio en la ventanilla de Coordinación Deportiva para recoger tu material.
                    </Text>

                    <View style={styles.summary}>
                        <SummaryRow label="Folio de préstamo" value={`#${created.loanId}`} bold />
                        <SummaryRow label="Material" value={`${cantidad}x ${item.nombre}`} />
                        <SummaryRow label="Cancha o actividad" value={cancha.trim()} />
                        <SummaryRow label="Hora de salida" value={formatDate(created.horaSalida)} />
                    </View>

                    <Pressable style={styles.primary} onPress={handleGoToLoans}>
                        <Text style={styles.primaryText}>Ver mis préstamos</Text>
                    </Pressable>
                    <Pressable style={styles.secondary} onPress={handleCancel}>
                        <Text style={styles.secondaryText}>Seguir explorando</Text>
                    </Pressable>
                </KeyboardAwareScroll>
            </ScreenLayout>
        );
    }

    // ----- Formulario -----
    return (
        <ScreenLayout back>
            <KeyboardAwareScroll contentContainerStyle={styles.container}>
                <Text style={styles.title}>Solicitar préstamo</Text>
                <Text style={styles.subtitle}>Completa los datos para solicitar el préstamo del material deportivo.</Text>

                <View style={styles.itemCard}>
                    <Text style={styles.itemMeta}>{item.codigo} · {item.deporte}</Text>
                    <Text style={styles.itemName}>{item.nombre}</Text>
                    <Text style={styles.itemStock}>
                        {item.disponibles} unidades disponibles · Estado: {item.estadoFisico}
                    </Text>
                </View>

                {error ? (
                    <View style={styles.alert}>
                        <Text style={styles.alertText}>⚠ {error}</Text>
                    </View>
                ) : null}

                <View style={styles.field}>
                    <Text style={styles.label}>Cantidad solicitada *</Text>
                    <View style={styles.stepper}>
                        <Pressable style={styles.stepBtn} onPress={() => handleStep(-1)} accessibilityLabel="Restar">
                            <Ionicons name="remove" size={22} color={colors.text} />
                        </Pressable>
                        <TextInput
                            style={[styles.input, styles.stepInput, fieldErrors.cantidad && styles.inputError]}
                            value={cantidad}
                            onChangeText={handleQuantityChange}
                            keyboardType="number-pad"
                            onFocus={useEnsureVisible()}
                        />
                        <Pressable style={styles.stepBtn} onPress={() => handleStep(1)} accessibilityLabel="Sumar">
                            <Ionicons name="add" size={22} color={colors.text} />
                        </Pressable>
                    </View>
                    <Text style={styles.hint}>Máximo {max}</Text>
                    {fieldErrors.cantidad ? <Text style={styles.error}>{fieldErrors.cantidad}</Text> : null}
                </View>

                <Field
                    label="Cancha o actividad *"
                    placeholder="Ej. Cancha 2 - Torneo"
                    value={cancha}
                    onChangeText={handleCanchaChange}
                    error={fieldErrors.canchaOActividad}
                />

                <View style={styles.chips}>
                    {SUGGESTIONS.map((s) => (
                        <Pressable key={s} style={styles.chip} onPress={() => handleSelectSuggestion(s)}>
                            <Text style={styles.chipText}>{s}</Text>
                        </Pressable>
                    ))}
                </View>

                <Pressable style={styles.commitment} onPress={handleToggleAccepted}>
                    <Text style={styles.commitTitle}>Cuida el equipo, comparte el juego.</Text>
                    <View style={styles.commitRow}>
                        <Ionicons
                            name={accepted ? "checkbox" : "square-outline"}
                            size={26}
                            color={accepted ? colors.red : colors.muted}
                        />
                        <Text style={styles.commitText}>
                            Me comprometo a cuidar el material y devolverlo en bodega al finalizar la actividad.
                        </Text>
                    </View>
                </Pressable>
                {fieldErrors.accepted ? <Text style={styles.error}>{fieldErrors.accepted}</Text> : null}

                <Pressable
                    style={[styles.primary, loading && styles.disabled]}
                    onPress={handleSubmit}
                    disabled={loading}
                >
                    {loading ? <ActivityIndicator color="#fff" /> : <Text style={styles.primaryText}>Confirmar préstamo</Text>}
                </Pressable>
                <Pressable style={[styles.secondary, loading && styles.disabled]} onPress={handleCancel} disabled={loading}>
                    <Text style={styles.secondaryText}>Cancelar</Text>
                </Pressable>
            </KeyboardAwareScroll>
        </ScreenLayout>
    );
}

function SummaryRow({ label, value, bold }) {
    return (
        <View style={styles.summaryRow}>
            <Text style={styles.summaryLabel}>{label}</Text>
            <Text style={[styles.summaryValue, bold && { fontSize: 16, fontWeight: "800" }]}>{value}</Text>
        </View>
    );
}

const styles = StyleSheet.create({
    container: { padding: 20, gap: 16 },
    title: { fontSize: 28, fontWeight: "800", color: colors.text },
    subtitle: { fontSize: 14, color: colors.muted, marginTop: -8 },

    itemCard: {
        backgroundColor: "#fff", borderRadius: 14, borderWidth: 1, borderColor: colors.border,
        padding: 16, gap: 4,
    },
    itemMeta: { fontSize: 13, color: colors.muted },
    itemName: { fontSize: 22, fontWeight: "700", color: colors.text },
    itemStock: { fontSize: 14, color: "#047857" },

    alert: { padding: 12, borderRadius: 10, backgroundColor: colors.redSoft, borderWidth: 1, borderColor: "#f5b5c0" },
    alertText: { color: "#b91c1c", fontSize: 13 },

    field: { gap: 6 },
    labelRow: { flexDirection: "row", justifyContent: "space-between" },
    label: { fontSize: 14, fontWeight: "600", color: "#000" },
    hint: { fontSize: 12, color: colors.muted },
    input: {
        backgroundColor: "#fff", borderWidth: 1.5, borderColor: colors.red, borderRadius: 10,
        paddingHorizontal: 14, paddingVertical: 12, fontSize: 16, fontWeight: "700", color: "#000",
    },
    inputError: { borderColor: "#b91c1c" },
    error: { fontSize: 12, color: "#b91c1c" },

    stepper: { flexDirection: "row", gap: 8, alignItems: "stretch" },
    stepBtn: {
        width: 48, borderRadius: 10, borderWidth: 1, borderColor: "#cbd5e1",
        backgroundColor: "#fff", alignItems: "center", justifyContent: "center",
    },
    stepInput: { flex: 1, textAlign: "center" },

    chips: { flexDirection: "row", flexWrap: "wrap", gap: 8 },
    chip: { paddingHorizontal: 12, paddingVertical: 8, borderRadius: 8, backgroundColor: "#eef2f7" },
    chipText: { fontSize: 12, fontWeight: "600", color: colors.text },

    commitment: { backgroundColor: "#eef2f7", borderRadius: 12, padding: 14, gap: 10 },
    commitTitle: { fontSize: 14, fontWeight: "700", color: colors.text },
    commitRow: { flexDirection: "row", gap: 10, alignItems: "flex-start" },
    commitText: { flex: 1, fontSize: 13, color: colors.muted, lineHeight: 19 },

    primary: {
        minHeight: 52, borderRadius: 10, backgroundColor: colors.red,
        alignItems: "center", justifyContent: "center",
    },
    primaryText: { color: "#fff", fontSize: 16, fontWeight: "700" },
    secondary: {
        minHeight: 52, borderRadius: 10, backgroundColor: "#fff",
        borderWidth: 1, borderColor: "#cbd5e1", alignItems: "center", justifyContent: "center",
    },
    secondaryText: { color: colors.text, fontSize: 16, fontWeight: "700" },
    disabled: { opacity: 0.6 },

    // Confirmación
    success: { padding: 24, gap: 14, alignItems: "center" },
    successIcon: {
        width: 64, height: 64, borderRadius: 32, backgroundColor: "#d1fae5",
        alignItems: "center", justifyContent: "center", marginTop: 12,
    },
    successTitle: { fontSize: 26, fontWeight: "800", color: colors.text },
    successText: { fontSize: 14, color: colors.muted, textAlign: "center" },
    summary: {
        alignSelf: "stretch", backgroundColor: "#fff", borderRadius: 14,
        borderWidth: 1, borderColor: colors.border, padding: 16, gap: 12,
    },
    summaryRow: { flexDirection: "row", justifyContent: "space-between", gap: 12 },
    summaryLabel: { fontSize: 13, color: colors.muted },
    summaryValue: { fontSize: 13, fontWeight: "700", color: colors.text, flexShrink: 1, textAlign: "right" },
});
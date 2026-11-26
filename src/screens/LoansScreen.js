import { useCallback, useMemo, useRef, useState } from "react";
import { View, Text, FlatList, Pressable, ActivityIndicator, RefreshControl, StyleSheet } from "react-native";
import { useFocusEffect } from "@react-navigation/native";
import { Ionicons } from "@expo/vector-icons";
import ScreenLayout from "../components/ScreenLayout";
import { useAuth } from "../context/AuthContext";
import { getLoans } from "../services/loansService";
import { colors } from "../utils/theme";

const FILTERS = [
    { key: "TODOS", label: "Todos" },
    { key: "ACTIVO", label: "Activos" },
    { key: "FINALIZADO", label: "Finalizados" },
];

const formatDate = (value) =>
    value ? new Date(value).toLocaleString("es-MX", { dateStyle: "medium", timeStyle: "short" }) : "—";

export default function LoansScreen({ navigation }) {
    const { isAdmin } = useAuth();

    const [loans, setLoans] = useState([]);
    const [filter, setFilter] = useState("TODOS");
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);
    const [error, setError] = useState("");

    const requestId = useRef(0); // evita que una respuesta vieja pise a una más reciente

    const loadLoans = useCallback(async ({ pull = false } = {}) => {
        const id = ++requestId.current;
        if (!pull) setLoading(true);
        setError("");
        try {
            const data = await getLoans();
            // Más recientes primero
            const sorted = [...data].sort((a, b) => new Date(b.horaSalida) - new Date(a.horaSalida));
            if (id === requestId.current) setLoans(sorted);
        } catch (err) {
            if (id === requestId.current) setError(err.message);
        } finally {
            if (id === requestId.current) {
                setLoading(false);
                setRefreshing(false);
            }
        }
    }, []);

    // Se recarga cada vez que entras a la pestaña (por ejemplo, tras crear un préstamo)
    useFocusEffect(
        useCallback(() => {
            loadLoans();
        }, [loadLoans])
    );

    const handleSelectFilter = (key) => setFilter(key);
    const handleRetry = () => loadLoans();
    const handleRefresh = () => {
        setRefreshing(true);
        loadLoans({ pull: true });
    };
    const handleGoToInventory = () => navigation.navigate("Inventory");

    const count = (key) => (key === "TODOS" ? loans.length : loans.filter((l) => l.estatus === key).length);

    const { activeCount, unitsInUse } = useMemo(() => {
        const active = loans.filter((l) => l.estatus === "ACTIVO");
        return { activeCount: active.length, unitsInUse: active.reduce((sum, l) => sum + l.cantidad, 0) };
    }, [loans]);

    const visibleLoans = filter === "TODOS" ? loans : loans.filter((l) => l.estatus === filter);

    const header = (
        <View style={styles.header}>
            <Text style={styles.title}>{isAdmin ? "Préstamos Deportivos" : "Mis Préstamos Deportivos"}</Text>
            <Text style={styles.subtitle}>
                {isAdmin
                    ? "Consulta los vales de todos los usuarios."
                    : "Consulta tus vales activos y el historial de material devuelto."}
            </Text>

            <View style={styles.segmented}>
                {FILTERS.map((f) => {
                    const active = filter === f.key;
                    return (
                        <Pressable
                            key={f.key}
                            style={[styles.segBtn, active && styles.segBtnActive]}
                            onPress={() => handleSelectFilter(f.key)}
                        >
                            <Text style={[styles.segText, active && styles.segTextActive]}>
                                {f.label} ({count(f.key)})
                            </Text>
                        </Pressable>
                    );
                })}
            </View>
        </View>
    );

    const empty = loading ? (
        <View style={styles.state}>
            <ActivityIndicator size="large" color={colors.red} />
            <Text style={styles.stateText}>Cargando préstamos...</Text>
        </View>
    ) : error ? (
        <View style={[styles.state, styles.stateError]}>
            <Ionicons name="cloud-offline-outline" size={36} color={colors.red} />
            <Text style={styles.stateTitle}>No pudimos cargar tus préstamos</Text>
            <Text style={styles.stateText}>{error}</Text>
            <Pressable style={styles.stateButton} onPress={handleRetry}>
                <Text style={styles.stateButtonText}>Reintentar</Text>
            </Pressable>
        </View>
    ) : (
        <View style={styles.state}>
            <Ionicons name="clipboard-outline" size={36} color={colors.muted} />
            <Text style={styles.stateTitle}>
                {loans.length === 0 ? "Aún no tienes préstamos" : "No hay préstamos en esta categoría"}
            </Text>
            <Text style={styles.stateText}>
                {loans.length === 0 ? "Cuando solicites material, tu vale aparecerá aquí." : "Prueba con otro filtro."}
            </Text>
            {loans.length === 0 && (
                <Pressable style={styles.stateButton} onPress={handleGoToInventory}>
                    <Text style={styles.stateButtonText}>Ir al inventario</Text>
                </Pressable>
            )}
        </View>
    );

    const footer =
        !loading && !error && activeCount > 0 ? (
            <Text style={styles.summary}>
                {activeCount} {activeCount === 1 ? "préstamo activo" : "préstamos activos"} · {unitsInUse}{" "}
                {unitsInUse === 1 ? "artículo" : "artículos"} en uso
            </Text>
        ) : null;

    const renderLoan = ({ item: loan }) => {
        const active = loan.estatus === "ACTIVO";
        const damaged = loan.estadoDevolucion === "DANADO";

        return (
            <View style={[styles.card, active && styles.cardActive]}>
                <View style={styles.cardTop}>
                    <Text style={styles.folio}>Folio #{loan.loanId}</Text>
                    <View style={[styles.badge, active ? styles.badgeActive : styles.badgeDone]}>
                        <Text style={[styles.badgeText, { color: active ? "#047857" : colors.muted }]}>{loan.estatus}</Text>
                    </View>
                </View>

                <Text style={styles.cardTitle}>{loan.cantidad}x {loan.item}</Text>
                <Text style={styles.meta}>{loan.codigo} · {loan.canchaOActividad}</Text>
                {isAdmin && (
                    <Text style={styles.meta}>Solicitante: {loan.usuario} ({loan.matricula})</Text>
                )}
                <Text style={styles.meta}>{formatDate(loan.horaSalida)}</Text>

                {active ? (
                    <View style={styles.noteBox}>
                        <Text style={styles.noteTitle}>Entrega en Coordinación Deportiva</Text>
                        <Text style={styles.noteText}>Devuelve el material en las mismas condiciones en que lo recibiste.</Text>
                    </View>
                ) : (
                    <View style={[styles.noteBox, styles.noteBoxDone]}>
                        <Text style={styles.noteTitle}>
                            Devolución:{" "}
                            <Text style={{ color: damaged ? "#b91c1c" : "#047857" }}>{loan.estadoDevolucion || "—"}</Text>
                        </Text>
                        <Text style={styles.noteText}>
                            Devuelto el {formatDate(loan.horaDevolucion)}
                            {loan.notas ? ` · ${loan.notas}` : ""}
                        </Text>
                    </View>
                )}
            </View>
        );
    };

    return (
        <ScreenLayout>
            <FlatList
                data={loading || error ? [] : visibleLoans}
                keyExtractor={(loan) => String(loan.loanId)}
                renderItem={renderLoan}
                ListHeaderComponent={header}
                ListEmptyComponent={empty}
                ListFooterComponent={footer}
                ItemSeparatorComponent={() => <View style={{ height: 14 }} />}
                contentContainerStyle={styles.list}
                refreshControl={<RefreshControl refreshing={refreshing} onRefresh={handleRefresh} colors={[colors.red]} />}
            />
        </ScreenLayout>
    );
}

const styles = StyleSheet.create({
    list: { padding: 20, paddingBottom: 32 },
    header: { gap: 12, marginBottom: 16 },
    title: { fontSize: 28, fontWeight: "800", color: colors.text },
    subtitle: { fontSize: 14, color: colors.muted },

    segmented: { flexDirection: "row", backgroundColor: "#eef2f7", borderRadius: 12, padding: 4, marginTop: 4 },
    segBtn: { flex: 1, paddingVertical: 11, borderRadius: 9, alignItems: "center" },
    segBtnActive: { backgroundColor: "#fff" },
    segText: { fontSize: 12, fontWeight: "600", color: colors.muted },
    segTextActive: { color: colors.red },

    card: {
        backgroundColor: "#fff", borderRadius: 16, borderWidth: 1, borderColor: colors.border,
        padding: 16, gap: 6,
    },
    cardActive: { borderColor: "#f5b5c0" },
    cardTop: { flexDirection: "row", justifyContent: "space-between", alignItems: "center" },
    folio: { fontSize: 13, color: colors.muted, fontWeight: "600" },
    badge: { paddingHorizontal: 12, paddingVertical: 4, borderRadius: 8 },
    badgeActive: { backgroundColor: "#d1fae5" },
    badgeDone: { backgroundColor: "#f1f5f9" },
    badgeText: { fontSize: 11, fontWeight: "700" },
    cardTitle: { fontSize: 22, fontWeight: "700", color: colors.text, marginTop: 4 },
    meta: { fontSize: 14, color: colors.muted },

    noteBox: { marginTop: 8, padding: 12, borderRadius: 10, backgroundColor: "#eef2f7", gap: 4 },
    noteBoxDone: { backgroundColor: "#f8fafc", borderWidth: 1, borderColor: colors.border },
    noteTitle: { fontSize: 14, fontWeight: "700", color: colors.text },
    noteText: { fontSize: 13, color: colors.muted, lineHeight: 19 },

    summary: { marginTop: 16, fontSize: 13, color: colors.muted },

    state: {
        alignItems: "center", gap: 8, padding: 32,
        backgroundColor: "#fff", borderRadius: 16, borderWidth: 1, borderColor: colors.border,
    },
    stateError: { borderColor: "#f5b5c0" },
    stateTitle: { fontSize: 17, fontWeight: "700", color: colors.text, textAlign: "center" },
    stateText: { fontSize: 14, color: colors.muted, textAlign: "center" },
    stateButton: { marginTop: 8, paddingHorizontal: 22, paddingVertical: 12, borderRadius: 10, backgroundColor: colors.red },
    stateButtonText: { color: "#fff", fontSize: 14, fontWeight: "700" },
});
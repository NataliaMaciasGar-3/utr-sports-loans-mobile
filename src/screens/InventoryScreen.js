import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import {
    View, Text, FlatList, TextInput, ScrollView, Pressable, Switch,
    ActivityIndicator, RefreshControl, StyleSheet,
} from "react-native";
import { useFocusEffect } from "@react-navigation/native";
import { Ionicons } from "@expo/vector-icons";
import ScreenLayout from "../components/ScreenLayout";
import ItemCard from "../components/ItemCard";
import { getItems, getSports } from "../services/itemsService";
import { colors } from "../utils/theme";

export default function InventoryScreen({ navigation }) {
    const [items, setItems] = useState([]);
    const [sports, setSports] = useState([]);
    const [sport, setSport] = useState("Todos");
    const [onlyAvailable, setOnlyAvailable] = useState(false);
    const [search, setSearch] = useState("");
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);
    const [error, setError] = useState("");

    const requestId = useRef(0); // evita que una respuesta vieja pise a una más reciente

    // Disciplinas para los chips (una sola vez al montar)
    useEffect(() => {
        getSports().then(setSports).catch(() => setSports([]));
    }, []);

    const loadItems = useCallback(
        async ({ pull = false } = {}) => {
            const id = ++requestId.current;
            if (!pull) setLoading(true);
            setError("");
            try {
                const data = await getItems({
                    deporte: sport === "Todos" ? undefined : sport,
                    disponible: onlyAvailable ? "true" : undefined,
                });
                if (id === requestId.current) setItems(data);
            } catch (err) {
                if (id === requestId.current) setError(err.message);
            } finally {
                if (id === requestId.current) {
                    setLoading(false);
                    setRefreshing(false);
                }
            }
        },
        [sport, onlyAvailable]
    );

    // Carga al entrar a la pantalla y cada vez que cambian los filtros.
    // También refresca el stock al volver de solicitar un préstamo.
    useFocusEffect(
        useCallback(() => {
            loadItems();
        }, [loadItems])
    );

    const handleSelectSport = (name) => setSport(name);
    const handleToggleAvailable = (value) => setOnlyAvailable(value);
    const handleSearchChange = (text) => setSearch(text);
    const handleRetry = () => loadItems();
    const handleRefresh = () => {
        setRefreshing(true);
        loadItems({ pull: true });
    };
    const handleClearFilters = () => {
        setSport("Todos");
        setOnlyAvailable(false);
        setSearch("");
    };
    const handleRequest = (item) => navigation.navigate("LoanRequest", { item });

    const visibleItems = useMemo(() => {
        const term = search.trim().toLowerCase();
        return items.filter(
            (i) => i.codigo.toLowerCase().includes(term) || i.nombre.toLowerCase().includes(term)
        );
    }, [items, search]);

    const header = (
        <View style={styles.header}>
            <Text style={styles.title}>Inventario de Material Deportivo</Text>
            <Text style={styles.subtitle}>Consulta el equipo disponible y solicita tu vale de préstamo.</Text>

            <View style={styles.searchBox}>
                <Ionicons name="search-outline" size={20} color={colors.muted} />
                <TextInput
                    style={styles.searchInput}
                    placeholder="Buscar por código o nombre..."
                    placeholderTextColor="#9ca3af"
                    value={search}
                    onChangeText={handleSearchChange}
                    autoCapitalize="none"
                    autoCorrect={false}
                    returnKeyType="search"
                />
                {search.length > 0 && (
                    <Pressable onPress={() => setSearch("")} hitSlop={10} accessibilityLabel="Borrar búsqueda">
                        <Ionicons name="close-circle" size={20} color={colors.muted} />
                    </Pressable>
                )}
            </View>

            <ScrollView
                horizontal
                showsHorizontalScrollIndicator={false}
                contentContainerStyle={styles.chips}
                keyboardShouldPersistTaps="handled"
            >
                {["Todos", ...sports].map((name) => {
                    const active = sport === name;
                    return (
                        <Pressable
                            key={name}
                            style={[styles.chip, active && styles.chipActive]}
                            onPress={() => handleSelectSport(name)}
                        >
                            <Text style={[styles.chipText, active && styles.chipTextActive]}>{name}</Text>
                        </Pressable>
                    );
                })}
            </ScrollView>

            <View style={styles.countRow}>
                <Text style={styles.count}>
                    {loading ? "Cargando..." : `${visibleItems.length} ${visibleItems.length === 1 ? "artículo" : "artículos"} en inventario`}
                </Text>
                <View style={styles.switchRow}>
                    <Switch
                        value={onlyAvailable}
                        onValueChange={handleToggleAvailable}
                        trackColor={{ false: "#cbd5e1", true: colors.red }}
                        thumbColor="#fff"
                    />
                    <Text style={styles.switchLabel}>Solo disponibles</Text>
                </View>
            </View>
        </View>
    );

    const empty = loading ? (
        <View style={styles.state}>
            <ActivityIndicator size="large" color={colors.red} />
            <Text style={styles.stateText}>Cargando inventario...</Text>
        </View>
    ) : error ? (
        <View style={[styles.state, styles.stateError]}>
            <Ionicons name="cloud-offline-outline" size={36} color={colors.red} />
            <Text style={styles.stateTitle}>Error al cargar el inventario</Text>
            <Text style={styles.stateText}>{error}</Text>
            <Pressable style={styles.stateButton} onPress={handleRetry}>
                <Text style={styles.stateButtonText}>Reintentar</Text>
            </Pressable>
        </View>
    ) : (
        <View style={styles.state}>
            <Ionicons name="cube-outline" size={36} color={colors.muted} />
            <Text style={styles.stateTitle}>No hay material con estos filtros</Text>
            <Text style={styles.stateText}>Prueba con otra disciplina o desactiva "Solo disponibles".</Text>
            <Pressable style={[styles.stateButton, styles.stateButtonOutline]} onPress={handleClearFilters}>
                <Text style={[styles.stateButtonText, { color: colors.text }]}>Limpiar filtros</Text>
            </Pressable>
        </View>
    );

    return (
        <ScreenLayout>
            <FlatList
                data={loading || error ? [] : visibleItems}
                keyExtractor={(item) => String(item.id)}
                renderItem={({ item }) => <ItemCard item={item} onRequest={handleRequest} />}
                ListHeaderComponent={header}
                ListEmptyComponent={empty}
                ItemSeparatorComponent={() => <View style={{ height: 14 }} />}
                contentContainerStyle={styles.list}
                keyboardShouldPersistTaps="handled"
                refreshControl={
                    <RefreshControl refreshing={refreshing} onRefresh={handleRefresh} colors={[colors.red]} />
                }
            />
        </ScreenLayout>
    );
}

const styles = StyleSheet.create({
    list: { padding: 20, paddingBottom: 32 },
    header: { gap: 14, marginBottom: 16 },
    title: { fontSize: 28, fontWeight: "800", color: colors.text },
    subtitle: { fontSize: 14, color: colors.muted },

    searchBox: {
        flexDirection: "row", alignItems: "center", gap: 10,
        backgroundColor: "#fff", borderWidth: 1.5, borderColor: colors.red,
        borderRadius: 12, paddingHorizontal: 14,
    },
    searchInput: { flex: 1, paddingVertical: 12, fontSize: 15, fontWeight: "700", color: "#000" },

    chips: { gap: 8, paddingRight: 8 },
    chip: { paddingHorizontal: 16, paddingVertical: 9, borderRadius: 8, backgroundColor: "#eef2f7" },
    chipActive: { backgroundColor: colors.red },
    chipText: { fontSize: 13, fontWeight: "600", color: colors.text },
    chipTextActive: { color: "#fff" },

    countRow: { flexDirection: "row", justifyContent: "space-between", alignItems: "center" },
    count: { fontSize: 13, color: colors.muted },
    switchRow: { flexDirection: "row", alignItems: "center", gap: 6 },
    switchLabel: { fontSize: 13, fontWeight: "600", color: colors.text },

    state: {
        alignItems: "center", gap: 8, padding: 32,
        backgroundColor: "#fff", borderRadius: 16, borderWidth: 1, borderColor: colors.border,
    },
    stateError: { borderColor: "#f5b5c0" },
    stateTitle: { fontSize: 17, fontWeight: "700", color: colors.text, textAlign: "center" },
    stateText: { fontSize: 14, color: colors.muted, textAlign: "center" },
    stateButton: {
        marginTop: 8, paddingHorizontal: 22, paddingVertical: 12,
        borderRadius: 10, backgroundColor: colors.red,
    },
    stateButtonOutline: { backgroundColor: "#fff", borderWidth: 1, borderColor: "#cbd5e1" },
    stateButtonText: { color: "#fff", fontSize: 14, fontWeight: "700" },
});
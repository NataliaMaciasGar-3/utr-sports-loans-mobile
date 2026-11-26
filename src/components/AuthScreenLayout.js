import { createContext, useCallback, useEffect, useRef, useState } from "react";
import {
    View, Text, Image, ScrollView, Keyboard, TextInput, Dimensions, StyleSheet,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { colors } from "../utils/theme";

// Los campos usan esto para pedir que se les haga visibles al enfocarse
export const EnsureVisibleContext = createContext(() => { });

export default function AuthScreenLayout({ title, subtitle, children }) {
    const scrollRef = useRef(null);
    const scrollY = useRef(0);
    const keyboardTop = useRef(null); // posición donde empieza el teclado
    const [keyboardHeight, setKeyboardHeight] = useState(0);

    // Si el campo enfocado queda debajo del teclado, hace scroll lo justo
    const ensureVisible = useCallback(() => {
        const input = TextInput.State.currentlyFocusedInput?.();
        if (!input || keyboardTop.current == null) return;

        input.measureInWindow((x, y, w, h) => {
            const overflow = y + h + 32 - keyboardTop.current;
            if (overflow > 0) {
                scrollRef.current?.scrollTo({ y: scrollY.current + overflow, animated: true });
            }
        });
    }, []);

    useEffect(() => {
        const showSub = Keyboard.addListener("keyboardDidShow", (e) => {
            const { height, screenY } = e.endCoordinates;
            keyboardTop.current = screenY ?? Dimensions.get("screen").height - height;
            setKeyboardHeight(height);
            setTimeout(ensureVisible, 80); // espera a que se agregue el espacio inferior
        });
        const hideSub = Keyboard.addListener("keyboardDidHide", () => {
            keyboardTop.current = null;
            setKeyboardHeight(0);
        });
        return () => {
            showSub.remove();
            hideSub.remove();
        };
    }, [ensureVisible]);

    // Al cambiar de un campo a otro con el teclado ya abierto
    const handleFieldFocus = useCallback(() => setTimeout(ensureVisible, 120), [ensureVisible]);

    const handleScroll = (e) => {
        scrollY.current = e.nativeEvent.contentOffset.y;
    };

    return (
        <EnsureVisibleContext.Provider value={handleFieldFocus}>
            <ScrollView
                ref={scrollRef}
                style={styles.root}
                contentContainerStyle={[styles.scroll, { paddingBottom: keyboardHeight }]}
                keyboardShouldPersistTaps="handled"
                showsVerticalScrollIndicator={false}
                onScroll={handleScroll}
                scrollEventThrottle={16}
            >
                <View style={styles.hero}>
                    {/* Círculos decorativos */}
                    <View style={styles.circleBig} />
                    <View style={styles.circleSmall} />

                    <SafeAreaView edges={["top"]} style={styles.heroContent}>
                        <View style={styles.brand}>
                            <Image
                                source={require("../../assets/logo-sports.png")}
                                style={styles.logo}
                                resizeMode="contain"
                            />
                            <Text style={styles.brandText}>UTR Sports</Text>
                        </View>
                        <Text style={styles.tagline}>Tu próximo partido empieza aquí.</Text>
                    </SafeAreaView>
                </View>

                <View style={styles.form}>
                    <Text style={styles.title}>{title}</Text>
                    <View style={styles.subtitle}>{subtitle}</View>
                    <View style={styles.fields}>{children}</View>
                </View>
            </ScrollView>
        </EnsureVisibleContext.Provider>
    );
}

const styles = StyleSheet.create({
    root: { flex: 1, backgroundColor: "#fff" },
    scroll: { flexGrow: 1 },

    hero: { backgroundColor: colors.redDark, overflow: "hidden", minHeight: 210 },
    circleBig: {
        position: "absolute", width: 300, height: 300, borderRadius: 150,
        right: -120, top: -150, borderWidth: 26, borderColor: "#e11d48", opacity: 0.85,
    },
    circleSmall: {
        position: "absolute", width: 190, height: 190, borderRadius: 95,
        right: -60, top: -60, backgroundColor: colors.red, opacity: 0.55,
    },
    heroContent: { padding: 24, paddingTop: 36, gap: 28 },
    brand: { flexDirection: "row", alignItems: "center", gap: 12 },
    logo: { width: 76, height: 52, tintColor: "#fff" },
    brandText: { color: "#fff", fontSize: 32, fontWeight: "800" },
    tagline: { color: "#fde4e9", fontSize: 13 },

    form: { padding: 24, gap: 6 },
    title: { fontSize: 28, fontWeight: "800", color: colors.redDark },
    subtitle: { marginBottom: 14 },
    fields: { gap: 16 },
});
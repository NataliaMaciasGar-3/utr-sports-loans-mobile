import { View, Text, Image, ScrollView, KeyboardAvoidingView, Platform, StyleSheet } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { colors } from "../utils/theme";

export default function AuthScreenLayout({ title, subtitle, children }) {
    return (
        <KeyboardAvoidingView style={styles.root} behavior={Platform.OS === "ios" ? "padding" : undefined}>
            <ScrollView
                contentContainerStyle={styles.scroll}
                keyboardShouldPersistTaps="handled"
                showsVerticalScrollIndicator={false}
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
        </KeyboardAvoidingView>
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
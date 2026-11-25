import { useState } from "react";
import { View, Text, TextInput, Button } from "react-native";
import { useAuth } from "../context/AuthContext";

export default function LoginScreen() {
    const { login } = useAuth();
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [error, setError] = useState("");

    const handleSubmit = async () => {
        try {
            await login(email.trim(), password);
        } catch (e) {
            setError(e.message);
        }
    };

    return (
        <View style={{ flex: 1, justifyContent: "center", padding: 24, gap: 12 }}>
            <TextInput
                placeholder="Correo"
                value={email}
                onChangeText={setEmail}
                autoCapitalize="none"
                keyboardType="email-address"
                style={{ borderWidth: 1, padding: 10 }}
            />
            <TextInput
                placeholder="Contraseña"
                value={password}
                onChangeText={setPassword}
                secureTextEntry
                style={{ borderWidth: 1, padding: 10 }}
            />
            {error ? <Text>{error}</Text> : null}
            <Button title="Iniciar sesión" onPress={handleSubmit} />
        </View>
    );
}
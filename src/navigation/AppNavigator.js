import { ActivityIndicator, View } from "react-native";
import { NavigationContainer } from "@react-navigation/native";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import { Ionicons } from "@expo/vector-icons";
import { useAuth } from "../context/AuthContext";
import { navigationRef } from "./navigationRef";
import { colors } from "../utils/theme";

import LoginScreen from "../screens/LoginScreen";
import RegisterScreen from "../screens/RegisterScreen";
import InventoryScreen from "../screens/InventoryScreen";
import LoanRequestScreen from "../screens/LoanRequestScreen";
import LoansScreen from "../screens/LoansScreen";
import AdminScreen from "../screens/AdminScreen";
import ForbiddenScreen from "../screens/ForbiddenScreen";
import NotFoundScreen from "../screens/NotFoundScreen";

const Stack = createNativeStackNavigator();
const Tab = createBottomTabNavigator();

const TAB_ICONS = {
    Inventory: "grid-outline",
    Loans: "clipboard-outline",
    Admin: "settings-outline",
};

function MainTabs() {
    const { isAdmin } = useAuth();

    return (
        <Tab.Navigator
            screenOptions={({ route }) => ({
                headerShown: false,
                tabBarActiveTintColor: colors.red,
                tabBarInactiveTintColor: colors.muted,
                tabBarLabelStyle: { fontSize: 12, fontWeight: "600" },
                tabBarStyle: { backgroundColor: "#fff", borderTopColor: colors.border },
                tabBarIcon: ({ color, size }) => (
                    <Ionicons name={TAB_ICONS[route.name]} size={size} color={color} />
                ),
            })}
        >
            <Tab.Screen name="Inventory" component={InventoryScreen} options={{ title: "Inventario" }} />
            <Tab.Screen name="Loans" component={LoansScreen} options={{ title: "Mis préstamos" }} />
            {isAdmin && (
                <Tab.Screen name="Admin" component={AdminScreen} options={{ title: "Admin" }} />
            )}
        </Tab.Navigator>
    );
}

export default function AppNavigator() {
    const { user, loading } = useAuth();

    if (loading) {
        return (
            <View style={{ flex: 1, alignItems: "center", justifyContent: "center" }}>
                <ActivityIndicator size="large" color={colors.red} />
            </View>
        );
    }

    // Si algo navega a una pantalla que no existe, se muestra NotFound
    const handleUnhandledAction = () => {
        const routeNames = navigationRef.getRootState()?.routeNames ?? [];
        if (navigationRef.isReady() && routeNames.includes("NotFound")) {
            navigationRef.navigate("NotFound");
        }
    };

    return (
        <NavigationContainer ref={navigationRef} onUnhandledAction={handleUnhandledAction}>
            <Stack.Navigator screenOptions={{ headerShown: false }}>
                {!user ? (
                    <>
                        <Stack.Screen name="Login" component={LoginScreen} />
                        <Stack.Screen name="Register" component={RegisterScreen} />
                        <Stack.Screen name="NotFound" component={NotFoundScreen} />
                    </>
                ) : (
                    <>
                        <Stack.Screen name="MainTabs" component={MainTabs} />
                        <Stack.Screen name="LoanRequest" component={LoanRequestScreen} />
                        <Stack.Screen name="Forbidden" component={ForbiddenScreen} />
                        <Stack.Screen name="NotFound" component={NotFoundScreen} />
                    </>
                )}
            </Stack.Navigator>
        </NavigationContainer>
    );
}
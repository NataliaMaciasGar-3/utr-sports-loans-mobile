import { ActivityIndicator, View } from "react-native";
import { NavigationContainer } from "@react-navigation/native";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
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

const Stack = createNativeStackNavigator();

export default function AppNavigator() {
    const { user, loading, isAdmin } = useAuth();

    if (loading) {
        return (
            <View style={{ flex: 1, alignItems: "center", justifyContent: "center" }}>
                <ActivityIndicator size="large" color={colors.red} />
            </View>
        );
    }

    return (
        <NavigationContainer ref={navigationRef}>
            <Stack.Navigator screenOptions={{ headerShown: false }}>
                {!user ? (
                    <>
                        <Stack.Screen name="Login" component={LoginScreen} />
                        <Stack.Screen name="Register" component={RegisterScreen} />
                    </>
                ) : (
                    <>
                        <Stack.Screen name="Inventory" component={InventoryScreen} />
                        <Stack.Screen name="LoanRequest" component={LoanRequestScreen} />
                        <Stack.Screen name="Loans" component={LoansScreen} />
                        {isAdmin && <Stack.Screen name="Admin" component={AdminScreen} />}
                        <Stack.Screen name="Forbidden" component={ForbiddenScreen} />
                    </>
                )}
            </Stack.Navigator>
        </NavigationContainer>
    );
}
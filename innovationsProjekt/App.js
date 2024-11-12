// Import necessary modules
import React from "react";
import { StatusBar } from "expo-status-bar";
import { NavigationContainer } from "@react-navigation/native";
import { createStackNavigator } from "@react-navigation/stack";

// Import screens
import LoginCreatePage from "./components/loginCreatePage";
import Dashboard from "./components/dashBoard"; // Sørg for, at Dashboard-komponenten eksisterer

const Stack = createStackNavigator();

export default function App() {
  return (
    <NavigationContainer>
      <Stack.Navigator initialRouteName="LoginCreatePage">
        <Stack.Screen 
          name="LoginCreatePage" 
          component={LoginCreatePage} 
          options={{ title: "Login / Create Account" }}
        />
        <Stack.Screen 
          name="Dashboard" 
          component={Dashboard} 
          options={{ title: "Dashboard" }}
        />
      </Stack.Navigator>
      <StatusBar style="auto" />
    </NavigationContainer>
  );
}

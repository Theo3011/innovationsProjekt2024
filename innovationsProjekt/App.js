// Import nødvendige moduler
import React from "react";
import { StatusBar } from "expo-status-bar";
import { NavigationContainer } from "@react-navigation/native";
import { createStackNavigator } from "@react-navigation/stack";
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import { Ionicons } from "@expo/vector-icons";

// Import af skærme
import LoginCreatePage from "./components/loginCreatePage";
import DashBoard from "./components/dashBoard";
import ChatPage from "./components/chatPage";
import Settings from "./components/settings";
import CreateOfferPage from "./components/createOfferPage";

// Initialiser navigatører
const Stack = createStackNavigator();
const Tab = createBottomTabNavigator();

// AppTabs komponenten for bundenavigation
function AppTabs() {
  return (
    <Tab.Navigator
      initialRouteName="Home"
      screenOptions={({ route }) => ({
        tabBarIcon: ({ color, size }) => {
          let iconName;
          if (route.name === "Home") {
            iconName = "home";
          } else if (route.name === "Min profil") {
            iconName = "person";
          } else if (route.name === "Chat") {
            iconName = "chatbubble";
          } else if (route.name === "Indstillinger") {
            iconName = "settings";
          }
          return <Ionicons name={iconName} size={size} color={color} />;
        },
      })}
    >
      <Tab.Screen name="Home" component={DashBoard} />
      <Tab.Screen name="Min profil" component={CreateOfferPage} />
      <Tab.Screen name="Chat" component={ChatPage} />
      <Tab.Screen name="Indstillinger" component={Settings} />
    </Tab.Navigator>
  );
}

// App komponenten med stack navigation
export default function App() {
  return (
    <NavigationContainer>
      <Stack.Navigator initialRouteName="LoginCreatePage">
        <Stack.Screen
          name="LoginCreatePage"
          component={LoginCreatePage}
          options={{ title: "Login / Create Account" }}
        />
        {/* AppTabs skal være en Screen i stack navigation */}
        <Stack.Screen
          name="Dashboard"
          component={AppTabs}
          options={{ title: "Dashboard" }}
        />
      </Stack.Navigator>
      <StatusBar style="auto" />
    </NavigationContainer>
  );
}

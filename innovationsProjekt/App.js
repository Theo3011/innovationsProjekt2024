// Import necessary modules
import React from "react";
import { StatusBar } from "expo-status-bar";
import { NavigationContainer } from "@react-navigation/native";
import { createStackNavigator } from "@react-navigation/stack";
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import { Ionicons } from "@expo/vector-icons"; // You can use Ionicons for tab icons

// Import screens based on your file structure
import LoginCreatePage from "./components/loginCreatePage";
import DashBoard from "./components/dashBoard"; // The dashboard component
import ChatPage from "./components/chatPage"; // Chat screen
import Settings from "./components/settings"; // Settings screen
import OfferPage from "./components/offerPage"; // Offer page screen
import CreateOfferPage from "./components/createOfferPage"; // Create offer page screen

// Initialize navigators
const Stack = createStackNavigator();
const Tab = createBottomTabNavigator();

function AppTabs() {
  return (
    <Tab.Navigator
      initialRouteName="Home" // Set Dashboard as the initial screen in tab navigation
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
      <Tab.Screen name="Home" component={DashBoard} />{" "}
      {/* Use Dashboard as the Home screen */}
      <Tab.Screen name="Min profil" component={CreateOfferPage} />
      <Tab.Screen name="Chat" component={ChatPage} />
      <Tab.Screen name="Indstillinger" component={Settings} />
    </Tab.Navigator>
  );
}

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
          component={AppTabs} // Use the Tab Navigator (AppTabs) as the Dashboard screen
          options={{ title: "Dashboard" }}
        />
      </Stack.Navigator>
      <StatusBar style="auto" />
    </NavigationContainer>
  );
}

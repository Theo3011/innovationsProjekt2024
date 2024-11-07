// Importer nødvendige moduler
import React from "react";
import { StatusBar } from "expo-status-bar";
import { getApps, initializeApp } from "firebase/app";
import { createStackNavigator } from "@react-navigation/stack";
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import { NavigationContainer } from "@react-navigation/native";
import Ionicons from "@expo/vector-icons/Ionicons";

// Importer skærme (fra den nye filstruktur)
import DashBoard from "./components/dashBoard";
import OfferPage from "./components/offerPage";
import ChatPage from "./components/chatPage";
import LoginCreatePage from "./components/loginCreatePage";
import CreateOfferPage from ".components/createOfferPage";
import Settings from "./components/settings";

// Opret Tab Navigator
const Tab = createBottomTabNavigator();

export default function App() {
  return (
    <NavigationContainer>
      <StatusBar style="auto" />
      <Tab.Navigator>
        {/* Settings tab */}
        <Tab.Screen
          name="Settings"
          component={Settings}
          options={{
            tabBarIcon: () => <Ionicons name="settings" size={20} />,
            headerShown: false,
          }}
        />

        {/* Dashboard tab */}
        <Tab.Screen
          name="Dashboard"
          component={DashBoard}
          options={{
            tabBarIcon: () => <Ionicons name="analytics" size={20} />,
            headerShown: false,
          }}
        />

        {/* Chat tab */}
        <Tab.Screen
          name="Chat"
          component={ChatPage}
          options={{
            tabBarIcon: () => <Ionicons name="chatbubbles" size={20} />,
            headerShown: false,
          }}
        />

        {/* Profile tab */}
        <Tab.Screen
          name="Profile"
          component={Profile}
          options={{
            tabBarIcon: () => <Ionicons name="person" size={20} />,
            headerShown: false,
          }}
        />
      </Tab.Navigator>
    </NavigationContainer>
  );
}

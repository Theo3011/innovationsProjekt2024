// Importer nødvendige moduler
import React from "react";
import { StatusBar } from "expo-status-bar";
import { getApps, initializeApp } from "firebase/app";
import { createStackNavigator } from "@react-navigation/stack";
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import { NavigationContainer } from "@react-navigation/native";
import Ionicons from "@expo/vector-icons/Ionicons";

// Importer skærme (fra den nye filstruktur)
import CreatePage from "./innovationsProjekt/components/createPage"; // Oprindeligt "MainPage"
import OfferPage from "./innovationsProjekt/components/offerPage"; // Ny skærm (hvis eksisterer)
import ChatPage from "./innovationsProjekt/components/chatPage"; // Oprindeligt i din struktur
import FilterPage from "./innovationsProjekt/components/filterPage"; // Ny skærm (hvis eksisterer)

// Firebase-konfiguration
const firebaseConfig = {
  apiKey: "AIzaSyCLRbQdp6oSPbiceBcR1JlrYQmIBGb52_0",
  authDomain: "inno-95b61.firebaseapp.com",
  projectId: "inno-95b61",
  storageBucket: "inno-95b61.appspot.com",
  messagingSenderId: "1043791623724",
  appId: "1:1043791623724:web:fb40e9d8ceb06df9abc389",
  databaseURL:
    "https://inno-95b61-default-rtdb.europe-west1.firebasedatabase.app/",
};

// Initialiser Firebase, hvis det ikke allerede kører
if (getApps().length < 1) {
  initializeApp(firebaseConfig);
  console.log("Firebase On!");
}

// Stack Navigator til at håndtere navigation mellem skærme
const Stack = createStackNavigator();
const StackNavigation = () => {
  return (
    <Stack.Navigator initialRouteName="CreatePage">
      <Stack.Screen
        name="CreatePage"
        component={CreatePage}
        options={{ headerShown: false }}
      />
      <Stack.Screen
        name="OfferPage"
        component={OfferPage}
        options={{ headerShown: false }}
      />
      <Stack.Screen
        name="ChatPage"
        component={ChatPage}
        options={{ headerShown: false }}
      />
      <Stack.Screen
        name="FilterPage"
        component={FilterPage}
        options={{ headerShown: true }}
      />
    </Stack.Navigator>
  );
};

// Tab Navigator
const Tab = createBottomTabNavigator();

export default function App() {
  return (
    <NavigationContainer>
      <StatusBar style="auto" />
      <Tab.Navigator>
        <Tab.Screen
          name="Tilgængelig Tider"
          component={StackNavigation}
          options={{
            tabBarIcon: () => <Ionicons name="home" size={20} />,
            headerShown: false,
          }}
        />
        <Tab.Screen
          name="Tilføj Opslag"
          component={CreatePage}
          options={{
            tabBarIcon: () => <Ionicons name="add" size={20} />,
            headerShown: false,
          }}
        />
        <Tab.Screen
          name="Chat"
          component={ChatPage}
          options={{
            tabBarIcon: () => <Ionicons name="chatbubbles" size={20} />,
            headerShown: false,
          }}
        />
      </Tab.Navigator>
    </NavigationContainer>
  );
}

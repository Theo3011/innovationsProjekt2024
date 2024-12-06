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
import ProfilePage from "./components/profilePage";
import OfferPage from "./components/offerPage";
import PrivateChat from "./components/privateChat";
import viewOffer from "./components/viewOffer";
import BookSession from "./components/bookSession";

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
      <Tab.Screen
        name="Home"
        component={DashBoard}
        options={{ headerShown: false }}
      />
      <Tab.Screen
        name="Min profil"
        component={ProfilePage}
        options={{ headerShown: false }}
      />
      <Tab.Screen
        name="Chat"
        component={ChatPage}
        options={{ headerShown: false }}
      />
      <Tab.Screen
        name="Indstillinger"
        component={Settings}
        options={{ headerShown: false }}
      />
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
        <Stack.Screen
          name="MainApp" // Hovednavigering med bundnavigation
          component={AppTabs}
          options={{ title: "TutorMatch" }}
        />
        <Stack.Screen
          name="OfferPage" // Tilføj opslag som en stack-skærm
          component={OfferPage}
          options={{ title: "Tilføj opslag" }}
        />
        <Stack.Screen
          name="PrivateChat"
          component={PrivateChat}
          options={{ title: "Private Chat" }}
        />
        <Stack.Screen
          name="InfoToViewOffer"
          component={viewOffer}
          options={{ title: "Vis opslag" }}
        />
        <Stack.Screen
          name="BookSession"
          component={BookSession}
          options={{ title: "Book Session" }}
        />
      </Stack.Navigator>
      <StatusBar style="auto" />
    </NavigationContainer>
  );
}

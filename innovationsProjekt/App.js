// Import af moduler
import React from "react";
import { StatusBar } from "expo-status-bar";
import { NavigationContainer } from "@react-navigation/native";
import { createStackNavigator } from "@react-navigation/stack";
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import { Ionicons } from "@expo/vector-icons";

// import af hver screen fra mappen screens
import LoginCreatePage from "./screens/loginCreatePage";
import DashBoard from "./screens/dashBoard";
import ChatPage from "./screens/chatPage";
import Settings from "./screens/settings";
import ProfilePage from "./screens/profilePage";
import OfferPage from "./screens/offerPage";
import PrivateChat from "./screens/privateChat";
import viewOffer from "./screens/viewOffer";
import BookSession from "./screens/bookSession";

// definering af stack of tab
const Stack = createStackNavigator();
const Tab = createBottomTabNavigator();

// tabnavigator - og deres værdier
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

// stack navigator - som har en start route (loginCreatePage), dermed så starter brugeren altid på login-siden
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
          name="OfferPage" 
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

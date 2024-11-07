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



export default function App() {
  return (
    <NavigationContainer>
      <Stack.Navigator initialRouteName="Home">
        <Stack.Screen name="Home" component={HomeScreen} />
        <Stack.Screen name="TutorSignUp" component={TutorSignUp} />
        <Stack.Screen name="StudentSearch" component={StudentSearch} />
        <Stack.Screen name="CameraTest" component={CameraTest} />
        <Stack.Screen name="ImageScreen" component={ImageScreen} />
        <Stack.Screen name="TutorProfile" component={TutorProfile} />
        <Stack.Screen name="TutorDetails" component={TutorDetails} />
        <Stack.Screen name="Settings" component={Settings} />
      </Stack.Navigator>
    </NavigationContainer>
  );
}

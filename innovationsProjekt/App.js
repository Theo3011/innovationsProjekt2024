// Import necessary modules
import React from "react";
import { StatusBar } from "expo-status-bar";
import { NavigationContainer } from "@react-navigation/native";
import { createStackNavigator } from "@react-navigation/stack";

// Import screens
// import DashBoard from "./components/dashBoard";
// import OfferPage from "./components/offerPage";
// import ChatPage from "./components/chatPage";
import LoginCreatePage from "./components/loginCreatePage";
// import CreateOfferPage from "./components/createOfferPage";
// import Settings from "./components/settings";

const Stack = createStackNavigator();

export default function App() {
  return (
    <NavigationContainer>
      <Stack.Navigator initialRouteName="loginCreatePage">
        <Stack.Screen name="loginCreatePage" component={LoginCreatePage} />
      </Stack.Navigator>
    </NavigationContainer>
  );
}

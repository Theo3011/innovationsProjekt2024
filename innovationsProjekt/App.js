// Importer nødvendige moduler
import React from "react";
import { StatusBar } from "expo-status-bar";
import { getApps, initializeApp } from "firebase/app";
import { createStackNavigator } from "@react-navigation/stack";
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import { NavigationContainer } from "@react-navigation/native";
import Ionicons from "@expo/vector-icons/Ionicons";
import Settings from "./components/settings";

// Importer skærme (fra den nye filstruktur)
import DashBoard from "./components/dashBoard";
import OfferPage from "./components/offerPage";
import ChatPage from "./components/chatPage";
import LoginCreatePage from "./components/loginCreatePage";
import CreatePage from ".components/createpage";
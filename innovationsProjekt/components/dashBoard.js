import React, { useState } from "react";
import {
  Text,
  View,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
} from "react-native";
import { Ionicons } from "@expo/vector-icons"; // Import Ionicons for ikonet
import { useNavigation } from "@react-navigation/native";

const Dashboard = () => {
  const [selectedTab, setSelectedTab] = useState("Tutor"); // State til at holde styr på valgt overskrift

  const navigation = useNavigation();
  return (
    <View style={styles.container}>
      {/* To trykbare overskrifter */}
      <View style={styles.tabs}>
        <TouchableOpacity
          style={styles.tab}
          onPress={() => setSelectedTab("Tutor")}
        >
          <Text
            style={[
              styles.tabText,
              selectedTab === "Tutor" && styles.tabTextSelected,
            ]}
          >
            Tutor
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.tab}
          onPress={() => setSelectedTab("Studerende")}
        >
          <Text
            style={[
              styles.tabText,
              selectedTab === "Studerende" && styles.tabTextSelected,
            ]}
          >
            Studerende
          </Text>
        </TouchableOpacity>
      </View>

      {/* Liste over opslag */}
      <ScrollView style={styles.list}>
        {[1, 2, 3].map((item, index) => (
          <View key={index} style={styles.card}>
            <View style={styles.profileImage}></View>
            <View style={styles.cardContent}>
              <Text>Name: "String"</Text>
              <Text>Eksamen: "String"</Text>
              <Text>Pris/time: DKK</Text>
              <Text>Undervisningstype: (Gruppe-Individuel)</Text>
              <TouchableOpacity style={styles.button}>
                <Text style={styles.buttonText}>Vis opslag</Text>
              </TouchableOpacity>
            </View>
          </View>
        ))}
      </ScrollView>

      {/* Tilføj opslag knap */}
      <TouchableOpacity
        style={styles.addButton}
        onPress={() => navigation.navigate("Tilføj opslag")}
      >
        <Ionicons name="add-circle" size={24} color="white" />
        <Text style={styles.addButtonText}>Tilføj opslag</Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#fff" },
  header: { fontSize: 20, fontWeight: "bold", margin: 10, textAlign: "center" },
  tabs: { flexDirection: "row", justifyContent: "center", marginBottom: 10 },
  tab: { marginHorizontal: 10 },
  tabText: { fontSize: 16, fontWeight: "normal", color: "black" },
  tabTextSelected: { fontWeight: "bold", color: "blue" }, // Gør valgt tekst fed og blå
  list: { flex: 1, paddingHorizontal: 10 },
  card: {
    flexDirection: "row",
    backgroundColor: "#f9f9f9",
    marginVertical: 10,
    padding: 10,
    borderRadius: 8,
    elevation: 3,
  },
  profileImage: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: "#ddd",
    marginRight: 10,
  },
  cardContent: { flex: 1 },
  button: {
    marginTop: 10,
    padding: 10,
    backgroundColor: "#007bff",
    borderRadius: 5,
  },
  buttonText: { color: "#fff", textAlign: "center" },

  // Tilføj opslag knap styling
  addButton: {
    position: "absolute",
    bottom: 20, // Placeret 20 pixels over bunden
    right: 20, // Placeret 20 pixels fra højre kant
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#007bff",
    paddingVertical: 10,
    paddingHorizontal: 15,
    borderRadius: 25,
    elevation: 5, // Gør knappen lidt "hævet"
  },
  addButtonText: {
    color: "white",
    fontSize: 16,
    fontWeight: "bold",
    marginLeft: 10, // Lidt afstand mellem ikonet og teksten
  },
});

export default Dashboard;

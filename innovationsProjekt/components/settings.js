import React, { useState } from "react";
import { View, Text, Switch, StyleSheet, TouchableOpacity } from "react-native";
import { useNavigation } from "@react-navigation/native";

export default function Settings() {
  const [notificationsEnabled, setNotificationsEnabled] = useState(false);

  // Hent navigation-objektet
  const navigation = useNavigation();

  const handleLogout = () => {
    // Naviger brugeren tilbage til login-siden
    navigation.replace("LoginCreatePage");
  };

  return (
    <View style={styles.container}>
      <Text style={styles.header}>Indstillinger</Text>

      {/* Notifikation indstilling */}
      <View style={styles.setting}>
        <Text style={styles.settingText}>Notifikationer</Text>
        <Switch
          value={notificationsEnabled}
          onValueChange={(value) => setNotificationsEnabled(value)}
        />
      </View>

      {/* Placeholder for Mørkt tema */}
      <View style={styles.setting}>
        <Text style={styles.settingText}>Mørkt tema (kommer snart)</Text>
      </View>

      {/* Log ud-knap */}
      <TouchableOpacity style={styles.logoutButton} onPress={handleLogout}>
        <Text style={styles.logoutButtonText}>Log ud</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    backgroundColor: "#f0f8ff",
  },
  header: {
    fontSize: 24,
    fontWeight: "bold",
    marginBottom: 20,
    textAlign: "center",
  },
  setting: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: 15,
    borderBottomWidth: 1,
    borderColor: "#ccc",
  },
  settingText: {
    fontSize: 18,
  },
  logoutButton: {
    marginTop: 30,
    padding: 15,
    borderRadius: 8,
    alignItems: "center",
  },
  logoutButtonText: {
    fontSize: 18,
    fontWeight: "bold",
  },
});

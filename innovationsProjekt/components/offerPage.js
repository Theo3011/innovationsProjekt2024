// TestPage.js
import React from "react";
import { View, Text, StyleSheet } from "react-native";

const TestPage = () => {
  return (
    <View style={styles.container}>
      <Text style={styles.text}>Dette er en testside!</Text>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#f0f8ff",
  },
  text: {
    fontSize: 20,
    fontWeight: "bold",
  },
});

export default TestPage;

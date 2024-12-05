import React, { useState } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
  SafeAreaView,
  Keyboard,
  Alert,
} from "react-native";
import { Dropdown } from "react-native-element-dropdown"; // Dropdown komponent
import AntDesign from "@expo/vector-icons/AntDesign"; // Ikoner
import { db, firebaseAuth } from "../firebase"; // Importer Firebase config
import { ref, push } from "firebase/database"; // For at gemme data i databasen

const OfferPage = () => {
  const [university, setUniversity] = useState("");
  const [studyLine, setStudyLine] = useState("");
  const [price, setPrice] = useState("");
  const [description, setDescription] = useState("");
  const [selectedType, setSelectedType] = useState(null);

  // Dropdown data
  const universityData = [
    { label: "Universitet 1", value: "uni1" },
    { label: "Universitet 2", value: "uni2" },
  ];

  const studyLineData = [
    { label: "Studie-linje 1", value: "line1" },
    { label: "Studie-linje 2", value: "line2" },
  ];

  const priceData = [
    { label: "100 kr/t", value: "100" },
    { label: "200 kr/t", value: "200" },
    { label: "300 kr/t", value: "300" },
  ];

  // Håndter valg af undervisningstype
  const handleSelection = (type) => {
    setSelectedType(type);
  };

  // Funktion til at gemme opslag i Firebase
  const saveOfferToDatabase = async () => {
    if (!selectedType || !university || !studyLine || !price || !description) {
      Alert.alert("Fejl", "Udfyld venligst alle felterne!");
      return;
    }

    try {
      // Hent nuværende bruger-ID
      const currentUser = firebaseAuth.currentUser;
      if (!currentUser) {
        Alert.alert(
          "Fejl",
          "Du skal være logget ind for at oprette et opslag!"
        );
        return;
      }

      const userId = currentUser.uid;

      // Strukturér dataene til databasen
      const offerData = {
        type: selectedType, // gruppe/individuel
        university: university,
        studyLine: studyLine,
        price: price,
        description: description,
        createdBy: userId, // Hvem der har oprettet opslaget
        timestamp: Date.now(), // Tidsstempel
      };

      // Gem data i Firebase Realtime Database
      const offerRef = ref(db, "offers");
      await push(offerRef, offerData); // Push laver en unik nøgle til hvert opslag

      Alert.alert("Succes", "Dit opslag er oprettet!");

      // Ryd felterne efter upload
      setSelectedType(null);
      setUniversity("");
      setStudyLine("");
      setPrice("");
      setDescription("");
    } catch (error) {
      Alert.alert("Fejl", "Noget gik galt: " + error.message);
    }
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <KeyboardAvoidingView
        style={styles.container}
        behavior={Platform.OS === "ios" ? "padding" : "height"}
      >
        <ScrollView
          style={styles.scrollView}
          keyboardShouldPersistTaps="handled"
        >
          <View style={styles.innerContainer}>
            {/* Header: Gruppe/Individuel */}
            <View style={styles.headerContainer}>
              <TouchableOpacity
                style={[
                  styles.headerButton,
                  selectedType === "gruppe" && styles.selectedButton,
                ]}
                onPress={() => handleSelection("gruppe")}
              >
                <Text
                  style={[
                    styles.headerText,
                    selectedType === "gruppe" && styles.selectedText,
                  ]}
                >
                  Gruppe
                </Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[
                  styles.headerButton,
                  selectedType === "individuel" && styles.selectedButton,
                ]}
                onPress={() => handleSelection("individuel")}
              >
                <Text
                  style={[
                    styles.headerText,
                    selectedType === "individuel" && styles.selectedText,
                  ]}
                >
                  Individuel
                </Text>
              </TouchableOpacity>
            </View>

            {/* Universitet dropdown */}
            <View style={styles.pickerContainer}>
              <Text style={styles.pickerLabel}>Vælg Universitet</Text>
              <Dropdown
                style={styles.dropdown}
                placeholderStyle={styles.placeholderStyle}
                selectedTextStyle={styles.selectedTextStyle}
                data={universityData}
                labelField="label"
                valueField="value"
                value={university}
                onChange={(item) => setUniversity(item.value)}
                renderLeftIcon={() => (
                  <AntDesign
                    style={styles.icon}
                    color="black"
                    name="Safety"
                    size={20}
                  />
                )}
              />
            </View>

            {/* Studie-linje dropdown */}
            <View style={styles.pickerContainer}>
              <Text style={styles.pickerLabel}>Vælg Studie-linje</Text>
              <Dropdown
                style={styles.dropdown}
                placeholderStyle={styles.placeholderStyle}
                selectedTextStyle={styles.selectedTextStyle}
                data={studyLineData}
                labelField="label"
                valueField="value"
                value={studyLine}
                onChange={(item) => setStudyLine(item.value)}
                renderLeftIcon={() => (
                  <AntDesign
                    style={styles.icon}
                    color="black"
                    name="Safety"
                    size={20}
                  />
                )}
              />
            </View>

            {/* Pris dropdown */}
            <View style={styles.pickerContainer}>
              <Text style={styles.pickerLabel}>Vælg Pris</Text>
              <Dropdown
                style={styles.dropdown}
                placeholderStyle={styles.placeholderStyle}
                selectedTextStyle={styles.selectedTextStyle}
                data={priceData}
                labelField="label"
                valueField="value"
                value={price}
                onChange={(item) => setPrice(item.value)}
                renderLeftIcon={() => (
                  <AntDesign
                    style={styles.icon}
                    color="black"
                    name="Safety"
                    size={20}
                  />
                )}
              />
            </View>

            {/* Beskrivelse */}
            <TextInput
              style={styles.textInput}
              placeholder="Beskrivelse"
              multiline
              numberOfLines={4}
              value={description}
              onChangeText={(text) => setDescription(text)}
            />

            {/* Opret opslag knap */}
            <TouchableOpacity
              style={styles.button}
              onPress={saveOfferToDatabase}
            >
              <Text style={styles.buttonText}>Opret opslag</Text>
            </TouchableOpacity>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: "#fff" },
  container: { flex: 1, padding: 20 },
  scrollView: { flex: 1 },
  innerContainer: { flex: 1 },
  headerContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 20,
  },
  headerButton: { paddingVertical: 10, paddingHorizontal: 20, borderRadius: 5 },
  headerText: { fontSize: 18, color: "#007bff" },
  selectedButton: { backgroundColor: "#007bff" },
  selectedText: { fontWeight: "bold", color: "#fff" },
  pickerContainer: {
    padding: 10,
    backgroundColor: "#f9f9f9",
    borderRadius: 5,
    marginBottom: 10,
  },
  pickerLabel: { fontSize: 16, color: "#007bff" },
  dropdown: {
    marginTop: 10,
    borderBottomColor: "gray",
    borderBottomWidth: 0.5,
    height: 50,
    padding: 10,
  },
  textInput: {
    height: 100,
    borderColor: "#ccc",
    borderWidth: 1,
    borderRadius: 5,
    marginBottom: 20,
    padding: 10,
  },
  button: {
    backgroundColor: "#007bff",
    paddingVertical: 12,
    borderRadius: 5,
    alignItems: "center",
  },
  buttonText: { color: "#fff", fontSize: 16, fontWeight: "bold" },
});

export default OfferPage;

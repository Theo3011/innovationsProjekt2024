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
  Alert,
} from "react-native";
import { Dropdown } from "react-native-element-dropdown"; // Dropdown komponent
import AntDesign from "@expo/vector-icons/AntDesign"; // Ikoner
import { db, firebaseAuth } from "../firebase"; // Importer Firebase config
import { ref, push } from "firebase/database"; // For at gemme data i databasen

const OfferPage = () => {
  const [university, setUniversity] = useState(""); // Valgte universitet
  const [studyLine, setStudyLine] = useState(""); // Valgte studielinje
  const [price, setPrice] = useState(""); // Valgte pris
  const [description, setDescription] = useState(""); // Beskrivelse
  const [selectedType, setSelectedType] = useState(null); // Undervisningstype (gruppe/individuel)

  // Universitetsdata
  const universityData = [
    { label: "Aarhus Universitet (AU)", value: "au" },
    { label: "Københavns Universitet (KU)", value: "ku" },
    { label: "Syddansk Universitet (SDU)", value: "sdu" },
    { label: "Aalborg Universitet (AAU)", value: "aau" },
    { label: "Roskilde Universitet (RUC)", value: "ruc" },
    { label: "Danmarks Tekniske Universitet (DTU)", value: "dtu" },
    { label: "IT-Universitetet i København (ITU)", value: "itu" },
    { label: "CBS - Copenhagen Business School", value: "cbs" },
  ];

  // Studielinjer til hvert universitet
  const studyLineData = {
    au: [
      { label: "Matematik", value: "math" },
      { label: "Datalogi", value: "cs" },
      { label: "Økonomi", value: "economics" },
    ],
    ku: [
      { label: "Jura", value: "law" },
      { label: "Medicin", value: "medicine" },
      { label: "Biologi", value: "biology" },
    ],
    sdu: [
      { label: "Erhvervsøkonomi", value: "business" },
      { label: "Ingeniørvidenskab", value: "engineering" },
    ],
    aau: [
      { label: "Elektronik og IT", value: "eit" },
      { label: "Arkitektur", value: "architecture" },
    ],
    ruc: [
      { label: "Socialvidenskab", value: "social" },
      { label: "Humaniora", value: "humanities" },
    ],
    dtu: [
      { label: "Bygningsingeniør", value: "civilEng" },
      { label: "Maskiningeniør", value: "mechEng" },
    ],
    itu: [
      { label: "Softwareudvikling", value: "software" },
      { label: "Digitale Medier", value: "digitalMedia" },
    ],
    cbs: [
      { label: "International Business", value: "intBusiness" },
      { label: "Finansiering", value: "finance" },
      { label: "Ha It.", value: "Ha It." },
    ],
  };

  // Priser
  const priceData = [
    { label: "150 kr/t", value: "150" },
    { label: "200 kr/t", value: "200" },
    { label: "250 kr/t", value: "250" },
    { label: "300 kr/t", value: "300" },
    { label: "350 kr/t", value: "350" },
  ];

  // Håndter valg af undervisningstype
  const handleSelection = (type) => {
    setSelectedType(type);
  };

  // Gem opslag i Firebase
  const saveOfferToDatabase = async () => {
    if (!selectedType || !university || !studyLine || !price || !description) {
      Alert.alert("Fejl", "Udfyld venligst alle felterne!");
      return;
    }

    try {
      const currentUser = firebaseAuth.currentUser;
      if (!currentUser) {
        Alert.alert(
          "Fejl",
          "Du skal være logget ind for at oprette et opslag!"
        );
        return;
      }

      const userId = currentUser.uid;

      const offerData = {
        type: selectedType,
        university,
        studyLine,
        price,
        description,
        createdBy: userId,
        timestamp: Date.now(),
      };

      const offerRef = ref(db, "offers");
      await push(offerRef, offerData);

      Alert.alert("Succes", "Dit opslag er oprettet!");

      // Ryd felterne
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
                onChange={(item) => {
                  setUniversity(item.value); // Opdater universitet
                  setStudyLine(""); // Nulstil studielinje
                }}
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
            {university && (
              <View style={styles.pickerContainer}>
                <Text style={styles.pickerLabel}>Vælg Studie-linje</Text>
                <Dropdown
                  style={styles.dropdown}
                  placeholderStyle={styles.placeholderStyle}
                  selectedTextStyle={styles.selectedTextStyle}
                  data={studyLineData[university] || []} // Dynamisk data
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
            )}

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
  // Samme styles som før
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

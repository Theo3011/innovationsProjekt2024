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
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { Dropdown } from "react-native-element-dropdown"; // Brug den nye dropdown-komponent
import AntDesign from "@expo/vector-icons/AntDesign"; // For at bruge et ikon som i den oprindelige kode
import Modal from "react-native-modal"; // Modal bibliotek

const OfferPage = () => {
  const [university, setUniversity] = useState("");
  const [studyLine, setStudyLine] = useState("");
  const [price, setPrice] = useState("");
  const [description, setDescription] = useState("");

  // State til at kontrollere, om modalen er synlig
  const [universityModalVisible, setUniversityModalVisible] = useState(false);
  const [studyLineModalVisible, setStudyLineModalVisible] = useState(false);
  const [priceModalVisible, setPriceModalVisible] = useState(false);

  // Data for dropdowns
  const universityData = [
    { label: "Universitet 1", value: "uni1" },
    { label: "Universitet 2", value: "uni2" },
  ];

  const studyLineData = [
    { label: "Studie-linje 1", value: "line1" },
    { label: "Studie-linje 2", value: "line2" },
  ];

  const priceData = [
    { label: "Pris 1", value: "price1" },
    { label: "Pris 2", value: "price2" },
  ];

  return (
    <SafeAreaView style={styles.safeArea}>
      <KeyboardAvoidingView
        style={styles.container}
        behavior={Platform.OS === "ios" ? "padding" : "height"}
      >
        <ScrollView
          style={styles.scrollView}
          keyboardShouldPersistTaps="handled" // Sikrer, at tastaturet forsvinder, når brugeren trykker udenfor inputfelterne
        >
          <View style={styles.innerContainer}>
            <View style={styles.headerContainer}>
              <Text style={styles.header}>Gruppeundervisning</Text>
              <Text style={styles.header}>Individuel undervisning</Text>
            </View>

            {/* Universitet dropdown */}
            <TouchableOpacity
              onPress={() => setUniversityModalVisible(true)} // Åben universitet modal
              style={styles.pickerContainer}
            >
              <Text style={styles.pickerLabel}>Vælg Universitet</Text>
              <Dropdown
                style={styles.dropdown}
                placeholderStyle={styles.placeholderStyle}
                selectedTextStyle={styles.selectedTextStyle}
                inputSearchStyle={styles.inputSearchStyle}
                iconStyle={styles.iconStyle}
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
            </TouchableOpacity>

            {/* Studie-linje dropdown */}
            <TouchableOpacity
              onPress={() => setStudyLineModalVisible(true)} // Åben studie-linje modal
              style={styles.pickerContainer}
            >
              <Text style={styles.pickerLabel}>Vælg Studie-linje</Text>
              <Dropdown
                style={styles.dropdown}
                placeholderStyle={styles.placeholderStyle}
                selectedTextStyle={styles.selectedTextStyle}
                inputSearchStyle={styles.inputSearchStyle}
                iconStyle={styles.iconStyle}
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
            </TouchableOpacity>

            {/* Pris dropdown */}
            <TouchableOpacity
              onPress={() => setPriceModalVisible(true)} // Åben pris modal
              style={styles.pickerContainer}
            >
              <Text style={styles.pickerLabel}>Vælg Pris</Text>
              <Dropdown
                style={styles.dropdown}
                placeholderStyle={styles.placeholderStyle}
                selectedTextStyle={styles.selectedTextStyle}
                inputSearchStyle={styles.inputSearchStyle}
                iconStyle={styles.iconStyle}
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
            </TouchableOpacity>

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
              onPress={() => console.log("Opret opslag")}
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
  safeArea: {
    flex: 1,
    backgroundColor: "#fff",
  },
  container: {
    flex: 1,
    padding: 20,
  },
  scrollView: {
    flex: 1,
  },
  innerContainer: {
    flex: 1,
  },
  headerContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 20,
  },
  header: {
    fontSize: 18,
    fontWeight: "bold",
    color: "black",
  },
  pickerContainer: {
    padding: 10,
    backgroundColor: "#f9f9f9",
    borderRadius: 5,
    marginBottom: 10,
    elevation: 2,
  },
  pickerLabel: {
    fontSize: 16,
    color: "#007bff",
  },
  dropdown: {
    marginTop: 10,
    borderBottomColor: "gray",
    borderBottomWidth: 0.5,
    height: 50,
    padding: 10,
  },
  icon: {
    marginRight: 5,
  },
  placeholderStyle: {
    fontSize: 16,
  },
  selectedTextStyle: {
    fontSize: 16,
  },
  inputSearchStyle: {
    height: 40,
    fontSize: 16,
  },
  iconStyle: {
    width: 20,
    height: 20,
  },
  textInput: {
    height: 100,
    borderColor: "#ccc",
    borderWidth: 1,
    borderRadius: 5,
    marginBottom: 20,
    paddingHorizontal: 10,
    paddingVertical: 10,
  },
  button: {
    backgroundColor: "#007bff",
    paddingVertical: 12,
    borderRadius: 5,
    alignItems: "center",
  },
  buttonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "bold",
  },
});

export default OfferPage;

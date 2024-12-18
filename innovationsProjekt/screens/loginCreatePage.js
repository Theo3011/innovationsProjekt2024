import React, { useState } from "react";
import {
  Text,
  View,
  StyleSheet,
  TouchableOpacity,
  Image,
  TextInput,
  Alert,
  SafeAreaView,
  KeyboardAvoidingView,
  TouchableWithoutFeedback,
  Keyboard,
  ScrollView,
  Platform,
} from "react-native";
import * as ImagePicker from "expo-image-picker";
import { Dropdown } from "react-native-element-dropdown";
import { db, storage, firebaseAuth } from "../firebase";
import { ref, set } from "firebase/database";
import {
  ref as storageRef,
  uploadBytes,
  getDownloadURL,
} from "firebase/storage";
import {
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
} from "firebase/auth";
import { useNavigation } from "@react-navigation/native";

const CreateLoginPage = () => {
  // state til håndtering af login eller registrering
  const [isLogin, setIsLogin] = useState(true);
  // state til at gemme inputfelter for brugerdata
  const [name, setName] = useState("");
  const [age, setAge] = useState("");
  const [university, setUniversity] = useState("");
  const [studyLine, setStudyLine] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [profileImage, setProfileImage] = useState(null);
  const [role, setRole] = useState(""); // sætter brugerrolle (Studerende eller Tutor)
  const navigation = useNavigation();

  // data til universitet og linje
  const universityData = [
    { label: "Aarhus Universitet (AU)", value: "au" },
    { label: "Københavns Universitet (KU)", value: "ku" },
    { label: "Syddansk Universitet (SDU)", value: "sdu" },
    { label: "Aalborg Universitet (AAU)", value: "aau" },
    { label: "Roskilde Universitet (RUC)", value: "ruc" },
    { label: "Danmarks Tekniske Universitet (DTU)", value: "dtu" },
    { label: "CBS - Copenhagen Business School", value: "cbs" },
    { label: "IT-Universitetet i København (ITU)", value: "itu" },
  ];

  // studielinjer afhængigt af universitet
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
      { label: "Ha It.", value: "HaIt" },
    ],
  };

  // funktion til at vælge profilbillede
  const pickImage = async () => {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== "granted") {
      Alert.alert("Permission Required", "Camera roll access is required.");
      return;
    }
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      quality: 1,
    });
    if (!result.canceled) {
      setProfileImage(result.assets[0].uri); // sætter valgt billede
    }
  };

  // funktion til at registrere en ny bruger
  const handleRegister = async () => {
    if (
      !name ||
      !age ||
      !university ||
      !studyLine ||
      !email ||
      !password ||
      !role
    ) {
      alert("Please fill all fields"); // kontrollerer om alle felter er udfyldt
      return;
    }

    try {
      const userCredential = await createUserWithEmailAndPassword(
        firebaseAuth,
        email,
        password
      );
      const userId = userCredential.user.uid;

      let imageUrl = "";
      if (profileImage) {
        const imageRef = storageRef(
          storage,
          `profileImages/${Date.now()}_${name}`
        );
        const response = await fetch(profileImage);
        const blob = await response.blob();
        await uploadBytes(imageRef, blob); // uploader billede til Firebase Storage
        imageUrl = await getDownloadURL(imageRef); // henter URL for billedet
      }

      const userPath = role === "student" ? "students" : "tutors";
      await set(ref(db, `${userPath}/${userId}`), {
        name,
        age,
        university,
        studyLine,
        email,
        profileImage: imageUrl,
      });

      alert("User registered successfully!"); // hvis bruger er registreret med succes
      clearForm(); // Rydder formularen, hvis ja
    } catch (error) {
      alert("Registration failed: " + error.message); // håndtering af fejl
    }
  };

  // funktion til at logge en bruger ind
  const handleLogin = async () => {
    try {
      await signInWithEmailAndPassword(firebaseAuth, email, password);
      navigation.replace("MainApp"); // navigerer til hovedappen
    } catch (error) {
      Alert.alert("Login failed", error.message); // håndtering af loginfejl
    }
  };

  // funktion til at rydde formularen
  const clearForm = () => {
    setName("");
    setAge("");
    setUniversity("");
    setStudyLine("");
    setEmail("");
    setPassword("");
    setProfileImage(null);
    setRole("");
  };

  return (
    <SafeAreaView style={styles.safeview}>
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        style={{ flex: 1 }}
      >
        <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
          <ScrollView contentContainerStyle={{ flexGrow: 1 }}>
            <View style={styles.container}>
              <Text style={styles.title}>
                {isLogin ? "Login" : "Create Account"}{" "}
              </Text>
              <TextInput
                placeholder="Email"
                value={email}
                onChangeText={setEmail}
                keyboardType="email-address"
                style={styles.input}
              />
              <TextInput
                placeholder="Password"
                value={password}
                onChangeText={setPassword}
                secureTextEntry
                style={styles.input}
              />
              {!isLogin && (
                <>
                  <TextInput
                    placeholder="Name"
                    value={name}
                    onChangeText={setName}
                    style={styles.input}
                  />
                  <TextInput
                    placeholder="Age"
                    value={age}
                    onChangeText={setAge}
                    keyboardType="numeric"
                    style={styles.input}
                  />

                  <Dropdown
                    style={styles.input}
                    placeholder="Select University"
                    data={universityData}
                    labelField="label"
                    valueField="value"
                    value={university}
                    onChange={(item) => {
                      setUniversity(item.value);
                      setStudyLine("");
                    }}
                  />

                  {university && (
                    <Dropdown
                      style={styles.input}
                      placeholder="Select Study Line"
                      data={studyLineData[university] || []}
                      labelField="label"
                      valueField="value"
                      value={studyLine}
                      onChange={(item) => setStudyLine(item.value)}
                    />
                  )}

                  <View style={styles.roleContainer}>
                    <TouchableOpacity onPress={() => setRole("tutor")}>
                      <Text
                        style={[
                          styles.role,
                          role === "tutor" && styles.selectedRole,
                        ]}
                      >
                        Tutor
                      </Text>
                    </TouchableOpacity>
                    <TouchableOpacity onPress={() => setRole("student")}>
                      <Text
                        style={[
                          styles.role,
                          role === "student" && styles.selectedRole,
                        ]}
                      >
                        Student
                      </Text>
                    </TouchableOpacity>
                  </View>

                  <TouchableOpacity
                    onPress={pickImage}
                    style={styles.imagePicker}
                  >
                    <Text style={styles.imagePickerText}>
                      Pick Profile Image
                    </Text>
                  </TouchableOpacity>
                  {profileImage && (
                    <Image
                      source={{ uri: profileImage }}
                      style={styles.profileImage}
                    />
                  )}
                </>
              )}

              <TouchableOpacity
                style={styles.button}
                onPress={isLogin ? handleLogin : handleRegister}
              >
                <Text style={styles.buttonText}>
                  {isLogin ? "Login" : "Register"}
                </Text>
              </TouchableOpacity>

              <TouchableOpacity onPress={() => setIsLogin(!isLogin)}>
                <Text style={styles.switchText}>
                  {isLogin
                    ? "Don't have an account? Sign Up"
                    : "Already have an account? Log In"}
                </Text>
              </TouchableOpacity>
            </View>
          </ScrollView>
        </TouchableWithoutFeedback>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

export default CreateLoginPage;

const styles = StyleSheet.create({
  safeview: {
    flex: 1,
    backgroundColor: "#f5f5f5",
  },
  container: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 20,
    backgroundColor: "#ffffff",
    borderRadius: 10,
  },
  title: {
    fontSize: 30,
    fontWeight: "bold",
    marginBottom: 30,
    color: "#333",
  },
  input: {
    width: "90%",
    padding: 12,
    marginBottom: 15,
    backgroundColor: "#fff",
    borderRadius: 8,
    borderColor: "#ccc",
    borderWidth: 1,
    fontSize: 16,
    color: "#555",
  },
  imagePicker: {
    padding: 15,
    backgroundColor: "#007BFF",
    borderRadius: 8,
    marginBottom: 20,
    width: "90%",
    alignItems: "center",
  },
  imagePickerText: {
    color: "white",
    fontWeight: "bold",
    fontSize: 16,
  },
  profileImage: {
    width: 100,
    height: 100,
    borderRadius: 50,
    marginTop: 20,
    borderColor: "#007BFF",
    borderWidth: 2,
  },
  role: {
    fontSize: 18,
    padding: 12,
    borderRadius: 8,
    color: "#888",
  },
  selectedRole: {
    backgroundColor: "#007BFF",
    color: "white",
  },
  roleContainer: {
    flexDirection: "row",
    justifyContent: "space-around",
    marginBottom: 20,
    width: "100%",
  },
  switchText: {
    textAlign: "center",
    marginTop: 20,
    color: "#007BFF",
    fontSize: 16,
  },
  button: {
    backgroundColor: "#007BFF",
    padding: 15,
    borderRadius: 8,
    width: "90%",
    alignItems: "center",
    marginVertical: 10,
  },
  buttonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "bold",
  },
});

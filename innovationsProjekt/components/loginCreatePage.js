import React, { useState } from "react";
import {
  Text,
  View,
  StyleSheet,
  Button,
  SafeAreaView,
  TouchableOpacity,
  Image,
  TextInput,
  Alert,
} from "react-native";
import * as ImagePicker from "expo-image-picker";
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
  const [isLogin, setIsLogin] = useState(true);
  const [name, setName] = useState("");
  const [age, setAge] = useState("");
  const [study, setStudy] = useState("");
  const [studyDirection, setStudyDirection] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [profileImage, setProfileImage] = useState(null);
  const [role, setRole] = useState("");
  const navigation = useNavigation();

  const pickImage = async () => {
    // Anmod om adgang til kamerarullen
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();

    if (status !== "granted") {
      Alert.alert(
        "Permission Required",
        "We need access to your camera roll to select a profile picture.",
        [
          { text: "Cancel", style: "cancel" },
          {
            text: "Grant Access",
            onPress: () => ImagePicker.requestMediaLibraryPermissionsAsync(),
          },
        ]
      );
      return;
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      quality: 1,
    });

    if (!result.canceled) {
      setProfileImage(result.assets[0].uri);
    }
  };

  const handleRegister = async () => {
    if (
      !name ||
      !age ||
      !study ||
      !studyDirection ||
      !email ||
      !password ||
      !role
    ) {
      alert("Please fill all fields");
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
        await uploadBytes(imageRef, blob);
        imageUrl = await getDownloadURL(imageRef);
      }

      const userPath = role === "student" ? "students" : "tutors";
      await set(ref(db, `${userPath}/${userId}`), {
        name,
        age,
        study,
        studyDirection,
        email,
        profileImage: imageUrl,
      });

      alert("User registered successfully!");
      clearForm();
    } catch (error) {
      alert("Registration failed: " + error.message);
    }
  };

  // Handle login logic
  const handleLogin = async () => {
    try {
      // Forsøger at logge brugeren ind
      await signInWithEmailAndPassword(firebaseAuth, email, password);
      Alert.alert("Login successful");
      // Navigerer til 'MainApp' efter succesfuldt login
      navigation.replace("MainApp");
    } catch (error) {
      Alert.alert("Login failed", error.message);
    }
  };

  const clearForm = () => {
    setName("");
    setAge("");
    setStudy("");
    setStudyDirection("");
    setEmail("");
    setPassword("");
    setProfileImage(null);
    setRole("");
  };

  return (
    <SafeAreaView style={styles.safeview}>
      <View style={styles.container}>
        <Text style={styles.title}>{isLogin ? "Login" : "Create Account"}</Text>
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
            <TextInput
              placeholder="Study"
              value={study}
              onChangeText={setStudy}
              style={styles.input}
            />
            <TextInput
              placeholder="Study Direction"
              value={studyDirection}
              onChangeText={setStudyDirection}
              style={styles.input}
            />

            <View style={styles.roleContainer}>
              <TouchableOpacity onPress={() => setRole("tutor")}>
                <Text
                  style={[styles.role, role === "tutor" && styles.selectedRole]}
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

            <TouchableOpacity onPress={pickImage} style={styles.imagePicker}>
              <Text style={styles.imagePickerText}>Pick Profile Image</Text>
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
    </SafeAreaView>
  );
};
export default CreateLoginPage;


const styles = StyleSheet.create({
  safeview: { 
    flex: 1, 
    backgroundColor: "#f5f5f5" 
  },
  container: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 20,
    backgroundColor: "#ffffff", // Ensartet baggrund
    borderRadius: 10, // Let runding af hjørner
  },
  title: { 
    fontSize: 30, 
    fontWeight: "bold", 
    marginBottom: 30, 
    color: "#333" // Tilføjet mørkere tekstfarve
  },
  input: {
    width: "90%", // Mindsket bredde for at passe bedre på små skærme
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
    fontSize: 16 
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
    color: "#888" 
  },
  selectedRole: { 
    backgroundColor: "#4CAF50", 
    color: "white" 
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
    backgroundColor: "#28A745",
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

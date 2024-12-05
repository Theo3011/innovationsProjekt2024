import React, { useState, useEffect } from "react";
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
import { db, storage, firebaseAuth } from "../firebase"; // Use auth here
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
import { CameraView, useCameraPermissions } from "expo-camera"; // Import CameraType separately if needed

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
  const [facing, setFacing] = useState("back"); // Set initial facing to "back" (as string)
  const [permission, requestPermission] = useCameraPermissions(); // Use hook for permissions
  const navigation = useNavigation();

  // Handle camera permission loading state
  if (!permission) {
    return <View />;
  }

  if (!permission.granted) {
    return (
      <View style={styles.container}>
        <Text style={styles.message}>
          We need your permission to show the camera
        </Text>
        <Button onPress={requestPermission} title="Grant Permission" />
      </View>
    );
  }

  // Handle register logic
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
      await signInWithEmailAndPassword(firebaseAuth, email, password);
      navigation.replace("MainApp", {
        screen: "Home",
      });
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

  // Function to toggle camera type (front/back)
  function toggleCameraFacing() {
    setFacing((current) => (current === "back" ? "front" : "back"));
  }

  // Function to take a picture (not fully implemented here)
  const takePicture = async () => {
    if (cameraRef) {
      const photo = await cameraRef.takePictureAsync();
      setProfileImage(photo.uri); // Set the taken photo URI
    }
  };

  return (
    <SafeAreaView style={styles.safeview}>
      <View style={styles.container}>
        <Text style={styles.title}>{isLogin ? "Login" : "Create Account"}</Text>

        {/* Common email and password input */}
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
          secureTextEntry={true}
          style={styles.input}
        />

        {/* Only show in create account mode */}
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

            {/* Camera section */}
            <View style={styles.cameraContainer}>
              <CameraView style={styles.camera} facing={facing}>
                <View style={styles.cameraButtonContainer}>
                  <TouchableOpacity
                    onPress={toggleCameraFacing}
                    style={styles.captureButton}
                  >
                    <Text style={styles.captureButtonText}>Flip Camera</Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    onPress={takePicture}
                    style={styles.captureButton}
                  >
                    <Text style={styles.captureButtonText}>Capture</Text>
                  </TouchableOpacity>
                </View>
              </CameraView>
            </View>

            {profileImage && (
              <Image
                source={{ uri: profileImage }}
                style={styles.profileImage}
              />
            )}
          </>
        )}

        {/* Show button depending on state */}
        <Button
          title={isLogin ? "Login" : "Register"}
          onPress={isLogin ? handleLogin : handleRegister}
        />

        {/* Button to toggle between Login and Create Account */}
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
  },
  title: {
    fontSize: 30,
    fontWeight: "bold",
    marginBottom: 30,
  },
  input: {
    width: "100%",
    padding: 10,
    marginBottom: 15,
    backgroundColor: "#fff",
    borderRadius: 5,
    borderColor: "#ccc",
    borderWidth: 1,
  },
  message: {
    textAlign: "center",
    paddingBottom: 10,
    fontSize: 16,
    color: "black",
  },
  roleContainer: {
    flexDirection: "row",
    marginBottom: 20,
    justifyContent: "space-around",
    width: "100%",
  },
  role: {
    fontSize: 18,
    padding: 10,
    borderRadius: 5,
    color: "#888",
  },
  selectedRole: {
    backgroundColor: "#4CAF50",
    color: "white",
  },
  cameraContainer: {
    width: "100%",
    height: 300,
    marginVertical: 20,
    backgroundColor: "transparent",
    justifyContent: "center",
    alignItems: "center",
  },
  camera: {
    width: "100%",
    height: "100%",
    borderRadius: 5,
  },
  cameraButtonContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    width: "100%",
    padding: 20,
  },
  captureButton: {
    backgroundColor: "#4CAF50",
    padding: 10,
    borderRadius: 5,
    alignItems: "center",
    justifyContent: "center",
  },
  captureButtonText: {
    color: "white",
    fontWeight: "bold",
  },
  profileImage: {
    width: 100,
    height: 100,
    borderRadius: 50,
    marginTop: 20,
  },
  switchText: {
    textAlign: "center",
    marginTop: 20,
    color: "#007BFF",
    fontSize: 16,
  },
});

export default CreateLoginPage;

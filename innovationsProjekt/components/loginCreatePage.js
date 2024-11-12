import React, { useState, useRef, useEffect } from 'react';
import { Text, View, StyleSheet, Button, SafeAreaView, TouchableOpacity, Image, TextInput, Alert } from 'react-native';
import { db, storage, firebaseAuth } from '../firebase'; // Brug auth her
import { ref, set, push } from 'firebase/database';
import { ref as storageRef, uploadBytes, getDownloadURL } from 'firebase/storage';
import { Camera } from 'expo-camera/legacy';
import Ionicons from 'react-native-vector-icons/Ionicons';
import { signInWithEmailAndPassword, createUserWithEmailAndPassword } from "firebase/auth";
import { useNavigation } from '@react-navigation/native';

const CreateLoginPage = () => {
  const [isLogin, setIsLogin] = useState(true); 
  const [name, setName] = useState('');
  const [age, setAge] = useState('');
  const [study, setStudy] = useState('');
  const [studyDirection, setStudyDirection] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [profileImage, setProfileImage] = useState(null);
  const [role, setRole] = useState('');
  const [hasPermission, setHasPermission] = useState(null);
  const cameraRef = useRef();
  const [type, setType] = useState("back");
  const [isCameraOpen, setIsCameraOpen] = useState(false);
  const navigation = useNavigation();

  useEffect(() => {
    (async () => {
      const { status } = await Camera.requestCameraPermissionsAsync();
      setHasPermission(status === 'granted');
    })();
  }, []);

  const handleRegister = async () => {
    if (!name || !age || !study || !studyDirection || !email || !password || !role) {
      alert("Please fill all fields");
      return;
    }

    try {
      const userCredential = await createUserWithEmailAndPassword(firebaseAuth, email, password);
      const userId = userCredential.user.uid;

      let imageUrl = '';
      if (profileImage) {
        const imageRef = storageRef(storage, `profileImages/${Date.now()}_${name}`);
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

      alert('User registered successfully!');
      clearForm();
    } catch (error) {
      alert("Registration failed: " + error.message);
    }
  };

const handleLogin = async () => {
    try {
      await signInWithEmailAndPassword(firebaseAuth, email, password);
      Alert.alert("Login successful");
      navigation.navigate("Dashboard"); 
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

  const openCamera = () => {
    if (hasPermission === false) {
      alert("Camera permission is required");
      return;
    }
    setIsCameraOpen(true);
  };

  const snap = async () => {
    if (cameraRef.current) {
      const result = await cameraRef.current.takePictureAsync();
      setProfileImage(result.uri);
      setIsCameraOpen(false);
    }
  };

  const toggleCameraType = () => {
    setType(type === "back" ? "front" : "back");
  };

  if (hasPermission === null) {
    return <View />;
  }

  if (hasPermission === false) {
    return (
      <View style={styles.container}>
        <Text style={{ textAlign: 'center' }}>We need your permission to show the camera</Text>
        <Button onPress={() => Camera.requestCameraPermissionsAsync().then(({ status }) => setHasPermission(status === 'granted'))} title="Grant Permission" />
      </View>
    );
  }

  return (
    <SafeAreaView style={styles.safeview}>
      <View style={styles.container}>
        <Text style={styles.title}>{isLogin ? "Login" : "Create Account"}</Text>
        
        {/* Fælles email og password input */}
        <TextInput placeholder="Email" value={email} onChangeText={setEmail} keyboardType="email-address" style={styles.input} />
        <TextInput placeholder="Password" value={password} onChangeText={setPassword} secureTextEntry={true} style={styles.input} />

        {/* Vises kun i oprettelsestilstand */}
        {!isLogin && (
          <>
            <TextInput placeholder="Name" value={name} onChangeText={setName} style={styles.input} />
            <TextInput placeholder="Age" value={age} onChangeText={setAge} keyboardType="numeric" style={styles.input} />
            <TextInput placeholder="Study" value={study} onChangeText={setStudy} style={styles.input} />
            <TextInput placeholder="Study Direction" value={studyDirection} onChangeText={setStudyDirection} style={styles.input} />

            <View style={styles.roleContainer}>
              <TouchableOpacity onPress={() => setRole("tutor")}>
                <Text style={[styles.role, role === "tutor" && styles.selectedRole]}>Tutor</Text>
              </TouchableOpacity>
              <TouchableOpacity onPress={() => setRole("student")}>
                <Text style={[styles.role, role === "student" && styles.selectedRole]}>Student</Text>
              </TouchableOpacity>
            </View>

            <TouchableOpacity onPress={openCamera} style={styles.imagePicker}>
              <Text style={styles.imagePickerText}>Open Camera</Text>
            </TouchableOpacity>

            {profileImage && (
              <Image source={{ uri: profileImage }} style={styles.profileImage} />
            )}

            {isCameraOpen && (
              <Camera style={styles.camera} type={type} ref={cameraRef}>
                <View style={styles.buttonContainer}>
                  <TouchableOpacity style={styles.flipbtn} onPress={toggleCameraType}>
                    <Ionicons name="camera-reverse-outline" size={32} color="#fff" />
                  </TouchableOpacity>
                  <TouchableOpacity style={styles.snapbtn} onPress={snap}>
                    <Text style={styles.text}>Take Photo</Text>
                  </TouchableOpacity>
                </View>
              </Camera>
            )}
          </>
        )}

        {/* Viser knap afhængigt af tilstand */}
        <Button title={isLogin ? "Login" : "Register"} onPress={isLogin ? handleLogin : handleRegister} />

        {/* Knap til at skifte mellem Login og Oprettelse */}
        <TouchableOpacity onPress={() => setIsLogin(!isLogin)}>
          <Text style={styles.switchText}>{isLogin ? "Don't have an account? Register" : "Already have an account? Login"}</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeview: { backgroundColor: 'white', flex: 1, justifyContent: 'center', width: '100%' },
  container: { flex: 1, padding: 20 },
  title: { fontSize: 24, fontWeight: 'bold', marginBottom: 20, color: 'black' },
  input: { borderBottomWidth: 1, marginBottom: 15, padding: 8, color: 'black' },
  roleContainer: { flexDirection: 'row', justifyContent: 'space-around', marginBottom: 20 },
  role: { fontSize: 18, padding: 10, color: 'black' },
  selectedRole: { fontWeight: 'bold', color: 'blue' },
  imagePicker: { alignItems: 'center', marginVertical: 10 },
  imagePickerText: { color: 'blue' },
  profileImage: { width: 100, height: 100, borderRadius: 50, alignSelf: 'center', marginVertical: 10 },
  camera: { flex: 1, justifyContent: 'flex-end', width: '100%' },
  buttonContainer: { flexDirection: 'row', justifyContent: 'space-between', padding: 10 },
  snapbtn: { backgroundColor: 'black', padding: 10, borderRadius: 50 },
  flipbtn: { backgroundColor: 'black', padding: 10, borderRadius: 50 },
  switchText: { color: 'blue', textAlign: 'center', marginTop: 10 },
});

export default CreateLoginPage;

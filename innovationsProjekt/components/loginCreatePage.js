import React, { useState, useRef, useEffect } from 'react';
import { Text, View, StyleSheet, Button, SafeAreaView, TouchableOpacity, Image, TextInput } from 'react-native';
import { db, storage } from '../firebase';
import { ref, set, push } from 'firebase/database';
import { ref as storageRef, uploadBytes, getDownloadURL } from 'firebase/storage';
import { Camera } from 'expo-camera/legacy';
import Ionicons from 'react-native-vector-icons/Ionicons';

const CreateLoginPage = () => {
  const [name, setName] = useState('');
  const [age, setAge] = useState('');
  const [study, setStudy] = useState('');
  const [studyDirection, setStudyDirection] = useState('');
  const [email, setEmail] = useState('');
  const [profileImage, setProfileImage] = useState(null);
  const [role, setRole] = useState('');
  const [hasPermission, setHasPermission] = useState(null);
  const cameraRef = useRef();
  const [type, setType] = useState("back");
  const [isCameraOpen, setIsCameraOpen] = useState(false);

  // Anmod om kamera-tilladelse ved opstart
  useEffect(() => {
    (async () => {
      const { status } = await Camera.requestCameraPermissionsAsync();
      setHasPermission(status === 'granted');
    })();
  }, []);

  // Håndterer brugerregistrering og upload af profilbillede
  const handleRegister = async () => {
    if (!name || !age || !study || !studyDirection || !email || !role) {
      alert("Please fill all fields");
      return;
    }

    let imageUrl = '';
    if (profileImage) {
      const imageRef = storageRef(storage, `profileImages/${Date.now()}_${name}`);
      const response = await fetch(profileImage);
      const blob = await response.blob();
      await uploadBytes(imageRef, blob);
      imageUrl = await getDownloadURL(imageRef);
    }

    const userPath = role === "student" ? "students" : "tutors";
    const newUserRef = push(ref(db, userPath));
    const userId = newUserRef.key;

    set(newUserRef, {
      name,
      age,
      study,
      studyDirection,
      email,
      profileImage: imageUrl,
    }).then(() => {
      alert('User registered successfully!');
      clearForm();
    }).catch((error) => {
      console.error("Error saving data: ", error);
      alert('Failed to register user.');
    });
  };

  // Nulstiller formularen
  const clearForm = () => {
    setName("");
    setAge("");
    setStudy("");
    setStudyDirection("");
    setEmail("");
    setProfileImage(null);
    setRole("");
  };

  // Åbn kameraet, hvis tilladelse er givet
  const openCamera = () => {
    if (hasPermission === false) {
      alert("Camera permission is required");
      return;
    }
    setIsCameraOpen(true);
  };

  // Tag billede og gem som profilbillede
  const snap = async () => {
    if (cameraRef.current) {
      const result = await cameraRef.current.takePictureAsync();
      setProfileImage(result.uri);
      setIsCameraOpen(false);
    }
  };

  // Skift mellem front- og bagkamera
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
        <Text style={styles.title}>Create Account</Text>
        <TextInput placeholder="Name" value={name} onChangeText={setName} style={styles.input} />
        <TextInput placeholder="Age" value={age} onChangeText={setAge} keyboardType="numeric" style={styles.input} />
        <TextInput placeholder="Study" value={study} onChangeText={setStudy} style={styles.input} />
        <TextInput placeholder="Study Direction" value={studyDirection} onChangeText={setStudyDirection} style={styles.input} />
        <TextInput placeholder="Email" value={email} onChangeText={setEmail} keyboardType="email-address" style={styles.input} />

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

        <Button title="Register" onPress={handleRegister} />
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
});

export default CreateLoginPage;

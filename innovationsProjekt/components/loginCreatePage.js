import React, { useState, useRef, useEffect } from 'react';
import { Text, View, StyleSheet, Button, SafeAreaView, TouchableOpacity, Image, TextInput } from 'react-native';
import { db, storage } from '../firebase';
import { ref, set } from 'firebase/database';
import { ref as storageRef, uploadBytes, getDownloadURL } from 'firebase/storage';
import * as ImagePicker from 'expo-image-picker';
import { Camera } from 'expo-camera';
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
  const [type, setType] = useState("back"); // Use "back" or "front" directly
  const [isCameraOpen, setIsCameraOpen] = useState(false);

  useEffect(() => {
    (async () => {
      const { status } = await Camera.requestCameraPermissionsAsync();
      setHasPermission(status === 'granted');
    })();
  }, []);
  

  const handleRegister = async () => {
    // Kontroller, om alle felter er udfyldt
    if (!name || !age || !study || !studyDirection || !email || !role) {
      alert("Please fill all fields");
      return;
    }

    let imageUrl = '';
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

    // Definer database-stien baseret på rollen (student eller tutor)
    const userPath = role === "student" ? "students" : "tutors";

    // Opret en ny reference i databasen med et unikt ID
    const newUserRef = push(ref(db, userPath));
    const userId = newUserRef.key; // Firebase-genereret unikt ID

    // Gem brugerdata under den specifikke reference
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

  // Rydder alle inputfelter
  const clearForm = () => {
    setName("");
    setAge("");
    setStudy("");
    setStudyDirection("");
    setEmail("");
    setProfileImage(null);
    setRole("");
  };

  const pickImage = async () => {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== 'granted') {
      alert('Permission to access media library is required!');
      return;
    }
    
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [1, 1],
      quality: 1,
    });

    if (!result.canceled) {
      setProfileImage(result.uri);
    }
  };

  const openCamera = () => {
    if (hasPermission === false) {
      alert("Camera permission is required");
      return;
    }
    setIsCameraOpen(true);
  };

  // Tag et billede med kameraet og gem det som profilbillede
  const snap = async () => {
    if (cameraRef.current) {
      const result = await cameraRef.current.takePictureAsync();
      setProfileImage(result.uri); // Gem billedets URI som profilbillede
      setIsCameraOpen(false); // Luk kameraet efter at have taget billedet
    }
  };

  // Skift mellem front- og bagkamera
  const toggleCameraType = () => {
    setType(type === "back" ? "front" : "back");
  };

  // Vis en tom skærm, hvis kamera-tilladelsen ikke er bestemt endnu
  if (hasPermission === null) {
    return <View />;
  }

  // Vis en besked, hvis kamera-tilladelsen er afvist
  if (hasPermission === false) {
    return (
      <View style={styles.container}>
        <Text style={{ textAlign: 'center' }}>We need your permission to show the camera</Text>
        <Button onPress={() => Camera.requestPermissionsAsync().then(({ status }) => setHasPermission(status === 'granted'))} title="Grant Permission" />
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

        {/* Vælg rolle som tutor eller student */}
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
              style={[styles.role, role === "student" && styles.selectedRole]}
            >
              Student
            </Text>
          </TouchableOpacity>
        </View>

        {/* Knap til at åbne kameraet */}
        <TouchableOpacity onPress={openCamera} style={styles.imagePicker}>
          <Text style={styles.imagePickerText}>Open Camera</Text>
        </TouchableOpacity>

        {/* Vis profilbillede, hvis et billede er taget */}
        {profileImage && (
          <Image source={{ uri: profileImage }} style={styles.profileImage} />
        )}

        {/* Kamera-view */}
        {isCameraOpen && (
          <Camera style={styles.camera} type={type} ref={cameraRef}>
            <View style={styles.buttonContainer}>
              <TouchableOpacity
                style={styles.flipbtn}
                onPress={toggleCameraType}
              >
                <Ionicons
                  name="camera-reverse-outline"
                  size={32}
                  color="#fff"
                />
              </TouchableOpacity>
              <TouchableOpacity style={styles.snapbtn} onPress={snap}>
                <Text style={styles.text}>Take Photo</Text>
              </TouchableOpacity>
            </View>
          </Camera>
        ) : (
          <>
            <TouchableOpacity onPress={pickImage} style={styles.imagePicker}>
              <Text style={styles.imagePickerText}>Pick Profile Image</Text>
            </TouchableOpacity>
            <TouchableOpacity onPress={openCamera} style={styles.imagePicker}>
              <Text style={styles.imagePickerText}>Open Camera</Text>
            </TouchableOpacity>
            {profileImage && <Image source={{ uri: profileImage }} style={styles.profileImage} />}
          </>
        )}

        <Button title="Register" onPress={handleRegister} />
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeview: { backgroundColor: 'black', flex: 1, justifyContent: 'center', width: '100%' },
  container: { flex: 1, padding: 20 },
  title: { fontSize: 24, fontWeight: 'bold', marginBottom: 20, color: 'white' },
  input: { borderBottomWidth: 1, marginBottom: 15, padding: 8, color: 'white' },
  roleContainer: { flexDirection: 'row', justifyContent: 'space-around', marginBottom: 20 },
  role: { fontSize: 18, padding: 10, color: 'white' },
  selectedRole: { fontWeight: 'bold', color: 'blue' },
  imagePicker: { alignItems: 'center', marginVertical: 10 },
  imagePickerText: { color: 'blue' },
  profileImage: { width: 100, height: 100, borderRadius: 50, alignSelf: 'center', marginVertical: 10 },
  camera: { flex: 1, justifyContent: 'flex-end', width: '100%' },
  buttonContainer: { flexDirection: 'row', justifyContent: 'space-between', padding: 10 },
  snapbtn: { backgroundColor: 'white', padding: 10, borderRadius: 50 },
  flipbtn: { backgroundColor: 'white', padding: 10, borderRadius: 50 },
});

export default CreateLoginPage;

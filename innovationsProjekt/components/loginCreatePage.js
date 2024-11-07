import React, { useState } from 'react';
import { View, Text, TextInput, Button, StyleSheet, Image, TouchableOpacity } from 'react-native';
import { db, storage } from '../firebase';
import { ref, set } from 'firebase/database';
import { ref as storageRef, uploadBytes, getDownloadURL } from 'firebase/storage';
import * as ImagePicker from 'expo-image-picker';

const CreateLoginPage = () => {
  const [name, setName] = useState('');
  const [age, setAge] = useState('');
  const [study, setStudy] = useState('');
  const [studyDirection, setStudyDirection] = useState('');
  const [email, setEmail] = useState('');
  const [profileImage, setProfileImage] = useState(null);
  const [role, setRole] = useState(''); // either 'tutor' or 'student'

  const handleRegister = async () => {
    if (!name || !age || !study || !studyDirection || !email || !role) {
      alert('Please fill all fields');
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

    const userId = Date.now().toString(); // Simple unique ID for demo purposes
    set(ref(db, `users/${userId}`), {
      name,
      age,
      study,
      studyDirection,
      email,
      role,
      profileImage: imageUrl,
    }).then(() => {
      alert('User registered successfully!');
      clearForm();
    }).catch((error) => {
      console.error("Error saving data: ", error);
      alert('Failed to register user.');
    });
  };

  const clearForm = () => {
    setName('');
    setAge('');
    setStudy('');
    setStudyDirection('');
    setEmail('');
    setProfileImage(null);
    setRole('');
  };

  const pickImage = async () => {
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

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Create Account</Text>
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
      <TextInput
        placeholder="Email"
        value={email}
        onChangeText={setEmail}
        keyboardType="email-address"
        style={styles.input}
      />
      
      <View style={styles.roleContainer}>
        <TouchableOpacity onPress={() => setRole('tutor')}>
          <Text style={[styles.role, role === 'tutor' && styles.selectedRole]}>Tutor</Text>
        </TouchableOpacity>
        <TouchableOpacity onPress={() => setRole('student')}>
          <Text style={[styles.role, role === 'student' && styles.selectedRole]}>Student</Text>
        </TouchableOpacity>
      </View>

      <TouchableOpacity onPress={pickImage} style={styles.imagePicker}>
        <Text style={styles.imagePickerText}>Pick Profile Image</Text>
      </TouchableOpacity>
      {profileImage && <Image source={{ uri: profileImage }} style={styles.profileImage} />}

      <Button title="Register" onPress={handleRegister} />
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, padding: 20 },
  title: { fontSize: 24, fontWeight: 'bold', marginBottom: 20 },
  input: { borderBottomWidth: 1, marginBottom: 15, padding: 8 },
  roleContainer: { flexDirection: 'row', justifyContent: 'space-around', marginBottom: 20 },
  role: { fontSize: 18, padding: 10 },
  selectedRole: { fontWeight: 'bold', color: 'blue' },
  imagePicker: { alignItems: 'center', marginVertical: 10 },
  imagePickerText: { color: 'blue' },
  profileImage: { width: 100, height: 100, borderRadius: 50, alignSelf: 'center', marginVertical: 10 },
});

export default CreateLoginPage;

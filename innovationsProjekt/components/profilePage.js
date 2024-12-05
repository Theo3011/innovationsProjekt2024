import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  Image,
  StyleSheet,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
} from "react-native";
import { getDatabase, ref, get } from "firebase/database";
import { firebaseAuth } from "../firebase";

const ProfilePage = () => {
  const [userData, setUserData] = useState(null);
  const [loading, setLoading] = useState(true);

  const userId = firebaseAuth.currentUser?.uid;

  useEffect(() => {
    if (userId) {
      const db = getDatabase();
      const userRef = ref(db, `students/${userId}`); // Skift til `tutors/${userId}`, hvis nødvendigt

      get(userRef)
        .then((snapshot) => {
          if (snapshot.exists()) {
            setUserData(snapshot.val());
          } else {
            console.log("User data not found!");
          }
        })
        .catch((error) => console.error("Error fetching user data:", error))
        .finally(() => setLoading(false));
    }
  }, [userId]);

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#007BFF" />
        <Text style={styles.loadingText}>Loading Profile...</Text>
      </View>
    );
  }

  if (!userData) {
    return (
      <View style={styles.container}>
        <Text style={styles.errorText}>No user data available.</Text>
      </View>
    );
  }

  // Handlers for knapper
  const handleEditDetails = () => {
    Alert.alert("Edit Details", "Redirecting to edit details page...");
    // Tilføj navigation til redigeringsside her
  };

  const handleForgotPassword = () => {
    Alert.alert(
      "Reset Password",
      "A password reset link has been sent to your email."
    );
    // Tilføj funktion til at sende glemt adgangskode e-mail
  };

  const handlePrintReviews = () => {
    Alert.alert("Print Reviews", "Fetching reviews for printing...");
    // Tilføj funktion til at printe eller vise anmeldelser
  };

  return (
    <View style={styles.safeview}>
      <View style={styles.container}>
        {/* Profilbillede */}
        <Image
          source={{
            uri: userData.profileImage || "https://via.placeholder.com/100",
          }}
          style={styles.profileImage}
        />

        {/* Brugeroplysninger */}
        <Text style={styles.infoText}>
          <Text style={styles.label}>Name: </Text>
          {userData.name || "N/A"}
        </Text>
        <Text style={styles.infoText}>
          <Text style={styles.label}>Age: </Text>
          {userData.age || "N/A"}
        </Text>
        <Text style={styles.infoText}>
          <Text style={styles.label}>University: </Text>
          {userData.study || "N/A"}
        </Text>
        <Text style={styles.infoText}>
          <Text style={styles.label}>Email: </Text>
          {userData.email || "N/A"}
        </Text>

        {/* Knapper */}
        <TouchableOpacity
          style={styles.button}
          onPress={handleEditDetails}
        >
          <Text style={styles.buttonText}>Ændre oplysninger</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.button}
          onPress={handleForgotPassword}
        >
          <Text style={styles.buttonText}>Glemt kodeord?</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.button}
          onPress={handlePrintReviews}
        >
          <Text style={styles.buttonText}>Print anmeldelser</Text>
        </TouchableOpacity>
      </View>

      {/* Kommende Tutor-Sessions */}
      <View style={styles.sessionContainer}>
        <Text style={styles.sessionTitle}>Kommende Tutor-Sessions</Text>
        <View style={styles.sessionBox}>
          <Image
            source={{ uri: userData.profileImage || "https://via.placeholder.com/50" }}
            style={styles.sessionImage}
          />
          <View style={styles.sessionDetails}>
            <Text style={styles.sessionText}>
              <Text style={styles.label}>Navn: </Text>
              {userData.name || "N/A"}
            </Text>
            <Text style={styles.sessionText}>
              <Text style={styles.label}>Fag: </Text>
              {userData.studyDirection || "N/A"}
            </Text>
            <Text style={styles.sessionText}>
              <Text style={styles.label}>Lokation: </Text>
              Online
            </Text>
          </View>
          <Text style={styles.sessionDate}>Dato</Text>
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  safeview: { 
    flex: 1, 
    backgroundColor: "#f5f5f5",
  },
  container: {
    justifyContent: "center",
    alignItems: "center",
    padding: 20,
    backgroundColor: "#ffffff",
    borderRadius: 10,
    margin: 20,
  },
  profileImage: {
    width: 100,
    height: 100,
    borderRadius: 50,
    borderWidth: 2,
    borderColor: "#007BFF",
    marginBottom: 20,
  },
  infoText: {
    fontSize: 16,
    color: "#555",
    marginBottom: 10,
    textAlign: "center",
  },
  label: {
    fontWeight: "bold",
    color: "#333",
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
  sessionContainer: {
    backgroundColor: "#ffffff",
    padding: 20,
    margin: 20,
    borderRadius: 10,
    elevation: 3,
  },
  sessionTitle: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#333",
    marginBottom: 10,
  },
  sessionBox: {
    flexDirection: "row",
    alignItems: "center",
    padding: 10,
    borderColor: "#ddd",
    borderWidth: 1,
    borderRadius: 8,
  },
  sessionImage: {
    width: 50,
    height: 50,
    borderRadius: 25,
    marginRight: 10,
  },
  sessionDetails: {
    flex: 1,
  },
  sessionText: {
    fontSize: 14,
    color: "#555",
  },
  sessionDate: {
    fontSize: 14,
    color: "#757575",
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#f5f5f5",
  },
  loadingText: {
    marginTop: 10,
    color: "#555",
    fontSize: 16,
  },
  errorText: {
    color: "red",
    fontSize: 16,
  },
});

export default ProfilePage;

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
import { getDatabase, ref, get, onValue } from "firebase/database";
import { getAuth } from "firebase/auth";

const ProfilePage = () => {
  const [userData, setUserData] = useState(null);
  const [userSessions, setUserSessions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [userType, setUserType] = useState(null); // "student" eller "tutor"

  const auth = getAuth();
  const userId = auth.currentUser?.uid;

  useEffect(() => {
    if (userId) {
      const db = getDatabase();
      const studentRef = ref(db, `students/${userId}`);
      const tutorRef = ref(db, `tutors/${userId}`);

      // Tjek om brugeren er en student
      get(studentRef)
        .then((snapshot) => {
          if (snapshot.exists()) {
            setUserType("student");
            setUserData(snapshot.val());
          } else {
            // Hvis ikke en student, tjek om brugeren er en tutor
            get(tutorRef)
              .then((snapshot) => {
                if (snapshot.exists()) {
                  setUserType("tutor");
                  setUserData(snapshot.val());
                } else {
                  console.log("User not found in students or tutors.");
                }
              })
              .catch((error) =>
                console.error("Error fetching tutor data:", error)
              );
          }
        })
        .catch((error) => console.error("Error fetching student data:", error))
        .finally(() => setLoading(false));
    }
  }, [userId]);

  // Fetch sessions hvis brugeren er en tutor
  useEffect(() => {
    if (userId && userType === "tutor") {
      const db = getDatabase();
      const sessionsRef = ref(db, `tutors/${userId}/sessions`);

      const unsubscribe = onValue(sessionsRef, (snapshot) => {
        const data = snapshot.val();
        if (data) {
          const sessionsArray = Object.keys(data).map((key) => ({
            id: key,
            ...data[key],
          }));
          setUserSessions(sessionsArray);
        } else {
          setUserSessions([]);
        }
      });

      return () => unsubscribe(); // Cleanup listener
    }
  }, [userId, userType]);

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

  const handleEditDetails = () => {
    Alert.alert("Edit Details", "Redirecting to edit details page...");
  };

  const handleForgotPassword = () => {
    Alert.alert(
      "Reset Password",
      "A password reset link has been sent to your email."
    );
  };

  const handlePrintReviews = () => {
    Alert.alert("Print Reviews", "Fetching reviews for printing...");
  };

  return (
    <View style={styles.safeview}>
      <View style={styles.container}>
        <Image
          source={{
            uri: userData.profileImage || "https://via.placeholder.com/100",
          }}
          style={styles.profileImage}
        />

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
          {userData.university || "N/A"}
        </Text>
        <Text style={styles.infoText}>
          <Text style={styles.label}>Email: </Text>
          {userData.email || "N/A"}
        </Text>

        <TouchableOpacity style={styles.button} onPress={handleEditDetails}>
          <Text style={styles.buttonText}>Ændre oplysninger</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.button} onPress={handleForgotPassword}>
          <Text style={styles.buttonText}>Glemt kodeord?</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.button} onPress={handlePrintReviews}>
          <Text style={styles.buttonText}>Print anmeldelser</Text>
        </TouchableOpacity>
      </View>

      {userType === "tutor" && (
        <View style={styles.sessionContainer}>
          <Text style={styles.sessionTitle}>Kommende Tutor-Sessions</Text>
          {userSessions.length > 0 ? (
            userSessions.map((session) => (
              <View key={session.id} style={styles.sessionBox}>
                <Text style={styles.sessionText}>
                  <Text style={styles.label}>Student Message: </Text>
                  {session.studentMessage}
                </Text>
                <Text style={styles.sessionText}>
                  <Text style={styles.label}>Date: </Text>
                  {session.date}
                </Text>
                <Text style={styles.sessionText}>
                  <Text style={styles.label}>Time: </Text>
                  {session.time}
                </Text>
              </View>
            ))
          ) : (
            <Text style={styles.sessionText}>Ingen kommende sessions</Text>
          )}
        </View>
      )}
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
    padding: 10,
    borderColor: "#ddd",
    borderWidth: 1,
    borderRadius: 8,
    marginBottom: 10,
  },
  sessionText: {
    fontSize: 14,
    color: "#555",
  },
});

export default ProfilePage;

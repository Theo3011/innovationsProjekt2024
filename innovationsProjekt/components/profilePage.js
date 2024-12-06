import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  Image,
  StyleSheet,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
  ScrollView,
} from "react-native";
import { getDatabase, ref, onValue, update, remove } from "firebase/database";
import { getAuth } from "firebase/auth";

const ProfilePage = () => {
  const [userData, setUserData] = useState(null);
  const [userSessions, setUserSessions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [userType, setUserType] = useState(null); // "student" or "tutor"

  const auth = getAuth();
  const userId = auth.currentUser?.uid; // Get current logged in userId

  useEffect(() => {
    if (userId) {
      const db = getDatabase();
      const studentRef = ref(db, `students/${userId}`);
      const tutorRef = ref(db, `tutors/${userId}`);

      // Check if user is a student
      onValue(studentRef, (snapshot) => {
        if (snapshot.exists()) {
          setUserType("student");
          setUserData(snapshot.val());
        } else {
          // If not a student, check if the user is a tutor
          onValue(tutorRef, (snapshot) => {
            if (snapshot.exists()) {
              setUserType("tutor");
              setUserData(snapshot.val());
            }
          });
        }
      });

      // Fetch all sessions from Firebase and filter by user involvement
      const sessionsRef = ref(db, "sessions");
      onValue(sessionsRef, (snapshot) => {
        const data = snapshot.val();
        if (data) {
          const filteredSessions = Object.keys(data)
            .map((key) => ({ id: key, ...data[key] }))
            .filter(
              (session) =>
                session.studentId === userId || session.tutorId === userId
            );
          setUserSessions(filteredSessions);
        } else {
          setUserSessions([]);
        }
        setLoading(false);
      });
    }
  }, [userId]);

  const handleSessionAction = async (sessionId, action) => {
    try {
      const db = getDatabase();
      const sessionRef = ref(db, `sessions/${sessionId}`);

      if (action === "accept") {
        // Update session status to "accepted"
        await update(sessionRef, { status: "accepted" });
        Alert.alert("Success", "You have accepted the session!");
      } else if (action === "reject") {
        // Update session status to "rejected"
        await update(sessionRef, { status: "rejected" });
        Alert.alert("Rejected", "The session has been rejected.");
      }
    } catch (error) {
      console.error("Error handling session:", error);
      Alert.alert("Error", "Something went wrong. Please try again.");
    }
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#007BFF" />
        <Text style={styles.loadingText}>Loading profile...</Text>
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

  return (
    <ScrollView style={styles.scrollView}>
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
        </View>

        <View style={styles.sessionContainer}>
          <Text style={styles.sessionTitle}>Sessions</Text>
          {userSessions.length > 0 ? (
            userSessions.map((session) => (
              <View key={session.id} style={styles.sessionBox}>
                <Text style={styles.sessionText}>
                  <Text style={styles.label}>Session ID: </Text>
                  {session.id}
                </Text>
                <Text style={styles.sessionText}>
                  <Text style={styles.label}>
                    {userType === "tutor"
                      ? "Student Message: "
                      : "Tutor Name: "}
                  </Text>
                  {userType === "tutor"
                    ? session.studentMessage
                    : session.tutorName}
                </Text>
                <Text style={styles.sessionText}>
                  <Text style={styles.label}>Date: </Text>
                  {session.date}
                </Text>
                <Text style={styles.sessionText}>
                  <Text style={styles.label}>Time: </Text>
                  {session.time}
                </Text>
                {userType === "tutor" && session.status === "pending" && (
                  <View style={styles.buttonContainer}>
                    <TouchableOpacity
                      style={[styles.button, styles.acceptButton]}
                      onPress={() => handleSessionAction(session.id, "accept")}
                    >
                      <Text style={styles.buttonText}>Accept</Text>
                    </TouchableOpacity>
                    <TouchableOpacity
                      style={[styles.button, styles.rejectButton]}
                      onPress={() => handleSessionAction(session.id, "reject")}
                    >
                      <Text style={styles.buttonText}>Reject</Text>
                    </TouchableOpacity>
                  </View>
                )}
              </View>
            ))
          ) : (
            <Text>No sessions found.</Text>
          )}
        </View>
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  scrollView: {
    flex: 1,
    padding: 10,
  },
  safeview: {
    flex: 1,
  },
  container: {
    alignItems: "center",
    marginVertical: 20,
  },
  profileImage: {
    width: 100,
    height: 100,
    borderRadius: 50,
    marginBottom: 15,
  },
  infoText: {
    fontSize: 16,
    marginVertical: 5,
  },
  label: {
    fontWeight: "bold",
  },
  sessionContainer: {
    marginTop: 30,
  },
  sessionTitle: {
    fontSize: 18,
    fontWeight: "bold",
    marginBottom: 15,
  },
  sessionBox: {
    marginBottom: 15,
    padding: 10,
    borderWidth: 1,
    borderColor: "#ddd",
    borderRadius: 5,
  },
  sessionText: {
    fontSize: 16,
  },
  buttonContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginTop: 10,
  },
  button: {
    padding: 10,
    width: "45%",
    borderRadius: 5,
  },
  acceptButton: {
    backgroundColor: "#4CAF50",
  },
  rejectButton: {
    backgroundColor: "#f44336",
  },
  buttonText: {
    color: "#fff",
    textAlign: "center",
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  loadingText: {
    fontSize: 16,
    marginTop: 10,
  },
  errorText: {
    fontSize: 16,
    color: "red",
  },
});

export default ProfilePage;

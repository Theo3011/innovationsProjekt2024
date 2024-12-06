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
import { getDatabase, ref, onValue, update } from "firebase/database";
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
                session.student?.studentId === userId ||
                session.tutor?.tutorId === userId
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
        <Text style={styles.loadingText}>Loading your sessions...</Text>
      </View>
    );
  }

  return (
    <ScrollView style={styles.container}>
      <View style={styles.profileContainer}>
        {userData && (
          <View style={styles.profileInfo}>
            <Image
              source={{ uri: userData.profileImage }}
              style={styles.profileImage}
            />
            <Text style={styles.userName}>{userData.name}</Text>
            <Text style={styles.userDetails}>Age: {userData.age}</Text>
            <Text style={styles.userDetails}>University: {userData.study}</Text>
            <Text style={styles.userDetails}>Email: {userData.email}</Text>
          </View>
        )}
      </View>

      <Text style={styles.sessionsHeader}>Your Sessions</Text>
      {userSessions.length === 0 ? (
        <Text style={styles.noSessions}>No sessions found.</Text>
      ) : (
        userSessions.map((session) => (
          <View key={session.id} style={styles.sessionContainer}>
            <Text style={styles.sessionText}>Date: {session.student.date}</Text>
            <Text style={styles.sessionText}>Time: {session.student.time}</Text>
            <Text style={styles.sessionText}>
              Message: {session.student.message}
            </Text>

            {session.status === "pending" && (
              <View style={styles.buttonsContainer}>
                <TouchableOpacity
                  style={styles.acceptButton}
                  onPress={() => handleSessionAction(session.id, "accept")}
                >
                  <Text style={styles.buttonText}>Accept</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={styles.rejectButton}
                  onPress={() => handleSessionAction(session.id, "reject")}
                >
                  <Text style={styles.buttonText}>Reject</Text>
                </TouchableOpacity>
              </View>
            )}
          </View>
        ))
      )}
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f5f5f5",
    padding: 20,
  },
  profileContainer: {
    alignItems: "center",
    marginBottom: 20,
  },
  profileInfo: {
    alignItems: "center",
    marginBottom: 20,
  },
  profileImage: {
    width: 100,
    height: 100,
    borderRadius: 50,
    marginBottom: 10,
  },
  userName: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#333",
  },
  userDetails: {
    fontSize: 16,
    color: "#888",
    marginTop: 5,
  },
  sessionsHeader: {
    fontSize: 20,
    fontWeight: "bold",
    color: "#333",
    marginBottom: 10,
  },
  sessionContainer: {
    backgroundColor: "#fff",
    padding: 15,
    marginBottom: 15,
    borderRadius: 8,
    borderColor: "#ddd",
    borderWidth: 1,
  },
  sessionText: {
    fontSize: 16,
    color: "#333",
    marginBottom: 5,
  },
  buttonsContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginTop: 10,
  },
  acceptButton: {
    backgroundColor: "#28a745",
    padding: 10,
    borderRadius: 8,
  },
  rejectButton: {
    backgroundColor: "#dc3545",
    padding: 10,
    borderRadius: 8,
  },
  buttonText: {
    color: "#fff",
    fontWeight: "bold",
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  loadingText: {
    marginTop: 10,
    fontSize: 18,
  },
  noSessions: {
    fontSize: 16,
    color: "#888",
  },
});

export default ProfilePage;

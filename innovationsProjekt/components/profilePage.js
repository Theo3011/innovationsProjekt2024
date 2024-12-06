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
import { getDatabase, ref, get, onValue, update, remove } from "firebase/database";
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

  // Fetch sessions baseret på brugertype
  useEffect(() => {
    if (userId && userType) {
      const db = getDatabase();
      const sessionsRef = ref(
        db,
        userType === "tutor"
          ? `tutors/${userId}/sessions`
          : `students/${userId}/sessions`
      );

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

  // Funktion til at håndtere accept/afvisning
  const handleSessionAction = async (sessionId, action, session) => {
    const db = getDatabase();
    const studentId = session.studentId;
    const tutorId = session.tutorId;

    try {
      if (action === "accept") {
        // Opdater status for både tutor og student
        const tutorSessionRef = ref(db, `tutors/${tutorId}/sessions/${sessionId}`);
        const studentSessionRef = ref(db, `students/${studentId}/sessions/${sessionId}`);

        await update(tutorSessionRef, { status: "accepted" });
        await update(studentSessionRef, { status: "accepted" });

        Alert.alert("Succes", "Session accepteret!");
      } else if (action === "deny") {
        // Fjern session fra både tutor og student
        const tutorSessionRef = ref(db, `tutors/${tutorId}/sessions/${sessionId}`);
        const studentSessionRef = ref(db, `students/${studentId}/sessions/${sessionId}`);

        await remove(tutorSessionRef);
        await remove(studentSessionRef);

        Alert.alert("Succes", "Session afvist!");
      }
    } catch (error) {
      console.error(error);
      Alert.alert("Fejl", "Noget gik galt. Prøv igen.");
    }
  };

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

  return (
    <ScrollView style={styles.safeview}>
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
        <Text style={styles.sessionTitle}>
          {userType === "tutor"
            ? "Kommende Tutor-Sessions"
            : "Kommende Sessions"}
        </Text>
        {userSessions.length > 0 ? (
          userSessions.map((session) => (
            <View key={session.id} style={styles.sessionBox}>
              <Text style={styles.sessionText}>
                <Text style={styles.label}>
                  {userType === "tutor" ? "Student Message: " : "Tutor Name: "}
                </Text>
                {userType === "tutor" ? session.studentMessage : session.tutorName}
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
                <View style={styles.actionButtons}>
                  <TouchableOpacity
                    style={[styles.button, styles.acceptButton]}
                    onPress={() => handleSessionAction(session.id, "accept", session)}
                  >
                    <Text style={styles.buttonText}>Accepter</Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    style={[styles.button, styles.denyButton]}
                    onPress={() => handleSessionAction(session.id, "deny", session)}
                  >
                    <Text style={styles.buttonText}>Afvis</Text>
                  </TouchableOpacity>
                </View>
              )}
            </View>
          ))
        ) : (
          <Text style={styles.sessionText}>Ingen kommende sessions</Text>
        )}
      </View>
    </ScrollView>
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
  actionButtons: {
    flexDirection: "row",
    justifyContent: "space-around",
    marginTop: 10,
  },
  button: {
    padding: 10,
    borderRadius: 8,
    alignItems: "center",
    width: "45%",
  },
  acceptButton: {
    backgroundColor: "#28a745",
  },
  denyButton: {
    backgroundColor: "#dc3545",
  },
  buttonText: {
    color: "#fff",
    fontSize: 14,
    fontWeight: "bold",
  },
});

export default ProfilePage;

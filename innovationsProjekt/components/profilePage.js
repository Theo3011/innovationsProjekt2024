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
            fetchSessions("students", userId);
          } else {
            // Hvis ikke en student, tjek om brugeren er en tutor
            get(tutorRef)
              .then((snapshot) => {
                if (snapshot.exists()) {
                  setUserType("tutor");
                  setUserData(snapshot.val());
                  fetchSessions("tutors", userId);
                } else {
                  console.log("Bruger ikke fundet i students eller tutors.");
                }
              })
              .catch((error) =>
                console.error("Fejl ved hentning af tutor-data:", error)
              );
          }
        })
        .catch((error) => console.error("Fejl ved hentning af student-data:", error))
        .finally(() => setLoading(false));
    }
  }, [userId]);

  const fetchSessions = (userPath, id) => {
    const db = getDatabase();
    const sessionsRef = ref(db, `${userPath}/${id}/sessions`);

    onValue(sessionsRef, (snapshot) => {
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
  };

  const handleSessionAction = async (sessionId, studentId, action) => {
    try {
      const db = getDatabase();

      if (action === "accept") {
        // Opdater status til "accepted" for både tutor og student
        const tutorSessionRef = ref(db, `tutors/${userId}/sessions/${sessionId}`);
        const studentSessionRef = ref(db, `students/${studentId}/sessions/${sessionId}`);
        await update(tutorSessionRef, { status: "accepted" });
        await update(studentSessionRef, { status: "accepted" });

        Alert.alert("Succes", "Du har accepteret sessionen!");
      } else if (action === "reject") {
        // Fjern sessionen fra tutorens data
        const tutorSessionRef = ref(db, `tutors/${userId}/sessions/${sessionId}`);
        await remove(tutorSessionRef);

        // Opdater status til "rejected" for studenten
        const studentSessionRef = ref(db, `students/${studentId}/sessions/${sessionId}`);
        await update(studentSessionRef, { status: "rejected" });

        Alert.alert("Afvist", "Studenten er blevet informeret om afvisningen.");
      }
    } catch (error) {
      console.error("Fejl ved håndtering af session:", error);
      Alert.alert("Fejl", "Noget gik galt. Prøv igen.");
    }
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#007BFF" />
        <Text style={styles.loadingText}>Indlæser profil...</Text>
      </View>
    );
  }

  if (!userData) {
    return (
      <View style={styles.container}>
        <Text style={styles.errorText}>Ingen brugerdata tilgængelig.</Text>
      </View>
    );
  }

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
          <Text style={styles.label}>Navn: </Text>
          {userData.name || "N/A"}
        </Text>
        <Text style={styles.infoText}>
          <Text style={styles.label}>Alder: </Text>
          {userData.age || "N/A"}
        </Text>
        <Text style={styles.infoText}>
          <Text style={styles.label}>Universitet: </Text>
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
                <Text style={styles.label}>Dato: </Text>
                {session.date}
              </Text>
              <Text style={styles.sessionText}>
                <Text style={styles.label}>Tid: </Text>
                {session.time}
              </Text>
              {userType === "tutor" && session.status === "pending" && (
                <View style={styles.buttonContainer}>
                  <TouchableOpacity
                    style={[styles.button, styles.acceptButton]}
                    onPress={() =>
                      handleSessionAction(session.id, session.studentId, "accept")
                    }
                  >
                    <Text style={styles.buttonText}>Accepter</Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    style={[styles.button, styles.rejectButton]}
                    onPress={() =>
                      handleSessionAction(session.id, session.studentId, "reject")
                    }
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
    </View>
  );
};

const styles = StyleSheet.create({
  safeview: { flex: 1, backgroundColor: "#f5f5f5" },
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
  sessionContainer: {
    backgroundColor: "#ffffff",
    padding: 20,
    margin: 20,
    borderRadius: 10,
    elevation: 3,
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
  buttonContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginTop: 10,
  },
  acceptButton: {
    backgroundColor: "#4CAF50",
    padding: 10,
    borderRadius: 5,
    flex: 1,
    marginRight: 5,
  },
  rejectButton: {
    backgroundColor: "#F44336",
    padding: 10,
    borderRadius: 5,
    flex: 1,
    marginLeft: 5,
  },
  buttonText: {
    color: "#fff",
    textAlign: "center",
  },
  sessionTitle: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#333",
    marginBottom: 10,
  },
});

export default ProfilePage;

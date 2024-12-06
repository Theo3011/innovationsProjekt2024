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
import {
  getDatabase,
  ref,
  get,
  onValue,
  update,
  remove,
  push,
  set,
} from "firebase/database";
import { getAuth } from "firebase/auth";

const ProfilePage = () => {
  const [userData, setUserData] = useState(null);
  const [userSessions, setUserSessions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [userType, setUserType] = useState(null); // "student" or "tutor"
  const [studentId, setStudentId] = useState(null); // Store studentId if needed
  const [tutorId, setTutorId] = useState(null); // Store tutorId if needed

  const auth = getAuth();
  const userId = auth.currentUser?.uid; // Get current logged in userId

  useEffect(() => {
    if (userId) {
      const db = getDatabase();
      const studentRef = ref(db, `students/${userId}`);
      const tutorRef = ref(db, `tutors/${userId}`);

      // Check if user is a student
      get(studentRef)
        .then((snapshot) => {
          if (snapshot.exists()) {
            setUserType("student");
            setUserData(snapshot.val());
            setStudentId(userId); // Store studentId
            fetchSessions("students", userId);
          } else {
            // If not a student, check if the user is a tutor
            get(tutorRef)
              .then((snapshot) => {
                if (snapshot.exists()) {
                  setUserType("tutor");
                  setUserData(snapshot.val());
                  setTutorId(userId); // Store tutorId
                  fetchSessions("tutors", userId);
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

  const fetchSessions = (userPath, id) => {
    const db = getDatabase();
    const sessionsRef = ref(db, `${userPath}/${id}/sessions`);

    onValue(sessionsRef, (snapshot) => {
      const data = snapshot.val();
      if (data) {
        const sessionsArray = Object.keys(data).map((key) => ({
          id: key, // Session ID
          ...data[key],
        }));
        setUserSessions(sessionsArray);
      } else {
        setUserSessions([]);
      }
    });
  };

  const createSession = async (studentId, tutorId, sessionData) => {
    const db = getDatabase();
    const sessionRef = ref(db, "sessions"); // A common "sessions" location
    const newSessionRef = push(sessionRef); // Generates a unique ID

    const sessionId = newSessionRef.key; // This session ID will be the same for both tutor and student

    // Set the session for the tutor
    const tutorSessionRef = ref(db, `tutors/${tutorId}/sessions/${sessionId}`);
    await set(tutorSessionRef, {
      ...sessionData,
      status: "pending", // Initial status
      studentId: studentId,
    });

    // Set the session for the student
    const studentSessionRef = ref(
      db,
      `students/${studentId}/sessions/${sessionId}`
    );
    await set(studentSessionRef, {
      ...sessionData,
      status: "pending", // Initial status
      tutorId: tutorId,
    });

    // Optionally, add the session to the main "sessions" path as well if you want to store it globally
    const globalSessionRef = ref(db, `sessions/${sessionId}`);
    await set(globalSessionRef, {
      ...sessionData,
      status: "pending", // Initial status
      studentId: studentId,
      tutorId: tutorId,
    });
  };

  const handleSessionAction = async (sessionId, studentId, action) => {
    try {
      const db = getDatabase();

      if (action === "accept") {
        // Update session status to "accepted" for both tutor and student
        const tutorSessionRef = ref(
          db,
          `tutors/${userId}/sessions/${sessionId}`
        );
        const studentSessionRef = ref(
          db,
          `students/${studentId}/sessions/${sessionId}`
        );

        await update(tutorSessionRef, { status: "accepted" });
        await update(studentSessionRef, { status: "accepted" });

        Alert.alert("Success", "You have accepted the session!");
      } else if (action === "reject") {
        // Remove session from tutor's data (if the tutor is rejecting the session)
        const tutorSessionRef = ref(
          db,
          `tutors/${userId}/sessions/${sessionId}`
        );
        await remove(tutorSessionRef);

        // Update session status to "rejected" for student (if rejecting)
        const studentSessionRef = ref(
          db,
          `students/${studentId}/sessions/${sessionId}`
        );
        await update(studentSessionRef, { status: "rejected" });

        Alert.alert(
          "Rejected",
          "The student has been informed of the rejection."
        );
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
          <Text style={styles.sessionTitle}>
            {userType === "tutor"
              ? "Upcoming Tutor Sessions"
              : "Upcoming Sessions"}
          </Text>
          {userSessions.length > 0 ? (
            userSessions.map((session) => (
              <View key={session.id} style={styles.sessionBox}>
                <Text style={styles.sessionText}>
                  <Text style={styles.label}>Session ID: </Text>
                  {session.id} {/* Vist session ID */}
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
                      onPress={() =>
                        handleSessionAction(
                          session.id,
                          session.studentId,
                          "accept"
                        )
                      }
                    >
                      <Text style={styles.buttonText}>Accept</Text>
                    </TouchableOpacity>
                    <TouchableOpacity
                      style={[styles.button, styles.rejectButton]}
                      onPress={() =>
                        handleSessionAction(
                          session.id,
                          session.studentId,
                          "reject"
                        )
                      }
                    >
                      <Text style={styles.buttonText}>Reject</Text>
                    </TouchableOpacity>
                  </View>
                )}
              </View>
            ))
          ) : (
            <Text>No upcoming sessions.</Text>
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

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
import Icon from "react-native-vector-icons/FontAwesome";

// profilePage komponent
const ProfilePage = () => {
  // state til brugerdata, sessioner, loading status og brugertype
  const [userData, setUserData] = useState(null);
  const [userSessions, setUserSessions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [userType, setUserType] = useState(null);

  // henter nuværende bruger-id fra firebase
  const auth = getAuth();
  const userId = auth.currentUser?.uid;

  // henter brugerdata og sessioner fra Firebase
  useEffect(() => {
    if (userId) {
      const db = getDatabase();
      const studentRef = ref(db, `students/${userId}`);
      const tutorRef = ref(db, `tutors/${userId}`);

      // kontrollerer om brugeren er en student
      onValue(studentRef, (snapshot) => {
        if (snapshot.exists()) {
          setUserType("student");
          setUserData(snapshot.val());
        } else {
          // hvis ikke en student, tjekker om brugeren er tutor
          onValue(tutorRef, (snapshot) => {
            if (snapshot.exists()) {
              setUserType("tutor");
              setUserData(snapshot.val());
            }
          });
        }
      });

      // henter alle sessioner og filtrer dem baseret på brugerens deltagelse
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
        setLoading(false); // sætter loading status til false, når data er hentet
      });
    }
  }, [userId]);

  // håndtere handlinger for sessioner (accepteret/afvist)
  const handleSessionAction = async (sessionId, action) => {
    try {
      const db = getDatabase();
      const sessionRef = ref(db, `sessions/${sessionId}`);

      // Opdaterer sessionstatus til accepteret
      if (action === "accept") {
        await update(sessionRef, {
          "student/status": "accepted",
          "tutor/status": "accepted",
        });
        Alert.alert("Success", "Session accepted!");
      }
      // fjerner sessionen hvis den afvises
      else if (action === "reject") {
        await remove(sessionRef);
        Alert.alert("Rejected", "Session has been deleted.");
      }
    } catch (error) {
      console.error("Error handling session:", error);
      Alert.alert("Error", "Something went wrong. Please try again.");
    }
  };

  // henter indikatorer mens data hentes
  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#007BFF" />
        <Text style={styles.loadingText}>Loading your sessions...</Text>
      </View>
    );
  }

  // brugerprofil og sessioner
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

            <View style={styles.starsContainer}>
              {Array(5)
                .fill(null)
                .map((_, index) => (
                  <Icon
                    key={index}
                    name="star-o"
                    size={24}
                    color="#FFD700"
                    style={styles.starIcon}
                  />
                ))}
            </View>
          </View>
        )}
      </View>

      {/* viser sessioner */}
      <Text style={styles.sessionsHeader}>Your Sessions</Text>
      {userSessions.length === 0 ? (
        <Text style={styles.noSessions}>No sessions found.</Text>
      ) : (
        userSessions.map((session) => (
          <View key={session.id} style={styles.sessionContainer}>
            {/* viser session information */}
            <Text style={styles.sessionText}>Date: {session.student.date}</Text>
            <Text style={styles.sessionText}>Time: {session.student.time}</Text>
            <Text style={styles.sessionText}>
              Message: {session.student.message}
            </Text>

            {/* viser stjerner for hver session */}
            <View style={styles.starsContainer}>
              {Array(5)
                .fill(null)
                .map((_, index) => (
                  <Icon
                    key={index}
                    name="star-o"
                    size={20}
                    color="#FFD700"
                    style={styles.starIcon}
                  />
                ))}
            </View>

            {/* Vis accept/afvis knapper for sessioner med status "pending" og hvis brugeren er tutor */}
            {session.student.status === "pending" && userType === "tutor" && (
              <View style={styles.buttonsContainer}>
                <TouchableOpacity
                  style={styles.acceptButton}
                  onPress={() => handleSessionAction(session.id, "accept")}
                >
                  <Text style={styles.buttonText}>Accepter</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={styles.rejectButton}
                  onPress={() => handleSessionAction(session.id, "reject")}
                >
                  <Text style={styles.buttonText}>afvis</Text>
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
  starsContainer: {
    flexDirection: "row",
    marginTop: 10,
  },
  starIcon: {
    marginHorizontal: 5,
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

import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Image,
  Alert,
} from "react-native";
import { getDatabase, ref, get } from "firebase/database";
import { useNavigation } from "@react-navigation/native";
import { getAuth } from "firebase/auth";

const ViewOffer = ({ route }) => {
  // Modtag parametre fra navigation
  const {
    name,
    exam,
    price,
    type,
    description,
    receiverIdq,
    imageUrl,
    createdByUserId,
  } = route.params; // Tilføj createdByUserId
  const navigation = useNavigation();
  const auth = getAuth();
  const currentUserId = auth.currentUser?.uid; // Den aktuelle bruger
  const [userRole, setUserRole] = useState(null);

  // Hent brugerens rolle (studenter eller tutor)
  useEffect(() => {
    const fetchUserRole = async () => {
      if (createdByUserId) {
        const db = getDatabase();

        // Kontroller om createdByUserId findes under "students"
        const studentRef = ref(db, "students/" + createdByUserId);
        const studentSnapshot = await get(studentRef);

        // Hvis den findes under "students", så er det en studerende
        if (studentSnapshot.exists()) {
          setUserRole("student");
          return;
        }

        // Ellers, kontroller om createdByUserId findes under "tutors"
        const tutorRef = ref(db, "tutors/" + createdByUserId);
        const tutorSnapshot = await get(tutorRef);

        // Hvis den findes under "tutors", så er det en tutor
        if (tutorSnapshot.exists()) {
          setUserRole("tutor");
          return;
        }

        // Hvis det ikke findes i nogen af delene, sæt userRole til null
        setUserRole(null);
      }
    };

    fetchUserRole();
  }, [createdByUserId]);

  const handleStartChat = async () => {
    if (!currentUserId || !receiverIdq) {
      Alert.alert("Fejl", "Kunne ikke finde brugeren eller tutorens ID.");
      console.error(
        "currentUserId:",
        currentUserId,
        "receiverIdq:",
        receiverIdq
      ); // Debug-log
      return;
    }

    try {
      const db = getDatabase();
      const chatsRef = ref(db, "chats");

      // Opret en ny chat mellem den aktuelle bruger og tutoren
      const newChatRef = push(chatsRef);
      const chatId = newChatRef.key;

      const chatData = {
        participants: [currentUserId, receiverIdq],
        messages: [],
        lastMessage: "",
        timestamp: Date.now(),
      };

      // Gem chatdata i Firebase
      await set(newChatRef, chatData);

      // Naviger til PrivateChat og send chatId og tutorens navn
      navigation.navigate("PrivateChat", { chatId, tutorName: name });
    } catch (error) {
      Alert.alert("Fejl", "Kunne ikke starte en chat. Prøv igen.");
      console.error(error);
    }
  };

  return (
    <ScrollView style={styles.container}>
      {/* Dynamisk overskrift */}
      <Text style={styles.header}>
        {userRole === "tutor"
          ? "Tutor opslag"
          : userRole === "student"
          ? "Studerendes opslag"
          : "Udefineret bruger"}
      </Text>

      <View style={styles.profileSection}>
        {/* Hvis der er et billede-URL, vis det */}
        {imageUrl ? (
          <Image source={{ uri: imageUrl }} style={styles.imageStyle} />
        ) : (
          <View style={styles.placeholder}></View>
        )}
        <Text style={styles.name}>{name}</Text>
      </View>

      {/* Vis detaljer om tilbuddet */}
      <Text>Eksamen: {exam || "Ikke angivet"}</Text>
      <Text>Pris/time: {price} DKK</Text>
      <Text>Undervisningstype: {type || "Ikke angivet"}</Text>
      <Text>Beskrivelse: {description || "Ingen beskrivelse tilgængelig"}</Text>

      {/* Knap til at starte en chat */}
      <TouchableOpacity style={styles.button} onPress={handleStartChat}>
        <Text style={styles.buttonText}>Start chat</Text>
      </TouchableOpacity>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: { padding: 20, backgroundColor: "#fff" },
  header: { fontSize: 24, fontWeight: "bold", marginBottom: 20 },
  profileSection: {
    flexDirection: "row",
    marginBottom: 20,
    alignItems: "center",
  },
  imageStyle: {
    width: 70,
    height: 70,
    borderRadius: 35,
    marginRight: 10,
  },
  placeholder: {
    width: 70,
    height: 70,
    borderRadius: 35,
    backgroundColor: "#ccc",
  },
  name: { fontSize: 18, fontWeight: "bold" },
  button: {
    marginTop: 20,
    padding: 10,
    backgroundColor: "#007bff",
    borderRadius: 5,
  },
  buttonText: { color: "#fff", textAlign: "center" },
});

export default ViewOffer;

import React from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Image,
  Alert,
} from "react-native";
import { getDatabase, ref, push, set } from "firebase/database";
import { useNavigation } from "@react-navigation/native";
import { getAuth } from "firebase/auth";

const ViewOffer = ({ route }) => {
  const { name, exam, price, type, description, tutorId } = route.params; // Tilføj tutorId
  const navigation = useNavigation();
  const auth = getAuth();
  const currentUserId = auth.currentUser?.uid; // Den aktuelle bruger

  const handleStartChat = async () => {
    if (!currentUserId || !tutorId) {
      Alert.alert("Fejl", "Kunne ikke finde brugeren eller tutorens ID.");
      console.error("currentUserId:", currentUserId, "tutorId:", tutorId); // Debug-log
      return;
    }

    try {
      const db = getDatabase();
      const chatsRef = ref(db, "chats");

      // Opret en ny chat mellem den aktuelle bruger og tutoren
      const newChatRef = push(chatsRef);
      const chatId = newChatRef.key;

      const chatData = {
        participants: [currentUserId, tutorId],
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
      <Text style={styles.header}>Tutor opslag</Text>
      <View style={styles.profileSection}>
        <Image style={styles.profileImage} />
        <View style={styles.details}>
          <Text>Name: {name}</Text>
          <Text>Eksamen: {exam}</Text>
          <Text>Pris/time: {price} DKK</Text>
          <Text>Undervisningstype: {type}</Text>
        </View>
      </View>

      <Text style={styles.subHeader}>Beskrivelse:</Text>
      <Text style={styles.description}>{description}</Text>

      <View style={styles.buttonContainer}>
        <TouchableOpacity style={styles.button} onPress={handleStartChat}>
          <Text style={styles.buttonText}>Skriv til tutor</Text>
        </TouchableOpacity>
        <TouchableOpacity style={[styles.button, styles.secondaryButton]}>
          <Text style={[styles.buttonText, styles.secondaryButtonText]}>
            Book session
          </Text>
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f5f5f5",
    padding: 20,
  },
  header: {
    fontSize: 24,
    fontWeight: "bold",
    marginBottom: 20,
    color: "#333",
    textAlign: "center",
  },
  profileSection: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 20,
  },
  profileImage: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: "#ddd",
    marginRight: 20,
  },
  details: {
    flex: 1,
  },
  subHeader: {
    fontSize: 18,
    fontWeight: "bold",
    marginBottom: 10,
  },
  description: {
    fontSize: 16,
    color: "#555",
    marginBottom: 20,
  },
  buttonContainer: {
    flexDirection: "row",
    justifyContent: "space-around",
  },
  button: {
    padding: 15,
    backgroundColor: "#007BFF",
    borderRadius: 10,
    flex: 1,
    alignItems: "center",
    marginHorizontal: 5,
  },
  buttonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "bold",
  },
  secondaryButton: {
    backgroundColor: "#f0f0f0",
  },
  secondaryButtonText: {
    color: "#007BFF",
  },
});

export default ViewOffer;

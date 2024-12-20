import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Image,
  Alert,
} from "react-native";
import { getDatabase, ref, get, push, set } from "firebase/database"; // Importerer firebase funktioner vi skal bruge her på siden
import { useNavigation } from "@react-navigation/native";
import { getAuth } from "firebase/auth";

// vores komponent der viser detaljer på opslaget der postes
const ViewOffer = ({ route }) => {
  const {
    name,
    exam,
    price,
    type,
    description,
    receiverId,
    imageUrl, 
    createdByUserId, // ID på den bruger der har oprettet opslaget
  } = route.params; 

  const navigation = useNavigation();
  const auth = getAuth();
  const currentUserId = auth.currentUser?.uid; // henter den nuværende brugers ID
  const [userRole, setUserRole] = useState(null); // vi bruger state til at gemme brugers rolle ( er de enten tutor eller student)

  // henter brugerrollen på brugeren baseret på deres bruger ID
  useEffect(() => {
    const fetchUserRole = async () => {
      if (createdByUserId) {
        const db = getDatabase();
        const userRef = ref(db, "users/" + createdByUserId); // Stien til brugerdataen i firebase
        const snapshot = await get(userRef);
        if (snapshot.exists()) {
          const userData = snapshot.val();
          setUserRole(userData.role); // opdater state med deres rolle (tutor eller student)
        }
      }
    };

    fetchUserRole(); // vi kalder funktionen
  }, [createdByUserId]);


// bruger denne funktion til at starte en chat mellem tutor og den studerne 
  const handleStartChat = async () => {
    if (!currentUserId || !receiverId) {
      Alert.alert("Fejl", "Kunne ikke finde brugeren eller tutorens ID.");
      console.error("currentUserId:", currentUserId, "receiverId:", receiverId);
      return;
    }

    try {
      const db = getDatabase();
      const chatsRef = ref(db, "chats");

      // Opretter en ny chat mellem den aktuelle bruger og tutoren ved brugen af push
      const newChatRef = push(chatsRef); 
      const chatId = newChatRef.key; // får det unikke ID der er for den givet chat

      const chatData = {
        participants: [currentUserId, receiverId],
        messages: [],
        lastMessage: "",
        timestamp: Date.now(),
      };

      // Gemmer chatdataen i Firebase
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
        {userRole === "tutor" ? "Tutor opslag" : "Studerendes opslag"}
      </Text>

      <View style={styles.profileSection}>
        {/* Hvis der er et billede-URL, vises det her */}
        {imageUrl ? (
          <Image source={{ uri: imageUrl }} style={styles.profileImage} />
        ) : (
          <View style={styles.placeholder}></View>
        )}
        <View style={styles.details}>
          <Text>Name: {name || "Ukendt bruger"}</Text>
          <Text>Eksamen: {exam || "Ikke angivet"}</Text>
          <Text>Pris/time: {price} DKK</Text>
          <Text>Undervisningstype: {type || "Ikke angivet"}</Text>
        </View>
      </View>

      <Text style={styles.subHeader}>Beskrivelse:</Text>
      <Text style={styles.description}>
        {description || "Ingen beskrivelse"}
      </Text>

      <View style={styles.buttonContainer}>
        <TouchableOpacity style={styles.button} onPress={handleStartChat}>
          <Text style={styles.buttonText}>Skriv til tutor</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.button, styles.secondaryButton]}
          onPress={() =>
            navigation.navigate("BookSession", {
              tutorId: receiverId,
              tutorName: name,
            })
          }
        >
          <Text style={[styles.buttonText, styles.secondaryButtonText]}>
            Book session
          </Text>
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
};

//styling af siden 
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
  placeholder: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: "#ccc",
    marginRight: 20,
  },
});

export default ViewOffer;

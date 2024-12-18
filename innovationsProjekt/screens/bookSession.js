// importering af moduler
import React, { useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  Alert,
} from "react-native";
import DateTimePicker from "@react-native-community/datetimepicker";
import { getDatabase, ref, push, set, onValue } from "firebase/database";
import { useRoute } from "@react-navigation/native";
import { getAuth } from "firebase/auth";

// States til dato, tid og deres tilhørende visningstilstande
const BookSession = () => {
  const [date, setDate] = useState(new Date());
  const [time, setTime] = useState(new Date());
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [showTimePicker, setShowTimePicker] = useState(false);
  const [message, setMessage] = useState("");

  // Hent parametre fra rute (tutorens ID og navn, som sendes til denne skærm)
  const route = useRoute();
  const { tutorId } = route.params; // modtager tutorens ID og navn

  // Hent den aktuelle bruger altså studentens ID
  const auth = getAuth();
  const currentUserId = auth.currentUser?.uid;

  // Håndter ændring af dato
  const handleDateChange = (event, selectedDate) => {
    if (selectedDate) {
      setDate(new Date(selectedDate));
    }
    setShowDatePicker(false); // lukker dato vælger, når tid valgt
  };

  // Håndter ændring af tid
  const handleTimeChange = (event, selectedTime) => {
    if (selectedTime) {
      setTime(new Date(selectedTime));
    }
    setShowTimePicker(false);
  };

  // Håndtering af afsendelse når brugeren sender anmodning
  const handleSendRequest = async () => {
    //hvis beskeden er tom:
    if (!message.trim()) {
      Alert.alert("Fejl", "Beskeden må ikke være tom.");
      return;
    }

    // hvis tutorens ID ikke kan findes, tager den højde for det her. Det er essentielt, f.eks. hvis en studerende vælger en andens studerendes opslag, så kan det ikke lade sig gøre.
    if (!tutorId) {
      Alert.alert("Fejl", "Tutor ID mangler.");
      console.error("Tutor ID is undefined.");
      return;
    }

    try {
      const db = getDatabase(); // henter Firebase-databasen
      const timestamp = Date.now();

      // henter studentens navn fra databasen
      const userRef = ref(db, `users/${currentUserId}`); // henter studerende data, udfra det hentede ID
      let senderName = "Ukendt Bruger"; // hvis navnet ikke findes, skriver den i stedet ukendt bruger. Dette sikrer, at applikationen ikke crasher.

      // asynkront opslag for at hente studentens navn
      await new Promise((resolve, reject) => {
        onValue(
          userRef,
          (snapshot) => {
            const userData = snapshot.val();
            if (userData && userData.name) {
              senderName = userData.name;
            }
            resolve(); // afslutter opslaget
          },
          {
            onlyOnce: true, // sørger for kun at lytte en gang
          }
        );
      });

      // Formaterer dato og tid
      const formattedDate =
        date instanceof Date
          ? date.toISOString().split("T")[0]
          : "Ugyldig dato";
      const formattedTime =
        time instanceof Date
          ? time.toISOString().split("T")[1].slice(0, 5)
          : "Ugyldig tid";

      // opretter en ny session i Firebase
      const sessionRef = ref(db, "sessions"); // reference til sessions-databasen
      const newSessionRef = push(sessionRef); // opretter en ny session
      const sessionId = newSessionRef.key; // gemmer sessionens unikke ID, som senere skal bruges under profilePage.js

      // data for sessionen
      const sessionData = {
        tutor: {
          tutorId: tutorId, // ID for den valgte tutor
          status: "pending", // denne status vidersendes til profilePage.js. Dermed kan profilePage.js tage højde for, at det ikke er accepteret eller afvist endnu
        },
        student: {
          studentId: currentUserId,
          studentName: senderName,
          status: "pending",
          message: message,
          date: formattedDate,
          time: formattedTime,
          timestamp,
        },
        timestamp,
      };

      // gemmer sessionen i databasen
      await set(newSessionRef, sessionData);

      // opret en besked i tutorens chat, så begge parter får besked hvor og hvordan det skal oprettes. Dette fungerer dermed også som en notifikation.
      const chatRef = ref(db, `chats/${tutorId}/messages`);
      const formattedMessage = `**${senderName} har anmodet session den ${formattedDate}, klokken ${formattedTime}. Du kan acceptere anmodningen under Min Profil -> Kommende Sessioner.**\n\n${message}`; // Dette bliver altså alt i alt sendt ind som en chat, med adapteret data alt efter hvem der sender.

      // Send beskeden til tutorens chat
      await push(chatRef, {
        text: formattedMessage,
        senderId: currentUserId,
        senderName: senderName,
        timestamp,
      });

      Alert.alert("Succes", "Anmodning sendt!"); // giver brugeren feedback, hvis der er succes ved booking
    } catch (error) {
      console.error(error);
      Alert.alert("Fejl", "Noget gik galt. Prøv igen."); // giver brugeren feedback ved fejl
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.header}>Book session</Text>
      <TouchableOpacity
        style={styles.dateButton}
        onPress={() => setShowDatePicker(true)}
      >
        <Text style={styles.buttonText}>Vælg dato</Text>
      </TouchableOpacity>
      {showDatePicker && (
        <DateTimePicker
          value={date}
          mode="date"
          display="default"
          onChange={handleDateChange}
        />
      )}

      <Text style={styles.selectedText}>
        Valgt dato:{" "}
        {date instanceof Date
          ? date.toISOString().split("T")[0]
          : "Ugyldig dato"}
      </Text>
      <TouchableOpacity
        style={styles.dateButton}
        onPress={() => setShowTimePicker(true)}
      >
        <Text style={styles.buttonText}>Vælg tid</Text>
      </TouchableOpacity>
      {showTimePicker && (
        <DateTimePicker
          value={time} // Den valgte tid
          mode="time" // Vælg tid-mode
          display="default"
          onChange={handleTimeChange}
        />
      )}
      {/* Viser den valgte tid */}
      <Text style={styles.selectedText}>
        Valgt tid:{" "}
        {time instanceof Date
          ? time.toISOString().split("T")[1].slice(0, 5)
          : "Ugyldig tid"}
      </Text>

      {/* Tekstinput til besked */}
      <TextInput
        style={styles.textInput}
        placeholder="Skriv en besked til tutor..."
        placeholderTextColor="#888"
        multiline
        value={message}
        onChangeText={setMessage}
      />

      {/* send-knappen */}
      <TouchableOpacity style={styles.sendButton} onPress={handleSendRequest}>
        <Text style={styles.buttonText}>Send anmodning</Text>
      </TouchableOpacity>
    </View>
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
  dateButton: {
    backgroundColor: "#007BFF",
    padding: 15,
    borderRadius: 8,
    alignItems: "center",
    marginVertical: 10,
  },
  sendButton: {
    backgroundColor: "#007BFF",
    padding: 15,
    borderRadius: 8,
    alignItems: "center",
    marginTop: 20,
  },
  buttonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "bold",
  },
  textInput: {
    borderWidth: 1,
    borderColor: "#ccc",
    borderRadius: 8,
    padding: 15,
    fontSize: 16,
    marginTop: 20,
    backgroundColor: "#fff",
    color: "#333",
  },
  selectedText: {
    fontSize: 16,
    color: "#333",
    marginVertical: 5,
  },
});

export default BookSession;

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
import { getDatabase, ref, push, set } from "firebase/database";
import { useRoute } from "@react-navigation/native";
import { getAuth } from "firebase/auth";

const BookSession = () => {
  const [date, setDate] = useState(new Date());
  const [time, setTime] = useState(new Date());
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [showTimePicker, setShowTimePicker] = useState(false);
  const [message, setMessage] = useState("");
  const route = useRoute();

  const { tutorId, tutorName } = route.params; // Modtag tutorId og tutorName
  const auth = getAuth();
  const currentUserId = auth.currentUser?.uid;

  const handleDateChange = (event, selectedDate) => {
    const currentDate = selectedDate || date;
    setShowDatePicker(false);
    setDate(currentDate);
  };

  const handleTimeChange = (event, selectedTime) => {
    const currentTime = selectedTime || time;
    setShowTimePicker(false);
    setTime(currentTime);
  };

  const handleSendRequest = async () => {
    if (!message.trim()) {
      Alert.alert("Fejl", "Beskeden må ikke være tom.");
      return;
    }

    if (!tutorId) {
      Alert.alert("Fejl", "Tutor ID mangler.");
      console.error("Tutor ID is undefined.");
      return;
    }

    try {
      const db = getDatabase();
      const timestamp = Date.now();

      // Opret session
      const sessionRef = ref(db, "sessions");
      const newSessionRef = push(sessionRef);
      const sessionId = newSessionRef.key;

      const sessionData = {
        tutor: {
          tutorId: tutorId,
          status: "pending",
        },
        student: {
          studentId: currentUserId,
          status: "pending",
          message: message,
          date: date.toISOString().split("T")[0],
          time: time.toISOString().split("T")[1].slice(0, 5),
          timestamp,
        },
        timestamp,
      };

      await set(newSessionRef, sessionData);

      // Opret besked i tutorens chat
      const chatRef = ref(db, `chats/${tutorId}/messages`);
      const formattedMessage = `**Vedkommende har anmodet session den ${
        date.toISOString().split("T")[0]
      }, klokken ${time
        .toISOString()
        .split("T")[1]
        .slice(
          0,
          5
        )}. Du kan acceptere anmodningen under Min Profil -> Kommende Sessioner.**\n\n${message}`;

      await push(chatRef, {
        text: formattedMessage,
        timestamp,
      });

      Alert.alert("Succes", "Anmodning sendt!");
    } catch (error) {
      console.error(error);
      Alert.alert("Fejl", "Noget gik galt. Prøv igen.");
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
        Valgt dato: {date.toISOString().split("T")[0]}
      </Text>
      <TouchableOpacity
        style={styles.dateButton}
        onPress={() => setShowTimePicker(true)}
      >
        <Text style={styles.buttonText}>Vælg tid</Text>
      </TouchableOpacity>
      {showTimePicker && (
        <DateTimePicker
          value={time}
          mode="time"
          display="default"
          onChange={handleTimeChange}
        />
      )}
      <Text style={styles.selectedText}>
        Valgt tid: {time.toISOString().split("T")[1].slice(0, 5)}
      </Text>
      <TextInput
        style={styles.textInput}
        placeholder="Skriv en besked til tutor..."
        placeholderTextColor="#888"
        multiline
        value={message}
        onChangeText={setMessage}
      />
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

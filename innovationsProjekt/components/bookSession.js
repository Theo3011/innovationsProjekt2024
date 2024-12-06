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

  const { tutorId, tutorName } = route.params; // Modtag receiverId som tutorId
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
  
      // Chat data
      const chatsRef = ref(db, "chats");
      const newChatRef = push(chatsRef);
      const chatId = newChatRef.key;
  
      const chatData = {
        participants: [currentUserId, tutorId],
        messages: [
          {
            sender: currentUserId,
            text: message,
            timestamp,
          },
        ],
        lastMessage: message,
        timestamp,
      };
  
      await set(newChatRef, chatData);
  
      // Tutor sessions data
      const tutorSessionsRef = ref(db, `tutors/${tutorId}/sessions`);
      const newTutorSessionRef = push(tutorSessionsRef);
  
      const sessionData = {
        studentId: currentUserId,
        studentMessage: message,
        date: date.toISOString().split("T")[0],
        time: time.toISOString().split("T")[1].slice(0, 5),
        timestamp,
        status: "pending", // Tilføj status som "pending"
      };
  
      await set(newTutorSessionRef, sessionData);
  
      // Student sessions data
      const studentSessionsRef = ref(db, `students/${currentUserId}/sessions`);
      const newStudentSessionRef = push(studentSessionsRef);
  
      const studentSessionData = {
        tutorId: tutorId,
        tutorName: tutorName,
        studentMessage: message,
        date: date.toISOString().split("T")[0],
        time: time.toISOString().split("T")[1].slice(0, 5),
        timestamp,
        status: "pending", // Tilføj status som "pending"
      };
  
      await set(newStudentSessionRef, studentSessionData);
  
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
});

export default BookSession;

import React, { useState, useEffect } from "react";
import {
  View,
  TextInput,
  FlatList,
  Text,
  TouchableOpacity,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
} from "react-native";
import { getDatabase, ref, push, onValue } from "firebase/database";

// komponent til privat chat
const PrivateChat = ({ route }) => {
  // henter chat-id og chat-navn fra ruten
  const { chatId, chatName } = route.params;
  const [messages, setMessages] = useState([]);
  const [message, setMessage] = useState("");
  const db = getDatabase();

  useEffect(() => {
    // henter beskeder fra firebase-databasen
    const messagesRef = ref(db, `chats/${chatId}/messages`);
    const unsubscribe = onValue(messagesRef, (snapshot) => {
      const data = snapshot.val();
      if (data) {
        // data til et array af beskeder
        const loadedMessages = Object.keys(data).map((key) => ({
          id: key,
          text: data[key].text,
          timestamp: data[key].timestamp,
        }));
        setMessages(loadedMessages.reverse()); // opdaterer beskederne i omvendt rækkefølge
      }
    });
    return () => unsubscribe(); // stopper med at lytte, når komponenten unmountes
  }, [chatId]); // kører når chatId ændres

  const sendMessage = () => {
    // sender en ny besked til Firebase-databasen
    if (message.trim().length > 0) {
      const messagesRef = ref(db, `chats/${chatId}/messages`);
      push(messagesRef, {
        text: message,
        timestamp: Date.now(),
      });
      setMessage(""); // rydder inputfeltet efter besked er sendt
    }
  };

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === "ios" ? "padding" : "height"}
    >
      {/* Viser chat-navn */}
      <Text style={styles.chatName}>{chatName}</Text>

      {/* Viser beskeder i en liste */}
      <FlatList
        data={messages}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <View style={styles.messageContainer}>
            {item.text.includes("**") ? (
              <Text style={styles.messageText}>
                <Text style={styles.boldText}>
                  {item.text.split("**")[1]} {/* fed tekst */}
                </Text>
                {"\n\n"}
                {item.text.split("**")[2]} {/* bruger beksed */}
              </Text>
            ) : (
              <Text style={styles.messageText}>{item.text}</Text>
            )}
            {/* viser tidspunkt for beskeden */}
            <Text style={styles.timestamp}>
              {new Date(item.timestamp).toLocaleTimeString()}
            </Text>
          </View>
        )}
        inverted
      />

      {/* inputfelt og send knap */}
      <View style={styles.inputContainer}>
        <TextInput
          style={styles.input}
          placeholder="Skriv din besked..."
          value={message}
          onChangeText={setMessage} // opdaterer beskedinput
        />
        <TouchableOpacity style={styles.sendButton} onPress={sendMessage}>
          <Text style={styles.sendButtonText}>Send</Text>
        </TouchableOpacity>
      </View>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  boldText: {
    fontWeight: "bold",
  },
  container: {
    flex: 1,
    backgroundColor: "#f5f5f5",
    padding: 10,
  },
  chatName: {
    fontSize: 20,
    fontWeight: "bold",
    marginBottom: 10,
  },
  messageContainer: {
    padding: 10,
    backgroundColor: "#fff",
    borderRadius: 8,
    marginBottom: 5,
    shadowColor: "#000",
    shadowOpacity: 0.1,
    shadowRadius: 5,
    elevation: 2,
  },
  messageText: {
    fontSize: 16,
  },
  timestamp: {
    fontSize: 12,
    color: "#757575",
    marginTop: 5,
  },
  inputContainer: {
    flexDirection: "row",
    alignItems: "center",
    padding: 10,
    backgroundColor: "#fff",
    borderRadius: 8,
  },
  input: {
    flex: 1,
    borderColor: "#ccc",
    borderWidth: 1,
    borderRadius: 8,
    padding: 10,
    marginRight: 10,
  },
  sendButton: {
    backgroundColor: "#007BFF",
    padding: 10,
    borderRadius: 8,
  },
  sendButtonText: {
    color: "#fff",
    fontWeight: "bold",
  },
});

export default PrivateChat;

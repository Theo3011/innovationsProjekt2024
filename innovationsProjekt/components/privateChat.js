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

const PrivateChat = ({ route }) => {
  const { chatId, chatName } = route.params;
  const [messages, setMessages] = useState([]);
  const [message, setMessage] = useState("");
  const db = getDatabase();

  useEffect(() => {
    const messagesRef = ref(db, `chats/${chatId}/messages`);
    const unsubscribe = onValue(messagesRef, (snapshot) => {
      const data = snapshot.val();
      if (data) {
        const loadedMessages = Object.keys(data).map((key) => ({
          id: key,
          text: data[key].text,
          timestamp: data[key].timestamp,
        }));
        setMessages(loadedMessages.reverse());
      }
    });
    return () => unsubscribe();
  }, [chatId]);

  const sendMessage = () => {
    if (message.trim().length > 0) {
      const messagesRef = ref(db, `chats/${chatId}/messages`);
      push(messagesRef, {
        text: message,
        timestamp: Date.now(),
      });
      setMessage("");
    }
  };

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === "ios" ? "padding" : "height"}
    >
      <Text style={styles.chatName}>{chatName}</Text>
      <FlatList
        data={messages}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <View style={styles.messageContainer}>
            {item.text.includes("**") ? (
              <Text style={styles.messageText}>
                <Text style={styles.boldText}>
                  {item.text.split("**")[1]} {/* Fed tekst */}
                </Text>
                {"\n\n"}
                {item.text.split("**")[2]} {/* Brugerbeskeden */}
              </Text>
            ) : (
              <Text style={styles.messageText}>{item.text}</Text>
            )}
            <Text style={styles.timestamp}>
              {new Date(item.timestamp).toLocaleTimeString()}
            </Text>
          </View>
        )}
        inverted
      />

      <View style={styles.inputContainer}>
        <TextInput
          style={styles.input}
          placeholder="Skriv din besked..."
          value={message}
          onChangeText={setMessage}
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

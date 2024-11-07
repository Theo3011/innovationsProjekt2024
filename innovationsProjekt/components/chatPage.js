import React, { useState, useEffect } from "react";
import {
  View,
  TextInput,
  Button,
  FlatList,
  Text,
  KeyboardAvoidingView,
  Platform,
} from "react-native";
import { getDatabase, ref, push, onValue, remove } from "firebase/database";

// Formaterer timestamps til læsbart format
const formatTimestamp = (timestamp) => {
  const date = new Date(timestamp);
  return `${date.getHours()}:${date.getMinutes().toString().padStart(2, "0")}`;
};

// Farver, som du tidligere har defineret i globalStyles
const colors = {
  primary: "#4CAF50",
  button: "#1E88E5",
  placeholder: "#BDBDBD",
  background: "#F0F0F0",
  text: "#000000",
  timestamp: "#757575",
};

const ChatPage = () => {
  const [message, setMessage] = useState("");
  const [messages, setMessages] = useState([]);
  const db = getDatabase();

  // Henter beskeder fra Firebase ved komponentens indlæsning
  useEffect(() => {
    const messagesRef = ref(db, "messages");

    const unsubscribe = onValue(messagesRef, (snapshot) => {
      const data = snapshot.val();
      const now = Date.now();

      if (data) {
        const loadedMessages = Object.keys(data).map((key) => {
          const messageData = data[key];
          // Fjerner beskeder, der er ældre end 10 minutter
          if (now - messageData.timestamp > 10 * 60 * 1000) {
            remove(ref(db, `messages/${key}`));
          }
          return {
            id: key,
            text: messageData.text,
            timestamp: messageData.timestamp,
          };
        });
        setMessages(loadedMessages.reverse());
      }
    });

    return () => unsubscribe();
  }, []);

  // Sender en besked til Firebase
  const sendMessage = () => {
    if (message.trim().length > 0) {
      try {
        const messagesRef = ref(db, "messages");
        push(messagesRef, {
          text: message,
          timestamp: Date.now(), // Gemmer tidsstempel sammen med beskeden
        })
          .then(() => {
            setMessage(""); // Rydder inputfeltet efter sending
          })
          .catch((error) => {
            console.error("Error setting message data:", error);
          });
      } catch (error) {
        console.error("Error initializing database reference:", error);
      }
    }
  };

  // render chatgrænsefladen
  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === "ios" ? "padding" : "height"}
    >
      <FlatList
        data={messages} // Viser chatbeskeder
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <View style={styles.messageContainer}>
            <Text style={styles.messageText}>{item.text}</Text>
            <Text style={styles.timestampText}>
              {formatTimestamp(item.timestamp)}
            </Text>
          </View>
        )}
        inverted // Vender listen om, så nyeste beskeder vises øverst
      />
      <View style={styles.inputContainer}>
        <TextInput
          style={styles.input}
          placeholder="Skriv en besked..."
          placeholderTextColor={colors.placeholder}
          value={message}
          onChangeText={setMessage}
        />
        <Button title="Send" color={colors.button} onPress={sendMessage} />
      </View>
    </KeyboardAvoidingView>
  );
};

// Inline-styles for komponenten
const styles = {
  container: {
    flex: 1,
    backgroundColor: colors.background,
    padding: 10,
  },
  messageContainer: {
    marginVertical: 5,
    padding: 10,
    backgroundColor: "#FFF",
    borderRadius: 5,
    shadowColor: "#000",
    shadowOpacity: 0.1,
    shadowRadius: 5,
    shadowOffset: { width: 0, height: 2 },
    elevation: 3,
  },
  messageText: {
    fontSize: 16,
    color: colors.text,
  },
  timestampText: {
    fontSize: 12,
    color: colors.timestamp,
    marginTop: 5,
  },
  inputContainer: {
    flexDirection: "row",
    alignItems: "center",
    paddingTop: 10,
    paddingBottom: 10,
  },
  input: {
    flex: 1,
    borderWidth: 1,
    borderColor: colors.placeholder,
    borderRadius: 5,
    padding: 10,
    marginRight: 10,
    fontSize: 16,
  },
};

export default ChatPage;

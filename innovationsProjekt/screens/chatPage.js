// Importer nødvendige moduler og komponenter
import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  StyleSheet,
} from "react-native";
import { getDatabase, ref, onValue } from "firebase/database";
import { useNavigation } from "@react-navigation/native";

const ChatPage = () => {
  // opretter states til at gemme chats
  const [chats, setChats] = useState([]);
  const navigation = useNavigation();
  const db = getDatabase();

  // henter chats fra Firebase-databasen ved hjælp af useEffect
  useEffect(() => {
    const chatsRef = ref(db, "chats"); // reference til chats i databasen
    const unsubscribe = onValue(chatsRef, (snapshot) => {
      const data = snapshot.val();
      if (data) {
        // konverter chats til et array med nødvendige oplysninger
        const loadedChats = Object.keys(data).map((key) => {
          const messages = data[key].messages || {};
          const messageArray = Object.values(messages);

          // finder den nyeste besked
          const latestMessageObj =
            messageArray.length > 0
              ? messageArray.sort((a, b) => b.timestamp - a.timestamp)[0]
              : null;

          return {
            id: key, // Chat-id
            name: data[key].name || "Ingen navn", // Chat-navn
            author: data[key].author || "Ukendt", // Forfatter
            latestMessage: latestMessageObj?.text || "Ingen besked endnu", // Seneste besked
            timestamp: latestMessageObj
              ? new Date(latestMessageObj.timestamp).toLocaleTimeString([], {
                  hour: "2-digit",
                  minute: "2-digit",
                })
              : "", // tidsstempel for seneste besked
          };
        });
        setChats(loadedChats);
      }
    });
    return () => unsubscribe(); // ryd op efter useEffect
  }, []);

  // navigerer til en specifik chat ved tryk
  const handleChatPress = (chatId, chatName) => {
    navigation.navigate("PrivateChat", { chatId, chatName });
  };

  // formaterer tekst med fed skrift for dele omgivet af **, dette er brugt til at sørge for når en anmodning kommer ind, fremstår den mere tydeligt
  const parseText = (text) => {
    const parts = text.split("**");
    return parts.map((part, index) => {
      if (index % 2 === 1) {
        return (
          <Text key={index} style={styles.boldText}>
            {part}
          </Text>
        );
      }
      return part;
    });
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Chat</Text>
      <FlatList
        data={chats} // henter chat-data
        keyExtractor={(item) => item.id} // Unik nøgle for hver chat
        renderItem={({ item }) => (
          <TouchableOpacity
            style={styles.chatItem}
            onPress={() => handleChatPress(item.id, item.name)} // håndterer tryk på chat
          >
            <View style={styles.chatDetails}>
              <Text style={styles.chatAuthor}>Skriver: {item.author}</Text>
              <Text style={styles.chatName}>{item.name}</Text>
              <Text style={styles.latestMessage}>
                {parseText(item.latestMessage)}
              </Text>
            </View>
            <Text style={styles.timestamp}>{item.timestamp}</Text>
          </TouchableOpacity>
        )}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f5f5f5",
    padding: 10,
  },
  title: {
    fontSize: 24,
    fontWeight: "bold",
    marginBottom: 10,
  },
  chatItem: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    padding: 15,
    backgroundColor: "#fff",
    borderRadius: 8,
    marginBottom: 10,
    shadowColor: "#000",
    shadowOpacity: 0.1,
    shadowRadius: 5,
    elevation: 2,
  },
  chatDetails: {
    flex: 1,
  },
  chatAuthor: {
    fontSize: 14,
    fontWeight: "bold",
    color: "#333",
  },
  chatName: {
    fontSize: 16,
    fontWeight: "bold",
  },
  latestMessage: {
    fontSize: 14,
    color: "#757575",
  },
  timestamp: {
    fontSize: 12,
    color: "#757575",
  },
  boldText: {
    fontWeight: "bold",
  },
});

export default ChatPage;

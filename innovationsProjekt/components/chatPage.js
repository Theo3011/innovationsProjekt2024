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
  const [chats, setChats] = useState([]);
  const navigation = useNavigation();
  const db = getDatabase();

  useEffect(() => {
    const chatsRef = ref(db, "chats");
    const unsubscribe = onValue(chatsRef, (snapshot) => {
      const data = snapshot.val();
      if (data) {
        const loadedChats = Object.keys(data).map((key) => {
          const messages = data[key].messages || {};
          const messageArray = Object.values(messages);

          const latestMessageObj =
            messageArray.length > 0
              ? messageArray.sort((a, b) => b.timestamp - a.timestamp)[0]
              : null;

          return {
            id: key,
            name: data[key].name || "Ingen navn",
            author: data[key].author || "Ukendt",
            latestMessage: latestMessageObj?.text || "Ingen besked endnu",
            timestamp: latestMessageObj
              ? new Date(latestMessageObj.timestamp).toLocaleTimeString([], {
                  hour: "2-digit",
                  minute: "2-digit",
                })
              : "",
          };
        });
        setChats(loadedChats);
      }
    });
    return () => unsubscribe();
  }, []);

  const handleChatPress = (chatId, chatName) => {
    navigation.navigate("PrivateChat", { chatId, chatName });
  };

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
        data={chats}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <TouchableOpacity
            style={styles.chatItem}
            onPress={() => handleChatPress(item.id, item.name)}
          >
            <View style={styles.chatDetails}>
              <Text style={styles.chatAuthor}>Skriver: {item.author}</Text>
              <Text style={styles.chatName}>{item.name}</Text>
              <Text style={styles.latestMessage}>{parseText(item.latestMessage)}</Text>
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

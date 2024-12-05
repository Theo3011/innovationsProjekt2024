import React, { useState, useEffect } from "react";
import {
  Text,
  View,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
} from "react-native";
import { getDatabase, ref, onValue } from "firebase/database";
import { useNavigation } from "@react-navigation/native";

const Dashboard = () => {
  const [offers, setOffers] = useState([]); // State til at holde data
  const navigation = useNavigation();

  // Hent data fra Firebase
  useEffect(() => {
    const db = getDatabase();
    const offersRef = ref(db, "offers"); // Path i databasen

    const unsubscribe = onValue(offersRef, (snapshot) => {
      const data = snapshot.val();
      if (data) {
        // Konverter data til en liste
        const offersArray = Object.keys(data).map((key) => ({
          id: key,
          ...data[key],
        }));
        setOffers(offersArray); // Opdater state
      }
    });

    return () => unsubscribe(); // Ryd op efter listener
  }, []);

  return (
    <ScrollView style={styles.list}>
      {offers.map((offer) => (
        <View key={offer.id} style={styles.card}>
          <View style={styles.profileImage}></View>
          <View style={styles.cardContent}>
            <Text>Name: {offer.name}</Text>
            <Text>Eksamen: {offer.exam}</Text>
            <Text>Pris/time: {offer.price} DKK</Text>
            <Text>Undervisningstype: {offer.type}</Text>
            <TouchableOpacity
              style={styles.button}
              onPress={() =>
                navigation.navigate("ViewOffer", {
                  name: offer.name,
                  exam: offer.exam,
                  price: offer.price,
                  type: offer.type,
                  description: offer.description,
                })
              }
            >
              <Text style={styles.buttonText}>Vis opslag</Text>
            </TouchableOpacity>
          </View>
        </View>
      ))}
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#fff" },
  header: { fontSize: 20, fontWeight: "bold", margin: 10, textAlign: "center" },
  tabs: { flexDirection: "row", justifyContent: "center", marginBottom: 10 },
  tab: { marginHorizontal: 10 },
  tabText: { fontSize: 16, fontWeight: "normal", color: "black" },
  tabTextSelected: { fontWeight: "bold", color: "blue" }, // Gør valgt tekst fed og blå
  list: { flex: 1, paddingHorizontal: 10 },
  card: {
    flexDirection: "row",
    backgroundColor: "#f9f9f9",
    marginVertical: 10,
    padding: 10,
    borderRadius: 8,
    elevation: 3,
  },
  profileImage: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: "#ddd",
    marginRight: 10,
  },
  cardContent: { flex: 1 },
  button: {
    marginTop: 10,
    padding: 10,
    backgroundColor: "#007bff",
    borderRadius: 5,
  },
  buttonText: { color: "#fff", textAlign: "center" },

  // Tilføj opslag knap styling
  addButton: {
    position: "absolute",
    bottom: 20, // Placeret 20 pixels over bunden
    right: 20, // Placeret 20 pixels fra højre kant
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#007bff",
    paddingVertical: 10,
    paddingHorizontal: 15,
    borderRadius: 25,
    elevation: 5, // Gør knappen lidt "hævet"
  },
  addButtonText: {
    color: "white",
    fontSize: 16,
    fontWeight: "bold",
    marginLeft: 10, // Lidt afstand mellem ikonet og teksten
  },
});

export default Dashboard;

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
    <View style={styles.container}>
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

      {/* Tilføj opslag knap */}
      <TouchableOpacity
        style={styles.addButton}
        onPress={() => navigation.navigate("OfferPage")} // Naviger til OfferPage
      >
        <Text style={styles.addButtonText}>+ Opret opslag</Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#fff" },
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
  addButton: {
    position: "absolute",
    bottom: 20,
    right: 20,
    backgroundColor: "#007bff",
    padding: 15,
    borderRadius: 50,
    elevation: 5,
    alignItems: "center",
    justifyContent: "center",
  },
  addButtonText: {
    color: "white",
    fontSize: 16,
    fontWeight: "bold",
  },
});

export default Dashboard;

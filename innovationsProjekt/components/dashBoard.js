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
  const [offers, setOffers] = useState([]); // State to hold offer data
  const [names, setNames] = useState({}); // State to hold student or tutor names
  const navigation = useNavigation();

  // Fetch offers from Firebase
  useEffect(() => {
    const db = getDatabase();
    const offersRef = ref(db, "offers");

    const unsubscribeOffers = onValue(offersRef, (snapshot) => {
      const data = snapshot.val();
      if (data) {
        const offersArray = Object.keys(data).map((key) => ({
          id: key,
          ...data[key],
        }));
        setOffers(offersArray);
      }
    });

    return () => unsubscribeOffers(); // Cleanup after listener
  }, []);

  // Fetch names (students or tutors) based on user ID (createdBy)
  useEffect(() => {
    const db = getDatabase();

    const fetchName = async (id) => {
      const studentRef = ref(db, `students/${id}/name`);
      const tutorRef = ref(db, `tutors/${id}/name`);

      return new Promise((resolve) => {
        // First check if the ID exists in "students"
        onValue(
          studentRef,
          (snapshot) => {
            if (snapshot.exists()) {
              resolve(snapshot.val());
            } else {
              // If not found in "students", check in "tutors"
              onValue(
                tutorRef,
                (snapshot) => {
                  if (snapshot.exists()) {
                    resolve(snapshot.val());
                  } else {
                    resolve("Ukendt bruger"); // Default fallback
                  }
                },
                { onlyOnce: true }
              );
            }
          },
          { onlyOnce: true }
        );
      });
    };

    const fetchAllNames = async () => {
      const namePromises = offers.map((offer) =>
        fetchName(offer.createdBy).then((name) => ({
          id: offer.createdBy,
          name,
        }))
      );

      const results = await Promise.all(namePromises);
      const namesMap = results.reduce(
        (acc, { id, name }) => ({ ...acc, [id]: name }),
        {}
      );
      setNames(namesMap);
    };

    if (offers.length > 0) {
      fetchAllNames();
    }
  }, [offers]); // Re-run if offers change

  return (
    <View style={styles.container}>
      <ScrollView style={styles.list}>
        {offers.map((offer) => (
          <View key={offer.id} style={styles.card}>
            <View style={styles.profileImage}></View>
            <View style={styles.cardContent}>
              {/* Display the name based on createdBy */}
              <Text>Navn: {names[offer.createdBy] || "Henter navn..."}</Text>
              <Text>Studielinje: {offer.studyLine}</Text>
              <Text>Universitet: {offer.university}</Text>
              <Text>Pris/time: {offer.price} DKK</Text>
              <Text>Undervisningstype: {offer.type}</Text>
              <TouchableOpacity
                style={styles.button}
                onPress={() =>
                  navigation.navigate("InfoToViewOffer", {
                    name: names[offer.createdBy] || "Ukendt bruger",
                    studyLine: offer.studyLine,
                    university: offer.university,
                    price: offer.price,
                    type: offer.type,
                    description: offer.description,
                    receiverId: offer.createdBy,
                  })
                }
              >
                <Text style={styles.buttonText}>Vis opslag</Text>
              </TouchableOpacity>
            </View>
          </View>
        ))}
      </ScrollView>

      {/* Add Offer button */}
      <TouchableOpacity
        style={styles.addButton}
        onPress={() => navigation.navigate("OfferPage")}
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

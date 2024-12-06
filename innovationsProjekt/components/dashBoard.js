import React, { useState, useEffect } from "react";
import {
  Text,
  View,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Image,
} from "react-native";
import { getDatabase, ref, onValue } from "firebase/database";
import { useNavigation } from "@react-navigation/native";

const Dashboard = () => {
  const [offers, setOffers] = useState([]); // State to hold offer data
  const [userDetails, setUserDetails] = useState({}); // State to hold user names and images
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

  // Fetch user details (names and images) based on user ID (createdBy)
  useEffect(() => {
    const db = getDatabase();

    const fetchUserDetails = async (id) => {
      const studentRef = ref(db, `students/${id}`);
      const tutorRef = ref(db, `tutors/${id}`);

      return new Promise((resolve) => {
        // First check if the ID exists in "students"
        onValue(
          studentRef,
          (snapshot) => {
            if (snapshot.exists()) {
              resolve(snapshot.val()); // Return student details
            } else {
              // If not found in "students", check in "tutors"
              onValue(
                tutorRef,
                (snapshot) => {
                  if (snapshot.exists()) {
                    resolve(snapshot.val()); // Return tutor details
                  } else {
                    resolve({
                      name: "Ukendt bruger",
                      profileImage: null,
                    }); // Default fallback
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

    const fetchAllUserDetails = async () => {
      const userPromises = offers.map((offer) =>
        fetchUserDetails(offer.createdBy).then((details) => ({
          id: offer.createdBy,
          details,
        }))
      );

      const results = await Promise.all(userPromises);
      const userDetailsMap = results.reduce(
        (acc, { id, details }) => ({ ...acc, [id]: details }),
        {}
      );
      setUserDetails(userDetailsMap);
    };

    if (offers.length > 0) {
      fetchAllUserDetails();
    }
  }, [offers]); // Re-run if offers change

  return (
    <View style={styles.container}>
      <ScrollView style={styles.list}>
        {offers.map((offer) => {
          const user = userDetails[offer.createdBy] || {}; // Fetch user details
          return (
            <View key={offer.id} style={styles.card}>
              {/* Display profile image */}
              <View style={styles.profileImage}>
                {user.profileImage ? (
                  <Image
                    source={{ uri: user.profileImage }}
                    style={styles.imageStyle}
                  />
                ) : (
                  <View style={styles.placeholder}></View>
                )}
              </View>
              <View style={styles.cardContent}>
                {/* Display the name */}
                <Text>Navn: {user.name || "Henter navn..."}</Text>
                <Text>Studielinje: {offer.studyLine}</Text>
                <Text>Universitet: {offer.university}</Text>
                <Text>Pris/time: {offer.price} DKK</Text>
                <Text>Undervisningstype: {offer.type}</Text>
                <TouchableOpacity
                  style={styles.button}
                  onPress={() =>
                    navigation.navigate("InfoToViewOffer", {
                      name: user.name || "Ukendt bruger",
                      profileImage: user.profileImage,
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
          );
        })}
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
    justifyContent: "center",
    alignItems: "center",
  },
  imageStyle: {
    width: 50,
    height: 50,
    borderRadius: 25,
  },
  placeholder: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: "#ccc",
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

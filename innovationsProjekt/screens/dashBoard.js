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
  const [offers, setOffers] = useState([]); // State til at gemme alle offers
  const [userDetails, setUserDetails] = useState({}); // State til at gemme brugerdata
  const navigation = useNavigation();

  // henter alle offers fra database
  useEffect(() => {
    const db = getDatabase();
    const offersRef = ref(db, "offers"); // reference til offers i databasen

    const unsubscribeOffers = onValue(offersRef, (snapshot) => {
      const data = snapshot.val();
      if (data) {
        // konverter offers til en array
        const offersArray = Object.keys(data).map((key) => ({
          id: key,
          ...data[key],
        }));
        setOffers(offersArray); // gemmer tilbudene i state
      }
    });

    return () => unsubscribeOffers();
  }, []);

  // henter brugeroplysninger
  useEffect(() => {
    const db = getDatabase();

    const fetchUserDetails = async (id) => {
      const studentRef = ref(db, `students/${id}`); // kontrollerer i "students" tabellen fra firebase
      const tutorRef = ref(db, `tutors/${id}`); // kontrollerer i "tutors" tabellen fra firebase

      return new Promise((resolve) => {
        // henter brugeroplysninger fra "students"
        onValue(
          studentRef,
          (snapshot) => {
            if (snapshot.exists()) {
              resolve(snapshot.val()); // Bruger fundet i "students"
            } else {
              // Hvis ikke fundet i "students", check i "tutors"
              onValue(
                tutorRef,
                (snapshot) => {
                  if (snapshot.exists()) {
                    resolve(snapshot.val()); // Bruger fundet i "tutors"
                  } else {
                    // hvis bruger ikke findes, returner default data
                    resolve({
                      name: "Ukendt bruger",
                      profileImage: null,
                    });
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

    // henter detaljer for alle brugere og gem dem i en map med bruger-ID som nøgle
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
      setUserDetails(userDetailsMap); // gemmer brugeroplysninger i state
    };

    if (offers.length > 0) {
      fetchAllUserDetails(); // kører kun hvis tilbud er tilgængelige
    }
  }, [offers]);

  return (
    <View style={styles.container}>
      <ScrollView style={styles.list}>
        {offers.map((offer) => {
          const user = userDetails[offer.createdBy] || {}; // henter brugeroplysninger for dette tilbud
          return (
            <View key={offer.id} style={styles.card}>
              <View style={styles.profileImage}>
                {user.profileImage ? (
                  <Image
                    source={{ uri: user.profileImage }}
                    style={styles.imageStyle}
                  />
                ) : (
                  <View style={styles.placeholder}></View> // placehloder hvis billede mangler
                )}
              </View>
              <View style={styles.cardContent}>
                <Text>Navn: {user.name || "Henter navn..."}</Text>
                <Text>Studielinje: {offer.studyLine}</Text>
                <Text>Universitet: {offer.university}</Text>
                <Text>Eksamen: {offer.exam}</Text>
                <Text>Pris/time: {offer.price} DKK</Text>
                <Text>Undervisningstype: {offer.type}</Text>
                {/* knap for at vise detaljer om tilbuddet */}
                <TouchableOpacity
                  style={styles.button}
                  onPress={() =>
                    navigation.navigate("InfoToViewOffer", {
                      name: user.name || "Ukendt bruger",
                      imageUrl: user.profileImage,
                      studyLine: offer.studyLine,
                      university: offer.university,
                      price: offer.price,
                      type: offer.type,
                      description: offer.description,
                      receiverId: offer.createdBy,
                      exam: offer.exam,
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

      {/* knap til at oprette et nyt opslag */}
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

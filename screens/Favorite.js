import { StatusBar } from "expo-status-bar";
import { View, Text, StyleSheet, FlatList } from "react-native";
import React, { useState, useEffect } from "react";
import ReviewItem from "../components/ReviewItem";
import { collection, onSnapshot, query, where } from "firebase/firestore";
import { database } from "../Firebase/firebase-setup";
import ColorsHelper from "../components/ColorsHelper";

export default function Favorite({ navigation }) {
  const [favoriteReviews, setFavoriteReviews] = useState([]);

  useEffect(() => {
    const reviewsRef = collection(database, "reviews");
    const q = query(reviewsRef, where("favorite", ">=", 0));

    const unsubscribe = onSnapshot(q, (querySnapshot) => {
      const reviewsArray = [];
      querySnapshot.forEach((doc) => {
        reviewsArray.push({ ...doc.data(), id: doc.id });
      });
      setFavoriteReviews(reviewsArray);
    });

    return () => {
      unsubscribe();
    };
  }, []);

  return (
    <View style={styles.favoritesContainer}>
      <FlatList
        contentContainerStyle={styles.scrollViewContent}
        data={favoriteReviews}
        renderItem={({ item }) => (
          <ReviewItem reviewData={item} navigation={navigation} />
        )}
      />
      <StatusBar style="auto" />
    </View>
  );
}

const styles = StyleSheet.create({
  favoritesContainer: {
    flex: 1,
    backgroundColor: ColorsHelper.cardBackGround2,
  },
  scrollViewContent: {
    alignItems: "center",
    marginTop: 10,
  },
});

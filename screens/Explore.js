import { StatusBar } from "expo-status-bar";
import { View, Text, StyleSheet, FlatList } from "react-native";
import React, { useState, useEffect } from "react";
import ReviewItem from "../components/ReviewItem";
import { collection, onSnapshot } from "firebase/firestore";
import { database } from "../Firebase/firebase-setup";
import ColorsHelper from "../components/ColorsHelper";

export default function Explore({ navigation }) {
  const [reviews, setReviews] = useState([]);

  useEffect(() => {
    const unsubscribe = onSnapshot(
      collection(database, "reviews"),
      (querySnapshot) => {
        if (!querySnapshot.empty) {
          const newReviews = querySnapshot.docs.map((item) => {
            return { ...item.data(), id: item.id };
          });
          setReviews(newReviews);
        } else {
          setReviews([]);
        }
      }
    );
    return () => {
      unsubscribe();
    };
  }, []);

  const reviewPressedToDetail = (review) => {
    navigation.navigate("Detail", {
      review: review,
    });
  };

  return (
    <View style={styles.reviewsContainer}>
      <View style={styles.introduction}>
        <Text style={styles.introText}>Scroll the page to see all reviews</Text>
        <Text style={styles.introText}>
          Click button to view landlord details
        </Text>
      </View>
      <FlatList
        contentContainerStyle={styles.scrollViewContent}
        data={reviews}
        renderItem={({ item }) => (
          <ReviewItem
            reviewData={item}
            pressFunction={() => reviewPressedToDetail(item)}
            navigation={navigation}
          />
        )}
      />
      <StatusBar style="auto" />
    </View>
  );
}

const styles = StyleSheet.create({
  reviewsContainer: {
    flex: 1,
    backgroundColor: ColorsHelper.cardBackGround2,
  },
  scrollViewContent: {
    alignItems: "center",
    // alignContent: "center",
  },
  introduction: {
    width: "95%",
    margin: 11,
    alignSelf: "center",
  },
  introText: {
    fontSize: 16,
    margin: 5,
  },
});

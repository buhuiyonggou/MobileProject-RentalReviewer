import { StyleSheet, Text, View } from "react-native";
import React, { useState, useEffect } from "react";
// import { storage } from "../Firebase/firebase-setup";
// import { ref, getDownloadURL } from "firebase/storage";
import { Image } from "react-native";
import { Ionicons, MaterialIcons } from "@expo/vector-icons";
import { downloadImages } from "./DownLoadImages";
import PressableButton from "./PressableButton";
import ColorsHelper from "./ColorsHelper";

export default function ReviewItem({ reviewData, navigation }) {
  const [images, setImages] = useState([]);

  const reviewPressedToDetail = (review) => {
    navigation.navigate("Detail", {
      review: review,
      imageUris: images,
    });
    // console.log("test review info in ReviewItem:", review);
  };

  useEffect(() => {
    async function fetchImages() {
      const downloadedImages = await downloadImages(reviewData);
      setImages(downloadedImages);
    }

    fetchImages();
  }, [reviewData]);

  return (
    <View style={styles.exploreContainer}>
      <View style={styles.imageContainer}>
        <Image
          source={{ uri: images[0] }}
          style={styles.image}
          onError={(e) => {
            console.error("Error loading image: ", e.nativeEvent.error);
          }}
        />
      </View>

      <View style={styles.infoContainer}>
        <View style={styles.infoDisplay}>
          <Ionicons name="bed" size={15} />
          <Text style={styles.text}>Unit:{reviewData.unitType}</Text>
        </View>

        <View style={styles.infoDisplay}>
          <Ionicons style={styles.icon} name="home" size={15} />
          <Text style={styles.text}>Address:{reviewData.address}</Text>
        </View>

        <View style={styles.infoDisplay}>
          <MaterialIcons name="star-rate" size={15} />
          <Text style={styles.text}>Rating:{reviewData.rating}</Text>
        </View>

        <PressableButton
          pressableFunction={() => reviewPressedToDetail(reviewData, images)}
          pressedStyle={{
            backgroundColor: ColorsHelper.buttonPressed,
            opacity: 0.5,
          }}
        >
          <Text style={styles.buttonText}>Details</Text>
        </PressableButton>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  exploreContainer: {
    // flex: 1,
    padding: 10,
    alignItems: "center",
    borderWidth: 1,
    width: 330,
    marginBottom: 15,
  },
  imageContainer: {
    width: "100%",
    height: 200,
    marginBottom: 10,
  },
  image: {
    width: "100%",
    height: "100%",
    resizeMode: "cover",
  },
  infoContainer: {
    width: "100%",
    // borderWidth: 1,
  },
  infoDisplay: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 5,
  },
  icon: {
    marginRight: 5,
  },
  text: {
    fontSize: 17,
  },
  buttonContainer: {
    flexDirection: "row",
    justifyContent: "space-around",
    marginBottom: 30,
  },
  buttonText: {
    fontSize: 15,
    color: "#fff",
  },
});

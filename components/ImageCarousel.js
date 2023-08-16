import React from "react";
import { FlatList, Image, StyleSheet } from "react-native";
import ColorsHelper from "./ColorsHelper";

function ImageCarousel({ imageUris }) {
  return (
    <FlatList
      data={imageUris}
      renderItem={({ item: uri }) => (
        <Image
          source={{ uri }}
          style={styles.image}
          onError={(e) => {
            console.error("Error loading image: ", e.nativeEvent.error);
          }}
        />
      )}
      horizontal={true}
      showsHorizontalScrollIndicator={false}
      contentContainerStyle={styles.imageContainer}
    />
  );
}

const styles = StyleSheet.create({
  imageContainer: {
    width: 320,
    height: 130,
    marginTop: 5,
    justifyContent: "center",
  },
  image: {
    width: 110,
    height: 110,
    resizeMode: "cover",
    alignSelf: "center",
    marginLeft: "auto",
    marginRight: "auto",
  },
});

export default ImageCarousel;

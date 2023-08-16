import {
  View,
  Text,
  Alert,
  Image,
  StyleSheet,
  FlatList,
  Dimensions,
} from "react-native";
import React, { useState, useEffect } from "react";
import { AntDesign } from "@expo/vector-icons";
import * as ImagePicker from "expo-image-picker";
import ColorsHelper from "./ColorsHelper";

const screenWidth = Dimensions.get("window").width;
const imageSize = (screenWidth - 4 * 10) / 3;

export default function ImageManager({ storeImageUri, reset, setIsReset }) {
  const [cameraPermissionInfo, requestCameraPermission] =
    ImagePicker.useCameraPermissions();

  const [galleryPermissionInfo, requestGalleryPermission] =
    ImagePicker.useMediaLibraryPermissions();

  const [imageUri, setImageUri] = useState([]);

  useEffect(() => {
    setImageUri([]);
  }, [reset]);

  async function verifyCameraPermission() {
    try {
      if (cameraPermissionInfo) {
        return true;
      }

      const responseCamera = await requestCameraPermission();

      if (responseCamera.status !== "granted") {
        Alert.alert(
          "Permission needed",
          "You need to grant camera permissions to use this app.",
          [{ text: "Okay" }]
        );
        return false;
      }
      return true;
    } catch (err) {
      console.log("Permission Error from camera/local gallery", err);
    }
  }

  async function verifyGalleryPermission() {
    try {
      if (galleryPermissionInfo) {
        return true;
      }

      const responseGallery = await requestGalleryPermission();

      if (responseGallery.status !== "granted") {
        Alert.alert(
          "Permission needed",
          "You need to grant your album permissions to use this app.",
          [{ text: "Okay" }]
        );
        return false;
      }
      return true;
    } catch (err) {
      console.log("Permission Error from camera/local gallery", err);
    }
  }

  async function takeImageHandler() {
    try {
      const hasPermission = await verifyCameraPermission();
      if (!hasPermission) {
        Alert.alert("You need  to give access to camera");
        return;
      }
      const result = await ImagePicker.launchCameraAsync({
        allowsEditing: true,
        quality: 0.6,
        maxImages: 9 - imageUri.length,
      });

      if (!result.canceled && imageUri.length < 9) {
        const updatedImageUris = [...imageUri, result.assets[0].uri];
        setImageUri(updatedImageUris);
        storeImageUri(updatedImageUris);
      }
    } catch (err) {
      console.log("launch camera ", err);
    }
  }

  async function pickImageHandler() {
    try {
      const hasPermission = await verifyGalleryPermission();
      if (!hasPermission) {
        Alert.alert("You need to give access to the camera and gallery");
        return;
      }

      let result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.All,
        allowsEditing: true,
        quality: 0.6,
        multiple: true,
        maxImages: 9 - imageUri.length,
      });
      console.log("result of gallery ", result);

      if (!result.canceled) {
        const selectedUris = result.assets.map((item) => item.uri); // <-- Updated this line
        const updatedImageUris = [...imageUri, ...selectedUris];
        setImageUri(updatedImageUris);
        storeImageUri(updatedImageUris);
        // console.log("updated image uris ", updatedImageUris);
      }
    } catch (err) {
      console.log("launch gallery ", err);
    }
  }

  return (
    <View style={styles.cameraPressable}>
      <View style={styles.takeImages}>
        <Text style={styles.text}>
          Take images
          <Text style={{ color: "red", fontSize: 20 }}>*</Text>
        </Text>
        {imageUri.length < 9 && (
          <View style={styles.icons}>
            <AntDesign
              name="camera"
              size={28}
              color="black"
              onPress={takeImageHandler}
            />
            <AntDesign
              name="picture"
              size={28}
              color="black"
              onPress={pickImageHandler}
            />
          </View>
        )}
      </View>

      <FlatList
        data={imageUri}
        renderItem={({ item: uri }) => (
          <Image style={styles.image} source={{ uri }} />
        )}
        keyExtractor={(uri) => uri}
        horizontal={true}
        showsHorizontalScrollIndicator={false}
        style={styles.display}
        ListFooterComponent={() => (
          <View style={styles.placeholder}>
            <AntDesign name="close" size={imageSize - 9} color="gray" />
          </View>
        )}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  takeImages: {
    flexDirection: "row",
  },
  display: {
    flexDirection: "row",
    marginBottom: 15,
  },
  icons: {
    flexDirection: "row",
    marginLeft: 10,
    padding: 5,
  },
  text: {
    fontSize: 16,
    marginBottom: 5,
    alignSelf: "center",
  },
  button: {
    marginLeft: 15,
  },
  image: {
    height: imageSize,
    width: imageSize,
    margin: 5,
  },
  gradient: {
    position: "absolute",
    right: 0,
    height: "100%",
    width: 20,
  },
  placeholder: {
    justifyContent: "center",
    alignItems: "center",
    height: imageSize,
    width: imageSize,
    margin: 5,
    borderWidth: 1,
    borderColor: "gray",
    borderRadius: 6,
  },
});

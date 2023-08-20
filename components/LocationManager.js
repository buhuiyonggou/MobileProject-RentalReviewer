import { View, Text, Alert, Image, StyleSheet, Dimensions } from "react-native";
import React, { useEffect, useState } from "react";
import * as Location from "expo-location";
import { MAPS_API_KEY } from "@env";
import { useNavigation } from "@react-navigation/native";
import { useRoute } from "@react-navigation/native";
import { getReviewInfo } from "../Firebase/firestoreHelper";
import ColorsHelper from "./ColorsHelper";
import PressableButton from "./PressableButton";

const screenWidth = Dimensions.get("window").width;
export default function LocationManager({ handleLocationUpdate, resetSignal }) {
  const [location, setLocation] = useState(null);

  const navigation = useNavigation();
  const route = useRoute();

  useEffect(() => {
    setLocation(null);
  }, [resetSignal]);

  useEffect(() => {
    if (route.params) {
      //   console.log(route.params.selectedLocation);
      setLocation(route.params.selectedLocation);
    }
  }, [route]);

  const [permissionResponse, requestPermission] =
    Location.useForegroundPermissions();

  async function verifyPermission() {
    // check the granted property of permissionInfo
    if (permissionResponse.granted) {
      //if granted is true return true
      return true;
    }
    // if granted is false requestPermission and
    //return the granted property of the response
    const response = await requestPermission();
    return response.granted;
  }

  async function locateUserHandler() {
    try {
      //ask for permission first
      const hasPermission = await verifyPermission();
      if (!hasPermission) {
        Alert.alert("You need to give access to location");
      }
      const currentLocation = await Location.getCurrentPositionAsync();
      setLocation({
        latitude: currentLocation.coords.latitude,
        longitude: currentLocation.coords.longitude,
      });
    } catch (err) {
      console.log("get location ", err);
    }
  }
  const mapHandler = () => {
    // //  if location varibale is not null (locate user handler has been called)
    // // pass the location as route paramter to Map.js
    if (location) {
      navigation.navigate("Map", { location });
    } else {
      navigation.navigate("Map");
    }
  };

  const saveLocationHandler = () => {
    handleLocationUpdate(location);
    Alert.alert("Location saved");
  };

  return (
    <View>
      <View style={styles.buttonContainer}>
        <PressableButton
          pressableFunction={locateUserHandler}
          defaultStyle={styles.linkButton}
          pressedStyle={{
            backgroundColor: ColorsHelper.buttonPressed,
            opacity: 0.5,
          }}
        >
          <Text style={styles.buttonText}>
            Get location to explore walkscore
          </Text>
        </PressableButton>

        <PressableButton
          pressableFunction={mapHandler}
          defaultStyle={styles.linkButton}
          pressedStyle={{
            backgroundColor: ColorsHelper.buttonPressed,
            opacity: 0.5,
          }}
        >
          <Text style={styles.buttonText}>Choose your location </Text>
        </PressableButton>
      </View>

      {location && (
        <Image
          source={{
            uri: `https://maps.googleapis.com/maps/api/staticmap?center=${location.latitude},${location.longitude}&zoom=14&size=400x200&maptype=roadmap&markers=color:red%7Clabel:L%7C${location.latitude},${location.longitude}&key=${MAPS_API_KEY}`,
          }}
          style={{ width: "100%", height: 200 }}
        />
      )}

      <View style={styles.buttonContainer}>
        <PressableButton
          pressableFunction={location ? saveLocationHandler : null}
          defaultStyle={styles.linkButton}
          pressedStyle={{
            backgroundColor: ColorsHelper.buttonPressed,
            opacity: 0.5,
          }}
        >
          <Text
            style={
              location
                ? styles.buttonText
                : { color: ColorsHelper.lightgrey, fontSize: 20 }
            }
          >
            Save My Location
          </Text>
        </PressableButton>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  buttonContainer: {
    flexDirection: "column",
    justifyContent: "space-between",
    alignItems: "center",
  },
  linkButton: {
    backgroundColor: ColorsHelper.transparent,
    width: screenWidth * 0.9,
    margin: 5,
  },
  buttonText: {
    fontSize: 20,
    color: ColorsHelper.headers,
  },
});

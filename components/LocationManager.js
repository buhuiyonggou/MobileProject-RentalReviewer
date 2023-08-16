import { View, Button, Alert, Image, Dimensions } from "react-native";
import React, { useEffect, useState } from "react";
import * as Location from "expo-location";
import { MAPS_API_KEY } from "@env";
import { useNavigation } from "@react-navigation/native";
import { useRoute } from "@react-navigation/native";
import { getReviewInfo } from "../Firebase/firestoreHelper";

export default function LocationManager({
  handleLocationUpdate,
  reviewId,
  resetSignal,
}) {
  const [location, setLocation] = useState(null);

  const navigation = useNavigation();
  const route = useRoute();

  useEffect(() => {
    setLocation(null);
  }, [resetSignal]);

  useEffect(() => {
    async function getReviewLocation() {
      try {
        if (reviewId) {
          const storedLocation = await getReviewInfo(reviewId);
          setLocation(storedLocation);
        } else {
          console.log("reviewId is not defined!");
        }
      } catch (err) {
        console.log("get user location from databse ", err);
      }
    }
    getReviewLocation();
  }, []);

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
  };

  return (
    <View>
      <Button title="Locate User" onPress={locateUserHandler} />
      <Button title="Let me choose my location" onPress={mapHandler} />
      {location && (
        <Image
          source={{
            uri: `https://maps.googleapis.com/maps/api/staticmap?center=${location.latitude},${location.longitude}&zoom=14&size=400x200&maptype=roadmap&markers=color:red%7Clabel:L%7C${location.latitude},${location.longitude}&key=${MAPS_API_KEY}`,
          }}
          style={{ width: "100%", height: 200 }}
        />
      )}
      <Button
        disabled={!location}
        title="Save My Location"
        onPress={saveLocationHandler}
      />
    </View>
  );
}

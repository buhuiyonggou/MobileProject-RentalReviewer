import { View, Text, StyleSheet } from "react-native";
import PressableButton from "../components/PressableButton";
import React, { useEffect, useState } from "react";
import MapView, { Marker } from "react-native-maps";
import * as Location from "expo-location";
import ColorsHelper from "../components/ColorsHelper";

export default function Map({ navigation, route }) {
  const [selectedLocation, setSelectedLocation] = useState(null);
  const [initialLocation, setInitialLocation] = useState(null);
  const [address, setAddress] = useState(null);

  useEffect(() => {
    if (route.params) {
      setInitialLocation(route.params.location);
    }
  }, [route]);

  function confirmLocationHandler() {
    navigation.navigate("Post", {
      selectedLocation: selectedLocation,
      selectedAddress: address,
    });
  }

  async function handleMapPress(e) {
    const selectedCoord = {
      latitude: e.nativeEvent.coordinate.latitude,
      longitude: e.nativeEvent.coordinate.longitude,
    };

    setSelectedLocation(selectedCoord);

    try {
      const addresses = await Location.reverseGeocodeAsync(selectedCoord);
      const primaryAddress = addresses[0].name;
      setAddress(primaryAddress);
    } catch (error) {
      console.error("Failed to get address:", error);
    }
  }

  return (
    <>
      <MapView
        initialRegion={{
          latitude: initialLocation ? initialLocation.latitude : 49.28202,
          longitude: initialLocation ? initialLocation.longitude : -123.11875,
          latitudeDelta: 0.0922,
          longitudeDelta: 0.0421,
        }}
        style={{ flex: 1 }}
        onPress={handleMapPress}
      >
        {selectedLocation && <Marker coordinate={selectedLocation} />}
      </MapView>

      <View style={styles.buttonContainer}>
        <PressableButton
          pressableFunction={selectedLocation ? confirmLocationHandler : null}
          defaultStyle={styles.linkButton}
          pressedStyle={{
            backgroundColor: ColorsHelper.buttonPressed,
            opacity: 0.5,
          }}
        >
          <Text
            style={
              selectedLocation
                ? styles.buttonText
                : { color: ColorsHelper.lightgrey, fontSize: 20 }
            }
          >
            Confirm Selected Location
          </Text>
        </PressableButton>
      </View>
    </>
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
    width: "90%",
    margin: 5,
  },
  buttonText: {
    fontSize: 20,
    color: ColorsHelper.headers,
  },
});

import { View, Text, StyleSheet } from "react-native";
import PressableButton from "../components/PressableButton";
import React, { useEffect, useState } from "react";
import MapView, { Marker } from "react-native-maps";
import ColorsHelper from "../components/ColorsHelper";

export default function Map({ navigation, route }) {
  const [selectedLocation, setSelectedLocation] = useState(null);
  const [initialLocation, setInitialLocation] = useState(null);
  useEffect(() => {
    if (route.params) {
      setInitialLocation(route.params.location);
    }
  }, [route]);

  function confirmLocationHandler() {
    navigation.navigate("Post", { selectedLocation: selectedLocation });
  }
  return (
    <>
      <MapView
        initialRegion={{
          latitude: initialLocation ? initialLocation.latitude : 49.246292,
          longitude: initialLocation ? initialLocation.longitude : -123.116226,
          latitudeDelta: 0.0922,
          longitudeDelta: 0.0421,
        }}
        style={{ flex: 1 }}
        onPress={(e) => {
          setSelectedLocation({
            latitude: e.nativeEvent.coordinate.latitude,
            longitude: e.nativeEvent.coordinate.longitude,
          });
        }}
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

import { Button } from "react-native";
import React, { useEffect, useState } from "react";
import MapView, { Marker } from "react-native-maps";

export default function Map({ navigation, route }) {
  const [selectedLocation, setSelectedLocation] = useState(null);
  const [initialLocation, setInitialLocation] = useState(null);
  useEffect(() => {
    if (route.params) {
      setInitialLocation(route.params.location);
    }
  }, [route]);

  function confirmLocationHandler() {
    // navigation.navigate("Detail", { selectedLocation: selectedLocation });
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
      <Button
        disabled={!selectedLocation}
        title="Confirm Selected Location"
        onPress={confirmLocationHandler}
      />
    </>
  );
}

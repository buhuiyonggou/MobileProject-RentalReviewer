import React from "react";
import { View } from "react-native";
import { AntDesign } from "@expo/vector-icons";

export default function StarRating({ rating }) {
  return (
    <View style={{ flexDirection: "row" }}>
      <AntDesign name={rating >= 1 ? "star" : "staro"} size={15} />
      <AntDesign name={rating >= 2 ? "star" : "staro"} size={15} />
      <AntDesign name={rating >= 3 ? "star" : "staro"} size={15} />
      <AntDesign name={rating >= 4 ? "star" : "staro"} size={15} />
      <AntDesign name={rating >= 5 ? "star" : "staro"} size={15} />
    </View>
  );
}

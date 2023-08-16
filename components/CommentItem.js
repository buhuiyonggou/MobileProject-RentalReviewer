import { View, Text, Pressable, StyleSheet } from "react-native";
import { useNavigation } from "@react-navigation/native";
import { AntDesign } from "@expo/vector-icons";
import { MaterialIcons } from "@expo/vector-icons";
import PressableButton from "./PressableButton";
import React, { useState } from "react";
import { deleteComment, updateComment } from "../Firebase/firestoreHelper";

export default function CommentItem({ commentData, reviewData }) {
  const [likes, setLikes] = useState(commentData.likes);
  const [isLiked, setIsLiked] = useState(true);
  const navigation = useNavigation();

  function toggleLikes() {
    let updatedLikes = isLiked ? likes - 1 : likes + 1;
    setIsLiked(!isLiked);
    setLikes(updatedLikes);
    const commentIdString = String(commentData.stampId);
    updateComment(commentIdString, { likes: likes });
  }

  function commentDeleted() {
    deleteComment(commentData.stampId);
  }

  function pressFunction(commentData) {
    navigation.navigate("UpdateComment", { commentData, reviewData });
  }

  return (
    <View>
      <Pressable
        onPress={() => pressFunction(commentData)}
        android_ripple={{ color: "blue" }}
        style={({ pressed }) => {
          return [styles.container, pressed && styles.pressedStyle];
        }}
      >
        <Text style={styles.text}>{commentData.content}</Text>
        {commentData.createdBy === reviewData.createdBy && (
          <>
            <PressableButton
              pressableFunction={() => {
                commentDeleted();
              }}
              defaultStyle={styles.defaultUpdateButton}
              pressedStyle={styles.pressedUpdateButton}
            >
              <AntDesign name="delete" size={18} color="black" />
            </PressableButton>
          </>
        )}
        <PressableButton
          pressableFunction={() => {
            toggleLikes();
          }}
          defaultStyle={styles.defaultUpdateButton}
          pressedStyle={styles.pressedUpdateButton}
        >
          <MaterialIcons
            style={styles.icon}
            name={isLiked ? "favorite" : "favorite-border"}
            size={18}
            color="red"
          />
        </PressableButton>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    alignContent: "center",
  },
});

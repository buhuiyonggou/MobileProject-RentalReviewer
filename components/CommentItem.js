import { View, Text, StyleSheet } from "react-native";
import { useNavigation } from "@react-navigation/native";
import { AntDesign } from "@expo/vector-icons";
import { MaterialIcons } from "@expo/vector-icons";
import React, { useState } from "react";
import { deleteComment, updateComment } from "../Firebase/firestoreHelper";
import StarRating from "./StarRating";
import { getAuth } from "firebase/auth";
import ColorsHelper from "../components/ColorsHelper";
import { auth } from "../Firebase/firebase-setup";

export default function CommentItem({ commentData, reviewData }) {
  const [likes, setLikes] = useState(commentData.likes ? commentData.likes : 0);
  const [isLiked, setIsLiked] = useState(
    commentData.likedBy.includes(auth.currentUser.uid)
  );
  const user = getAuth().currentUser;
  const navigation = useNavigation();

  function toggleLikes() {
    let updateLikes = likes;
    let updateLikedBy = Array.isArray(commentData.likedBy)
      ? [...commentData.likedBy]
      : [];
    if (isLiked) {
      updateLikes -= 1;
      updateLikedBy = updateLikedBy.filter(
        (id) => id !== commentData.createdBy
      );
    } else {
      updateLikes += 1;
      updateLikedBy.push(commentData.createdBy);
    }
    setIsLiked(!isLiked);
    setLikes(updateLikes);
    updateComment(commentData.stampId, {
      likes: updateLikes,
      likedBy: updateLikedBy,
    });
  }

  function commentDeleted() {
    deleteComment(commentData.stampId);
  }

  function pressFunction(commentData) {
    if (commentData.createdBy === user.uid) {
      navigation.navigate("UpdateComment", { commentData, reviewData });
    } else {
      return;
    }
  }

  return (
    <View style={styles.container}>
      <View style={styles.pressableContainer}>
        <View style={styles.likes}>
          <MaterialIcons
            style={styles.icon}
            name={isLiked ? "favorite" : "favorite-border"}
            size={20}
            color="red"
            onPress={() => {
              toggleLikes();
            }}
          />
          <Text style={styles.text}>{likes}</Text>
        </View>
        <View style={styles.textContainer}>
          <Text style={styles.text}>{commentData.content}</Text>
          <View style={{ flexDirection: "row", alignItems: "center" }}>
            <Text style={styles.text}>Rating: </Text>
            <StarRating rating={commentData.rating} style={styles.starRating} />
          </View>
        </View>
        {commentData.createdBy === user.uid && (
          <>
            <AntDesign
              name="edit"
              size={18}
              color="black"
              style={{ paddingRight: 10 }}
              onPress={() => pressFunction(commentData, reviewData)}
            />
            <AntDesign
              name="delete"
              size={18}
              color="black"
              onPress={() => {
                commentDeleted();
              }}
            />
          </>
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    alignContent: "center",
  },
  pressableContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    backgroundColor: ColorsHelper.cardBackGround,
    margin: 5,
    paddingVertical: 10,
  },
  textContainer: {
    flex: 1,
    multiline: true,
    marginLeft: 5,
    marginRight: 5,
    justifyContent: "center",
  },
  text: {
    textAlign: "left",
    padding: 4,
    flexWrap: "wrap",
  },
  starRating: {},
});

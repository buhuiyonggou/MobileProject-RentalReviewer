import React, { useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  ScrollView,
  Alert,
} from "react-native";
import PressableButton from "../components/PressableButton";
import { deleteComment, updateComment } from "../Firebase/firestoreHelper";

const UpdateComment = (props) => {
  const navigation = props.navigation;
  const review = props.route.params.item;
  const reviewItem = props.route.params.reviewItem;
  const [comment, setComment] = useState(review.comment);
  const [rating, setRating] = useState(review.rating);

  const deleteCommentHandler = () => {
    deleteComment(review.id);
    navigation.navigate("Detail", { item: reviewItem });
  };

  const updateCommentHandler = () => {
    if (!comment || !rating) {
      Alert.alert("Validation Error", "Comment and Rating are required.");
      return;
    }

    const ratingNumber = parseInt(rating);
    if (isNaN(ratingNumber) || ratingNumber < 1 || ratingNumber > 5) {
      Alert.alert("Validation Error", "Rating must be between 1 and 5.");
      return;
    }

    const data = {
      comment: comment,
      rating: rating,
    };
    updateComment(reviewItem.id, review.id, data);
    navigation.navigate("ReviewDetails", { item: reviewItem });
  };

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <View style={styles.info}>
        <Text style={styles.commentText}>Comment:</Text>
      </View>
      <View>
        <TextInput
          style={styles.input}
          value={comment}
          onChangeText={(text) => setComment(text)}
          multiline
        />
      </View>
      <View style={styles.info}>
        <Text style={styles.ratingText}>Rating:</Text>
      </View>
      <View>
        <TextInput
          style={styles.input}
          value={rating}
          onChangeText={(text) => setRating(text)}
        />
      </View>
      <View style={styles.buttonContainer}>
        <PressableButton
          style={[styles.button, { backgroundColor: "blue" }]}
          pressHandler={deleteCommentHandler}
        >
          <Text>Delete</Text>
        </PressableButton>
        <PressableButton
          style={styles.button}
          pressHandler={updateCommentHandler}
        >
          <Text>Update</Text>
        </PressableButton>
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    marginTop: 70,
    marginLeft: 20,
    backgroundColor: "white",
    borderRadius: 10,
    paddingBottom: 20,
    height: 600,
    width: 380,
  },
  commentText: {
    marginTop: 30,
    fontSize: 20,
    fontWeight: "bold",
    color: colors.black,
  },
  ratingText: {
    fontSize: 20,
    fontWeight: "bold",
    color: "black",
    marginRight: 28,
  },
  input: {
    borderWidth: 3,
    borderRadius: 5,
    borderColor: "blue",
    padding: 8,
    margin: 10,
    width: 350,
    height: 100,
  },
  info: {
    flexDirection: "row",
    alignItems: "center",
    padding: 10,
  },
  buttonContainer: {
    marginTop: 20,
  },
  button: {
    marginTop: 20,
    width: 340,
    backgroundColor: "blue",
    padding: 10,
    marginVertical: 6,
    marginHorizontal: 15,
    flexDirection: "row",
    justifyContent: "space-evenly",
    borderRadius: 5,
  },
});

export default UpdateComment;

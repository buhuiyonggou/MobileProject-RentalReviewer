import React, { useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  ScrollView,
  Alert,
} from "react-native";
import { Dropdown } from "react-native-element-dropdown";
import PressableButton from "../components/PressableButton";
import { ratings } from "../components/DropDownData";
import { updateComment } from "../Firebase/firestoreHelper";
import ColorsHelper from "../components/ColorsHelper";

const UpdateComment = (props) => {
  const commentData = props.route.params.commentData;
  const reviewData = props.route.params.reviewData;

  const [commentContent, setCommentContent] = useState(commentData.content);
  const [rating, setRating] = useState(commentData.rating);

  function reset() {
    setCommentContent("");
    setRating("");
  }

  const updateCommentHandler = () => {
    if (commentContent === "") {
      Alert.alert("Please enter a comment");
    } else if (rating === "") {
      Alert.alert("Please select a rating");
    } else {
      updateComment(commentData.stampId, {
        content: commentContent,
        rating: rating,
      });
      Alert.alert("Comment updated successfully!");
      props.navigation.navigate("Detail", {
        review: reviewData,
      });
    }
  };

  return (
    // <View style={styles.container}>
    <ScrollView contentContainerStyle={styles.container}>
      <View style={styles.info}>
        <Text style={styles.text}>Update Comment:</Text>

        <TextInput
          style={styles.input}
          value={commentContent}
          onChangeText={(text) => setCommentContent(text)}
          placeholder="Reset your comment"
          multiline
        />

        <View style={styles.rating}>
          {/* <AntDesign style={styles.icon} color="black" name="staro" size={20} /> */}
          <Text style={styles.text}>Update Rating:</Text>
        </View>
        <Dropdown
          style={styles.dropdownRating}
          placeholderStyle={styles.placeholderStyle}
          selectedTextStyle={styles.selectedTextStyle}
          data={ratings}
          maxHeight={300}
          labelField="label"
          valueField="value"
          placeholder="Reset your rating(1-5)"
          value={rating}
          onChange={(item) => {
            setRating(item.value);
          }}
        />
      </View>
      <View style={styles.buttonContainer}>
        <PressableButton
          defaultStyle={styles.button}
          pressedStyle={styles.buttonPressed}
          pressableFunction={() => {
            reset();
          }}
        >
          <Text style={styles.buttonContext}>Cancel</Text>
        </PressableButton>
        <PressableButton
          defaultStyle={styles.button}
          pressedStyle={styles.buttonPressed}
          pressableFunction={() => {
            updateCommentHandler();
          }}
        >
          <Text style={styles.buttonContext}>Update</Text>
        </PressableButton>
      </View>
    </ScrollView>
    // </View>
  );
};

const styles = StyleSheet.create({
  container: {
    margin: 10,
    marginTop: 40,
  },
  info: {
    marginBottom: 30,
    marginLeft: 15,
    justifyContent: "center",
  },
  input: {
    borderWidth: 2,
    borderColor: ColorsHelper.headers,
    borderRadius: 10,
    marginTop: 10,
    marginBottom: 40,
    marginLeft: 5,
    width: "90%",
    height: 100,
  },
  dropdownRating: {
    margin: 5,
    height: 40,
    borderRadius: 5,
    borderBottomColor: ColorsHelper.headers,
    borderBottomWidth: 2,
    width: "90%",
  },
  placeholderStyle: {
    color: ColorsHelper.gray,
    textAlign: "center",
  },
  selectedTextStyle: {
    textAlign: "center",
    fontSize: 16,
  },
  text: {
    padding: 5,
    fontSize: 20,
    fontWeight: "bold",
    color: ColorsHelper.headers,
  },
  buttonContainer: {
    flexDirection: "row",
    justifyContent: "space-around",
    marginBottom: 20,
    marginTop: 60,
  },
  buttonPressed: {
    opacity: 0.5,
  },
  buttonContext: {
    fontSize: 18,
    color: ColorsHelper.white,
  },
});

export default UpdateComment;

import { StyleSheet, Text, View, TextInput } from "react-native";
import React, { useState, useEffect } from "react";
import { doc, getDoc } from "firebase/firestore";
import { collection, query, where, getDocs } from "firebase/firestore";
import { Image } from "react-native";
import { database } from "../Firebase/firebase-setup";
import {
  Ionicons,
  MaterialIcons,
  MaterialCommunityIcons,
} from "@expo/vector-icons";
import PressableButton from "./PressableButton";
import ColorsHelper from "./ColorsHelper";
import { Alert } from "react-native";
import { Dropdown } from "react-native-element-dropdown";
import { downloadImages } from "./DownLoadImages";
import { updateReview, deleteReview } from "../Firebase/firestoreHelper";
import { ratings } from "../components/DropDownData";

export default function EdiableReviews({ reviewData, navigation, onDelete }) {
  const [images, setImages] = useState([]);
  const [currentReview, setCurrentReview] = useState([]);
  //store and update the review info
  const [unit, setUnit] = useState("");
  const [rental, setRental] = useState("");
  const [rating, setRating] = useState("");
  const [comment, setComment] = useState([]);
  const [favorites, setFavorite] = useState(null);
  //editable review info
  const [editRental, setEditRental] = useState("");
  const [editRating, setEditRating] = useState("");
  // edit review status
  const [isReviewPublic, setIsReviewPublic] = useState(null);
  const [reviewDelete, setReviewDelete] = useState(false);

  //fetch current review info
  useEffect(() => {
    const fetchCurrentReview = async () => {
      try {
        const docRef = doc(database, "reviews", reviewData.id);
        const docSnap = await getDoc(docRef);

        if (docSnap.exists()) {
          const review = {
            id: docSnap.id,
            ...docSnap.data(),
          };
          setCurrentReview(review);
          setUnit(review.unitType);
          setRental(review.rental);
          setRating(review.rating);
          setComment(review.comment);
          setFavorite(review.favorite);
          setIsReviewPublic(review.isVisible);
        } else {
          console.log("No such document!");
        }
      } catch (error) {
        console.log("Error fetching reviews:", error);
      }
    };

    fetchCurrentReview();
  }, [reviewData]);

  //fetch comments created by current user
  useEffect(() => {
    const fetchComments = async () => {
      try {
        const q = query(
          collection(database, "comments"),
          where("reviewId", "==", reviewData.id)
        );
        const querySnapshot = await getDocs(q);

        const getComments = querySnapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        }));
        setComment(getComments);
      } catch (error) {
        console.log("Error fetching reviews:", error);
      }
    };

    fetchComments();
  }, [reviewData]);

  //update review info
  async function handleReviewsInfoEdit(
    reviewData,
    updateField,
    toggleEditFunction
  ) {
    try {
      const fieldValue = Object.values(updateField)[0];
      if (fieldValue && fieldValue.trim() !== "") {
        await updateReview(reviewData.id, updateField);
        toggleEditFunction((prevState) => !prevState);
      } else {
        Alert.alert("Validation Error", "Please fill in the required fields.");
      }
    } catch (error) {
      console.error("Error in handleUserInfoEdit:", error);
    }
  }

  //handle visibility of review
  async function handleReviewVisibility(reviewData, toggleEditFunction) {
    try {
      await updateReview(reviewData.id, {
        isVisible: !isReviewPublic,
      });
      toggleEditFunction((prevState) => !prevState);
    } catch (error) {
      console.error("Error in handleUserInfoEdit:", error);
    }
  }

  const reviewPressedToDetail = (review) => {
    navigation.navigate("Detail", {
      review: review,
      imageUri: images,
    });
  };

  // Download image from storage
  useEffect(() => {
    async function fetchImages() {
      const downloadedImages = await downloadImages(reviewData);
      setImages(downloadedImages);
    }

    fetchImages();
  }, [reviewData]);

  const handleReviewDelete = async (reviewId) => {
    try {
      await deleteReview(reviewId);
      setReviewDelete(false);
      if (onDelete) {
        onDelete(reviewId);
      }
    } catch (error) {
      console.error("Error deleting review: ", error);
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.imageContainer}>
        <Image
          source={{ uri: images[0] }}
          style={styles.image}
          onError={(e) => {
            console.error("Error loading image: ", e.nativeEvent.error);
          }}
        />
      </View>

      <View style={styles.infoContainer}>
        <View style={styles.infoDisplay}>
          <Ionicons style={styles.icon} name="home" size={15} />
          <Text style={styles.text}>Address: {reviewData.address}</Text>
        </View>

        <View style={styles.infoDisplay}>
          <MaterialIcons
            style={styles.icon}
            name="local-post-office"
            size={15}
          />
          <Text style={styles.text}>Postal: {reviewData.postCode}</Text>
        </View>

        <View style={styles.infoDisplay}>
          <MaterialCommunityIcons style={styles.icon} name="city" size={15} />
          <Text style={styles.text}>City: {reviewData.city}</Text>
        </View>

        <View style={styles.infoDisplay}>
          <Ionicons style={styles.icon} name="bed" size={15} />
          <Text style={styles.text}>Unit Type: {reviewData.unitType}</Text>
        </View>
      </View>

      <View style={styles.EdiableInfoContainer}>
        <View style={styles.EdiableInfoDisplay}>
          <View style={styles.outPut}>
            <MaterialIcons style={styles.icon} name="attach-money" size={15} />
            <Text style={styles.text}>Rental: </Text>
            {!editRental ? (
              <Text style={styles.text}>{rental}</Text>
            ) : (
              <TextInput
                style={styles.inputArea}
                placeholder="Please enter your rental as $"
                value={rental}
                onChangeText={(text) => {
                  const numericRegex = /^[0-9]*(\.[0-9]{0,2})?$/;
                  if (text === "") {
                    setRental(text);
                    return;
                  }
                  if (numericRegex.test(text)) {
                    setRental(text);
                  } else {
                    Alert.alert(
                      "Validation Error",
                      "Please enter a valid numeric value for the rental."
                    );
                  }
                }}
                keyboardType="numeric"
              />
            )}
          </View>
          <View>
            {!editRental ? (
              <PressableButton
                pressableFunction={() => {
                  setEditRental(true);
                }}
                pressedStyle={styles.buttonPressed}
              >
                <Text style={styles.buttonDescription}>Edit</Text>
              </PressableButton>
            ) : (
              <PressableButton
                pressableFunction={() => {
                  handleReviewsInfoEdit(
                    reviewData,
                    { rental: rental },
                    setEditRental
                  );
                }}
                pressedStyle={styles.buttonPressed}
              >
                <Text style={styles.buttonDescription}>Confirm</Text>
              </PressableButton>
            )}
          </View>
        </View>
        {/* Display rating */}
        <View style={styles.EdiableInfoDisplay}>
          <View style={styles.outPut}>
            <MaterialIcons style={styles.icon} name="star-rate" size={15} />
            <Text style={styles.text}>Rating: </Text>
            {!editRating ? (
              <Text style={styles.text}>{rating}</Text>
            ) : (
              <Dropdown
                style={styles.dropdownRating}
                placeholderStyle={styles.placeholderStyle}
                selectedTextStyle={styles.selectedTextStyle}
                data={ratings}
                maxHeight={300}
                labelField="label"
                valueField="value"
                placeholder="Select your rating"
                value={rating}
                onChange={(item) => {
                  setRating(item.value);
                }}
              />
            )}
          </View>

          <View>
            {!editRating ? (
              <PressableButton
                pressableFunction={() => {
                  setEditRating(true);
                }}
                pressedStyle={styles.buttonPressed}
              >
                <Text style={styles.buttonDescription}>Edit</Text>
              </PressableButton>
            ) : (
              <PressableButton
                pressableFunction={() => {
                  handleReviewsInfoEdit(
                    reviewData,
                    { rating: rating },
                    setEditRating
                  );
                }}
                pressedStyle={styles.buttonPressed}
              >
                <Text style={styles.buttonDescription}>Confirm</Text>
              </PressableButton>
            )}
          </View>
        </View>
        {/* Display statistics of comments and favorites */}
        <View style={styles.EdiableInfoDisplay}>
          <View style={styles.outPut}>
            <MaterialCommunityIcons
              style={styles.icon}
              name="comment-multiple-outline"
              size={15}
            />
            <Text style={styles.text}>
              Comments:{" "}
              {Array.isArray(comment) ? comment.length : comment ? 1 : 0}
            </Text>
          </View>
          <PressableButton
            pressableFunction={() => reviewPressedToDetail(reviewData, images)}
            pressedStyle={styles.buttonPressed}
            defaultStyle={{
              backgroundColor: ColorsHelper.headerRight,
              marginBottom: 10,
              width: 150,
              marginBottom: 0,
            }}
          >
            <Text style={styles.buttonDetail}>Review Comments</Text>
          </PressableButton>
        </View>

        <View style={styles.infoDisplay}>
          <MaterialIcons style={styles.icon} name="favorite" size={15} />
          <Text style={styles.text}>
            Favorites: {favorites ? favorites : 0}
          </Text>
        </View>
      </View>

      <View style={styles.reviewStatus}>
        <PressableButton
          pressableFunction={() => {
            handleReviewVisibility(reviewData, setIsReviewPublic);
          }}
          pressedStyle={styles.buttonPressed}
          defaultStyle={isReviewPublic ? styles.toggleOn : styles.toggleOff}
        >
          <Text style={styles.buttonDescription}>
            {isReviewPublic ? "Make Private" : "Make Public"}
          </Text>
        </PressableButton>

        <PressableButton
          pressableFunction={() => {
            if (!reviewDelete) {
              Alert.alert(
                "Delete Review",
                "Are you sure you want to delete this review?",
                [
                  { text: "Cancel", onPress: () => console.log("Cancelled") },
                  {
                    text: "Confirm",
                    onPress: () => handleReviewDelete(reviewData.id),
                  },
                ]
              );
            }
          }}
          pressedStyle={{ backgroundColor: ColorsHelper.red, opacity: 0.5 }}
          defaultStyle={styles.toggleOn}
        >
          <Text style={styles.buttonDescription}>
            {reviewDelete ? "Confirm" : "Delete"}
          </Text>
        </PressableButton>
      </View>
      <View style={styles.leaveSpace}></View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 10,
    alignItems: "center",
    borderWidth: 1,
    width: "90%",
    marginBottom: 10,
  },
  imageContainer: {
    width: "100%",
    height: 200,
    marginBottom: 10,
  },
  image: {
    width: "100%",
    height: "100%",
    resizeMode: "cover",
  },
  infoContainer: {
    width: "100%",
  },
  infoDisplay: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 10,
  },
  icon: {
    marginRight: 5,
  },
  text: {
    fontSize: 16,
  },
  buttonContainer: {
    flexDirection: "row",
    justifyContent: "space-around",
    marginBottom: 20,
  },
  buttonText: {
    fontSize: 14,
    color: ColorsHelper.white,
  },
  EdiableInfoContainer: {
    width: "100%",
    marginBottom: 15,
  },
  EdiableInfoDisplay: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 5,
  },
  reviewStatus: {
    flexDirection: "row",
    width: "80%",
    justifyContent: "space-between",
  },
  outPut: {
    flexDirection: "row",
    alignItems: "center",
  },
  buttonDescription: {
    fontSize: 14,
    fontWeight: "bold",
    color: ColorsHelper.white,
  },
  buttonDetail: {
    fontSize: 16,
    color: ColorsHelper.headers,
    // fontWeight: "bold",
  },
  buttonPressed: {
    backgroundColor: ColorsHelper.buttonPressed,
    opacity: 0.5,
  },
  toggleOff: {
    backgroundColor: ColorsHelper.buttonDefault,
  },
  toggleOn: {
    backgroundColor: ColorsHelper.red,
  },
  inputArea: {
    backgroundColor: ColorsHelper.lightgrey,
    textAlign: "center",
    width: "40%",
    height: "100%",
    borderBottomWidth: 1,
  },
  dropdownRating: {
    height: 20,
    borderRadius: 6,
    borderBottomColor: ColorsHelper.gray,
    borderBottomWidth: 0.9,
    width: "40%",
  },
  placeholderStyle: {
    color: ColorsHelper.gray,
    textAlign: "center",
  },
  selectedTextStyle: {
    textAlign: "center",
  },
  leaveSpace: {
    height: 20,
  },
});

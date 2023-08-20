import {
  View,
  Text,
  TextInput,
  ScrollView,
  StyleSheet,
  Alert,
  Linking,
} from "react-native";
import React, { useState, useEffect } from "react";
import { Dropdown } from "react-native-element-dropdown";
import { database } from "../Firebase/firebase-setup";
import { ratings } from "../components/DropDownData";
import { doc, onSnapshot } from "firebase/firestore";
import { collection, query, where, getDocs } from "firebase/firestore";
import { addComment } from "../Firebase/firestoreHelper";
import CommentItem from "../components/CommentItem";
import ImageCarousel from "../components/ImageCarousel";
import StarRating from "../components/StarRating";
import {
  AntDesign,
  Entypo,
  Ionicons,
  MaterialIcons,
  MaterialCommunityIcons,
} from "@expo/vector-icons";
import { updateReview } from "../Firebase/firestoreHelper";
import { auth } from "../Firebase/firebase-setup";
import PressableButton from "../components/PressableButton";
import { sendCommentReceiveNotification } from "../components/PushNotificationManager";
import { WALKSCORE_API } from "@env";
import ColorsHelper from "../components/ColorsHelper";

export default function Detail({ route }) {
  const { review, imageUris } = route.params;
  const [favorite, setFavorite] = useState(
    review.favorite ? review.favorite : 0
  );
  const [isFavorite, setIsFavorite] = useState(
    review.favoritedBy.includes(auth.currentUser.uid)
  );
  const [newComment, setNewComment] = useState("");
  const [commentRating, setCommentRating] = useState("");
  const [comments, setComments] = useState([]);

  // store API data
  const [transitScore, setTransitScore] = useState(null);

  // fetch favorite number from firestore
  useEffect(() => {
    const reviewRef = doc(database, "reviews", review.id);
    const unsubscribe = onSnapshot(reviewRef, (docSnapshot) => {
      if (docSnapshot.exists) {
        setFavorite(docSnapshot.data().favorite);
      }
    });

    return () => {
      unsubscribe();
    };
  }, [favorite]);

  // fetch comments from firestore
  useEffect(() => {
    const commentsRef = collection(database, "comments");
    const queryRef = query(commentsRef, where("reviewId", "==", review.id));

    const unsubscribe = onSnapshot(
      queryRef,
      (querySnapshot) => {
        let fetchedComments = [];
        querySnapshot.forEach((doc) => {
          fetchedComments.push(doc.data());
        });

        setComments(fetchedComments);
      },
      (error) => {
        console.error("Error fetching comments: ", error);
      }
    );

    return () => {
      unsubscribe();
    };
  }, [review.id]);

  // get walkscore API
  useEffect(() => {
    const fetchTransitScore = async () => {
      try {
        const formattedLat = parseFloat(review.location.latitude).toFixed(4);
        const formattedLon = parseFloat(review.location.longitude).toFixed(4);

        if (
          formattedLat &&
          formattedLon &&
          review.address &&
          review.city &&
          review.postCode
        ) {
          const fullAddress = `${review.address}, ${review.city}, ${review.postCode}`;
          const encodedAddress = encodeURIComponent(fullAddress);

          let url = `https://api.walkscore.com/score?format=json&address=${encodedAddress}&lat=${formattedLat}&lon=${formattedLon}&transit=1&bike=1&wsapikey=${WALKSCORE_API}`;

          const response = await fetch(url);

          const data = await response.json();

          setTransitScore(data.walkscore);
        }
      } catch (error) {
        console.log("This review doesn't have a valid location.");
      }
    };

    fetchTransitScore();
  }, [review]);

  function updateFavorite() {
    let updatedFavorite = favorite;
    let updatedFavoritedBy = Array.isArray(review.favoritedBy)
      ? [...review.favoritedBy]
      : [];

    if (isFavorite) {
      updatedFavorite -= 1;
      updatedFavoritedBy = updatedFavoritedBy.filter(
        (id) => id !== auth.currentUser.uid
      );
    } else {
      updatedFavorite += 1;
      updatedFavoritedBy.push(auth.currentUser.uid);
    }
    setIsFavorite(!isFavorite);
    setFavorite(updatedFavorite);
    updateReview(review.id, {
      favorite: updatedFavorite,
      favoritedBy: updatedFavoritedBy,
    });
  }

  const submitComment = async () => {
    if (newComment.trim()) {
      const reviewOwnerId = await addComment(
        { content: newComment, rating: commentRating },
        review.id
      );
      setNewComment("");
      setCommentRating("");

      // Query the users collection to get the document of the review owner
      const usersRef = collection(database, "users");
      const queryRef = query(usersRef, where("userId", "==", review.createdBy));
      const querySnapshot = await getDocs(queryRef);

      if (!querySnapshot.empty) {
        const userDoc = querySnapshot.docs[0];
        const ownerPushToken = userDoc.data().pushToken;

        if (ownerPushToken) {
          sendCommentReceiveNotification(ownerPushToken);
        }
      }
    } else {
      Alert.alert("Validation Error", "Comment is required.");
    }
  };

  return (
    <ScrollView>
      <View style={styles.exploreContainer}>
        <ImageCarousel imageUris={imageUris} />

        <View style={styles.infoContainer}>
          <View style={styles.singleDisplay}>
            <Ionicons style={styles.icon} name="home" size={15} />
            <Text style={styles.text}>Address: {review.address}</Text>
          </View>
          <View style={styles.singleDisplay}>
            <MaterialIcons name="directions-walk" size={15} />
            <View style={{ flexDirection: "row" }}>
              <Text style={styles.text}>
                WalkScore(1-100): {transitScore ? transitScore : "  Not Found"}
              </Text>
              <Text> </Text>
              <AntDesign
                name="questioncircle"
                size={15}
                color="black"
                onPress={() => {
                  Linking.openURL("https://www.walkscore.com/how-it-works/");
                }}
              />
            </View>
          </View>

          <View style={styles.infoDisplay}>
            <View style={styles.displayItem}>
              <MaterialIcons
                style={styles.icon}
                name="local-post-office"
                size={15}
              />
              <Text style={styles.text}>Postal: {review.postCode}</Text>
            </View>

            <View style={styles.displayItem}>
              <MaterialCommunityIcons
                style={styles.icon}
                name="city"
                size={15}
              />
              <Text style={styles.text}>City: {review.city}</Text>
            </View>
          </View>

          <View style={styles.infoDisplay}>
            <View style={styles.displayItem}>
              <Ionicons style={styles.icon} name="bed" size={15} />
              <Text style={styles.text}>Unit Type: {review.unitType}</Text>
            </View>
            <View style={styles.displayItem}>
              <MaterialIcons
                style={styles.icon}
                name="attach-money"
                size={15}
              />
              <Text style={styles.text}>rental: {review.rental}</Text>
            </View>
          </View>

          <View style={styles.infoDisplay}>
            {review.contractTerm && (
              <View style={styles.displayItem}>
                <Entypo style={styles.icon} name="documents" size={15} />
                <Text style={styles.text}>Term: {review.contractTerm}</Text>
              </View>
            )}
            {review.petPolicy && (
              <View style={styles.displayItem}>
                <MaterialIcons style={styles.icon} name="pets" size={15} />
                <Text style={styles.text}>Pet Policy: {review.petPolicy}</Text>
              </View>
            )}
          </View>

          <View style={styles.infoDisplay}>
            <View style={styles.displayItem}>
              <MaterialIcons style={styles.icon} name="rate-review" size={15} />
              <Text style={styles.text}>Rating: </Text>
              <StarRating rating={review.rating} />
            </View>
            <View style={styles.displayItem}>
              <MaterialIcons
                style={styles.icon}
                name={isFavorite ? "favorite" : "favorite-border"}
                size={20}
                color="red"
                onPress={() => {
                  updateFavorite();
                }}
              />
              <Text style={styles.text}>Favorite: {favorite}</Text>
            </View>
          </View>

          {/* render all comments here */}
          <View style={styles.commentContainer}>
            <Text style={styles.commentText}>Comment</Text>
            <TextInput
              value={newComment}
              onChangeText={setNewComment}
              placeholder="Add a comment..."
              style={styles.commentInput}
            />

            <View style={styles.commentRating}>
              <Text style={styles.commentText}>Rating</Text>

              <Dropdown
                style={styles.dropdownRating}
                placeholderStyle={styles.placeholderStyle}
                selectedTextStyle={styles.selectedTextStyle}
                data={ratings}
                maxHeight={300}
                labelField="label"
                valueField="value"
                placeholder="Select your rating (1-5)"
                value={commentRating}
                onChange={(item) => {
                  setCommentRating(item.value);
                }}
              />
            </View>

            <View style={{ alignItems: "center", marginTop: 30 }}>
              <PressableButton
                defaultStyle={{ width: "50%" }}
                pressableFunction={submitComment}
              >
                <Text style={{ fontSize: 18, color: ColorsHelper.white }}>
                  Add Comment
                </Text>
              </PressableButton>
            </View>

            <View style={styles.commentDisplay}>
              <View style={styles.commentHeader}>
                <Text
                  style={{
                    fontSize: 18,
                    color: ColorsHelper.headers,
                    fontWeight: "bold",
                  }}
                >
                  All Comments:{" "}
                </Text>
              </View>
              {comments
                .sort((a, b) => b.likes - a.likes)
                .map((comment) => {
                  return (
                    <CommentItem
                      key={comment.stampId}
                      commentData={comment}
                      reviewData={review}
                    />
                  );
                })}
            </View>
          </View>
        </View>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  exploreContainer: {
    flex: 1,
    padding: 10,
    alignItems: "center",
  },
  imageContainer: {
    width: 320,
    height: 130,
    marginTop: 5,
    justifyContent: "center",
  },
  image: {
    width: 110,
    height: 110,
    resizeMode: "cover",
    alignSelf: "center",
    marginLeft: "auto",
    marginRight: "auto",
  },
  infoDisplay: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    alignItems: "center",
    margin: 5,
  },
  singleDisplay: {
    flexDirection: "row",
    alignItems: "center",
    margin: 10,
    marginBottom: 5,
  },
  displayItem: {
    flexDirection: "row",
    alignItems: "center",
    margin: 5,
    width: "45%",
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
    marginBottom: 30,
  },
  buttonText: {
    fontSize: 14,
    color: ColorsHelper.white,
  },
  locationDisplay: {
    alignItems: "center",
    margin: 10,
    marginTop: 10,
    height: 320,
  },
  map: {
    width: "90%",
  },
  commentContainer: {
    marginTop: 10,
    marginBottom: 20,
  },
  commentText: {
    // fontWeight: "bold",
    fontSize: 18,
    fontWeight: "bold",
    marginTop: 20,
    marginBottom: 6,
    marginLeft: 10,
    marginRight: 15,
    color: ColorsHelper.headers,
  },
  commentInput: {
    height: 80,
    borderColor: ColorsHelper.gray,
    borderWidth: 1,
    borderRadius: 5,
    margin: 10,
    padding: 10,
    paddingLeft: 10,
    maxWidth: "100%",
    textAlign: "left",
  },
  commentRating: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 15,
    marginTop: 15,
  },
  dropdownRating: {
    margin: 5,
    height: 40,
    borderRadius: 5,
    borderBottomColor: ColorsHelper.gray,
    borderBottomWidth: 0.8,
    width: "75%",
  },
  placeholderStyle: {
    color: ColorsHelper.gray,
    textAlign: "center",
  },
  commentDisplay: {
    marginTop: 20,
    padding: 15,
  },
  commentHeader: {
    marginBottom: 15,
    marginTop: 30,
  },
});

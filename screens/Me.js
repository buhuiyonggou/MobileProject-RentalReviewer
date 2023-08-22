import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  TextInput,
  StyleSheet,
  ScrollView,
  Alert,
} from "react-native";
import { collection, query, where, getDocs } from "firebase/firestore";
import { database } from "../Firebase/firebase-setup";
import { auth } from "../Firebase/firebase-setup";
import { updatePassword } from "firebase/auth";
import PressableButton from "../components/PressableButton";
import { updateUser } from "../Firebase/firestoreHelper";
import { sendPostingNotification } from "../components/LocalNotificationManager";
import EdiableReviews from "../components/EdiableReviews";
import ColorsHelper from "../components/ColorsHelper";

const Me = ({ navigation }) => {
  //user and review info from firebase
  const [user, setUser] = useState(null);
  const [reviewList, setReviewList] = useState([]);
  //edit user info
  const [editNickName, setEditNickName] = useState(false);
  const [editGender, setEditGender] = useState(false);
  const [editDateOfBirth, setEditDateOfBirth] = useState(false);
  const [editPassword, setEditPassword] = useState(false);
  // user info properties
  const [nickName, setNickName] = useState("");
  const [gender, setGender] = useState("");
  const [dateOfBirth, setDateOfBirth] = useState("");
  const [password, setPassword] = useState("");
  // send notification
  const [ifNotification, setIfNotification] = useState(false);

  const dateRegex =
    /^(?:19|20)[0-9]{2}-(?:(?:0[1-9]|1[0-2])-(?:0[1-9]|1[0-9]|2[0-8])|(?:0[13-9]|1[0-2])-(?:29|30)|(?:0[13578]|1[02])-31)$/;

  const [dateWarning, setDateWarning] = useState(false);

  const fetchUserData = async () => {
    try {
      const q = query(
        collection(database, "users"),
        where("userId", "==", auth.currentUser.uid)
      );
      const querySnapshot = await getDocs(q);

      if (querySnapshot.empty) {
        console.log("No matching documents.");
        return;
      }

      const userData = querySnapshot.docs[0].data();
      setUser({
        id: querySnapshot.docs[0].id,
        ...userData,
      });
      setNickName(userData.nickName);
      setGender(userData.gender);
      setDateOfBirth(userData.dateOfBirth);
    } catch (error) {
      console.log("Error fetching user data:", error);
    }
  };

  const fetchReviews = async () => {
    try {
      const q = query(
        collection(database, "reviews"),
        where("createdBy", "==", auth.currentUser.uid)
      );
      const querySnapshot = await getDocs(q);

      const userReviews = querySnapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));
      setReviewList(userReviews);
    } catch (error) {
      console.log("Error fetching reviews:", error);
    }
  };

  useEffect(() => {
    const unsubscribe = navigation.addListener("focus", () => {
      fetchUserData();
      fetchReviews();
      setIfNotification(true);
    });

    return unsubscribe;
  }, []);

  useEffect(() => {
    if (ifNotification && reviewList.length === 0) {
      sendPostingNotification();
      setIfNotification(false);
    }
  }, [reviewList]);

  async function handleUserInfoEdit(updateField, toggleEditFunction) {
    try {
      await updateUser(user.id, updateField);
      toggleEditFunction((prevState) => !prevState);
    } catch (error) {
      console.error("Error in handleUserInfoEdit:", error);
    }
  }

  async function handlePasswordUpdate(newPassword) {
    if (auth.currentUser) {
      try {
        await updatePassword(auth.currentUser, newPassword);
        // add a notification to user later
        if (newPassword) {
          Alert.alert("Password updated successfully");
          setEditPassword(!editPassword);
        } else {
          Alert.alert("Password cannot be empty. Please try again.");
        }
      } catch (error) {
        Alert.alert(
          "Due to security policy, I may need re-login and change your password."
        );
        console.error("Error updating password:", error);
      }
    }
  }

  const callBackReviewDeleted = (reviewId) => {
    setReviewList((prevList) =>
      prevList.filter((review) => review.id !== reviewId)
    );
  };

  const callBackReviewPosted = (review) => {
    setReviewList((prevList) => [...prevList, review]);
  };

  return (
    <ScrollView styles={styles.container}>
      <View style={styles.userInfo}>
        <Text style={styles.header}>My Profile</Text>
        <View style={styles.email}>
          <Text style={styles.textLabel}>Email: </Text>
          <Text>{auth.currentUser.email} </Text>
          <Text>&nbsp;</Text>
          <Text>&nbsp;</Text>
          <Text>&nbsp;</Text>
        </View>

        <View style={styles.nickName}>
          <Text style={styles.textLabel}>NickName: </Text>
          {!editNickName ? (
            <Text>{nickName}</Text>
          ) : (
            <TextInput
              style={styles.inputArea}
              placeholder="Enter NickName"
              value={nickName}
              onChangeText={(text) => setNickName(text)}
            />
          )}
          {!editNickName ? (
            <PressableButton
              pressableFunction={() => {
                setEditNickName(true);
              }}
            >
              <Text style={styles.buttonDescription}>Edit</Text>
            </PressableButton>
          ) : (
            <PressableButton
              pressableFunction={() => {
                handleUserInfoEdit({ nickName }, setEditNickName);
              }}
            >
              <Text style={styles.buttonDescription}>Confirm</Text>
            </PressableButton>
          )}
        </View>

        <View style={styles.gender}>
          <Text style={styles.textLabel}>Gender: </Text>
          {!editGender ? (
            <Text>{gender}</Text>
          ) : (
            <TextInput
              style={styles.inputArea}
              placeholder="Female / Male"
              value={gender}
              onChangeText={(text) => setGender(text)}
            />
          )}
          {!editGender ? (
            <PressableButton
              pressableFunction={() => {
                setEditGender(true);
              }}
            >
              <Text style={styles.buttonDescription}>Edit</Text>
            </PressableButton>
          ) : (
            <PressableButton
              pressableFunction={() => {
                handleUserInfoEdit({ gender }, setEditGender);
              }}
            >
              <Text style={styles.buttonDescription}>Confirm</Text>
            </PressableButton>
          )}
        </View>

        <View style={styles.dateOfBirth}>
          <Text style={styles.textLabel}>Date of Birth: </Text>
          {!editDateOfBirth ? (
            <Text>{dateOfBirth}</Text>
          ) : (
            <TextInput
              style={styles.inputArea}
              placeholder={dateWarning ? "Invalid, YYYY-MM-DD" : "YYYY-MM-DD"}
              placeholderTextColor={dateWarning ? "red" : "grey"}
              value={dateOfBirth}
              onChangeText={(text) => {
                setDateOfBirth(text);
                if (dateWarning) {
                  // Clear warning once user starts typing again
                  setDateWarning(false);
                }
              }}
            />
          )}

          {!editDateOfBirth ? (
            <PressableButton
              pressableFunction={() => {
                setEditDateOfBirth(true);
              }}
            >
              <Text style={styles.buttonDescription}>Edit</Text>
            </PressableButton>
          ) : (
            <PressableButton
              pressableFunction={() => {
                if (!dateRegex.test(dateOfBirth)) {
                  setDateOfBirth(""); // Clear the input
                  setDateWarning(true); // Display warning in the placeholder
                } else {
                  handleUserInfoEdit({ dateOfBirth }, setEditDateOfBirth);
                }
              }}
            >
              <Text style={styles.buttonDescription}>Confirm</Text>
            </PressableButton>
          )}
        </View>
        <View style={styles.password}>
          <Text style={styles.textLabel}>Password: </Text>
          {!editPassword ? (
            <Text>********</Text>
          ) : (
            <TextInput
              style={styles.inputArea}
              placeholder="New Password"
              value={password}
              secureTextEntry={true}
              onChangeText={(text) => setPassword(text)}
            />
          )}
          {!editPassword ? (
            <PressableButton
              pressableFunction={() => {
                setEditPassword(true);
              }}
            >
              <Text style={styles.buttonDescription}>Change</Text>
            </PressableButton>
          ) : (
            <PressableButton
              pressableFunction={() => {
                handlePasswordUpdate(password);
              }}
            >
              <Text style={styles.buttonDescription}>Confirm</Text>
            </PressableButton>
          )}
        </View>
      </View>
      <Text style={styles.header}>My Reviews</Text>
      <View style={styles.postTitleContainer}>
        {reviewList.map((item) => (
          <EdiableReviews
            key={item.id}
            reviewData={item}
            onDelete={callBackReviewDeleted}
            onPost={callBackReviewPosted}
            pressFunction={() => reviewPressedToDetail(item)}
            navigation={navigation}
          />
        ))}
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
  },
  userInfo: {
    flex: 1,
    width: "90%",
    alignSelf: "center",
  },
  email: {
    flexDirection: "row",
    alignItems: "center",
    padding: 5,
    justifyContent: "space-between",
  },
  nickName: {
    flexDirection: "row",
    alignItems: "center",
    padding: 5,
    justifyContent: "space-between",
  },
  gender: {
    flexDirection: "row",
    alignItems: "center",
    padding: 5,
    justifyContent: "space-between",
  },
  dateOfBirth: {
    flexDirection: "row",
    alignItems: "center",
    padding: 5,
    justifyContent: "space-between",
  },
  password: {
    flexDirection: "row",
    alignItems: "center",
    padding: 5,
    justifyContent: "space-between",
  },
  inputArea: {
    backgroundColor: ColorsHelper.lightgrey,
    textAlign: "center",
    width: "40%",
    height: "100%",
    borderBottomWidth: 1,
  },
  textLabel: {
    fontWeight: "bold",
    width: "25%",
  },
  buttonDescription: {
    fontSize: 14,
    fontWeight: "bold",
    color: ColorsHelper.white,
  },
  header: {
    fontSize: 20,
    fontWeight: "bold",
    marginBottom: 30,
    marginTop: 50,
    textAlign: "center",
    color: ColorsHelper.black,
  },
  postTitleContainer: {
    flex: 1,
    width: "100%",
    justifyContent: "center",
    alignItems: "center",
  },
});

export default Me;

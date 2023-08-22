import {
  View,
  Text,
  TextInput,
  StyleSheet,
  Alert,
  ScrollView,
  ActivityIndicator,
} from "react-native";
import React, { useEffect } from "react";
import { useState } from "react";
import PressableButton from "../components/PressableButton";
import {
  addReview,
  addComment,
  saveReviewLocation,
} from "../Firebase/firestoreHelper.js";
import ImageManager from "../components/ImageManager";
import { Dropdown } from "react-native-element-dropdown";
import { ref, uploadBytesResumable } from "firebase/storage";
import { storage, auth } from "../Firebase/firebase-setup";
import { AntDesign } from "@expo/vector-icons";
import { MaterialIcons } from "@expo/vector-icons";
import { Entypo } from "@expo/vector-icons";
import ColorsHelper from "../components/ColorsHelper";
import { terms, ratings, policies } from "../components/DropDownData";
import LocationManager from "../components/LocationManager";

export default function PostReview(props) {
  const { navigation, route } = props;
  const [address, setAddress] = useState("");
  const [postCode, setPostCode] = useState("");
  const [city, setCity] = useState("");
  const [rental, setRental] = useState("");
  const [unitType, setUnitType] = useState("");
  const [petPolicy, setPetPolicy] = useState("");
  const [contractTerm, setContractTerm] = useState("");
  const [rating, setRating] = useState("");
  const [comments, setComments] = useState("");
  const [imageUri, setImageUri] = useState([]);
  const [isResetClicked, setIsResetClicked] = useState(false);
  const [location, setLocation] = useState(null);
  const [getReviewId, setReviewId] = useState(null);
  const [resetLocation, setResetLocation] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (props.route.params?.selectedAddress) {
      setAddress(props.route.params.selectedAddress);
    }
  }, [route]);

  const validatePost = () => {
    if (
      address === "" ||
      postCode === "" ||
      city === "" ||
      rating === "" ||
      rental === "" ||
      imageUri.length === 0 ||
      unitType === "" ||
      comments === "" ||
      isNaN(rating) ||
      isNaN(rental)
    ) {
      Alert.alert("Incomplete Post", "Please fill all required fields");
      return false;
    }
    return true;
  };

  const resetFields = () => {
    setAddress("");
    setPostCode("");
    setCity("");
    setRental("");
    setUnitType("");
    setPetPolicy("");
    setContractTerm("");
    setRating("");
    setComments("");
    setImageUri([]);
    setIsResetClicked((prevState) => !prevState);
  };

  const storeImageUri = (capturedUris) => {
    setImageUri(capturedUris);
  };

  const getImageData = async (uri) => {
    const response = await fetch(uri);
    const blob = await response.blob();
    return blob;
  };

  const uploadImages = async (data) => {
    const uri = data.images;
    if (uri) {
      const imageBlob = await getImageData(uri);
      const imageName = uri.substring(uri.lastIndexOf("/") + 1);
      const imageRef = ref(storage, `images/${imageName}`);
      const uploadResult = await uploadBytesResumable(imageRef, imageBlob);
      return uploadResult.metadata.fullPath;
    }
  };

  // if click reset or submit, reset location
  useEffect(() => {
    setResetLocation((prevState) => !prevState);
  }, [isResetClicked, handleSubmit]);

  const handleLocationUpdate = (locationData) => {
    setLocation(locationData);
    // console.log("src Post, locationData: ", locationData);
  };

  const handleSubmit = async () => {
    if (!validatePost()) {
      return;
    }

    setIsLoading(true);

    let imageURLs = [];
    for (let uri of imageUri) {
      const imageURL = await uploadImages({ images: uri });
      imageURLs.push(imageURL);
    }

    const newReview = {
      address: address,
      location: location,
      postCode: postCode,
      city: city,
      unitType: unitType,
      rental: parseInt(rental),
      contractTerm: contractTerm,
      petPolicy: petPolicy,
      rating: parseInt(rating),
      images: imageURLs,
      favorite: 0,
      isVisible: true,
    };

    try {
      const reviewRef = await addReview(newReview);
      uploadImages(newReview.images);
      // console.log("newReview: ", newReview.images);
      if (props.onPost) {
        props.onPost(newReview);
      }

      const reviewId = reviewRef.id;
      // save location to firestore and clean local data
      saveReviewLocation(reviewId, location);
      setLocation(null);
      setReviewId(reviewId);

      const newComment = {
        content: comments,
        reviewId: reviewId,
        rating: parseInt(rating),
      };
      await addComment(newComment, reviewId);

      resetFields();
      navigation.navigate("Explore");
    } catch (error) {
      console.error("Error adding review or comment: ", error);
      Alert.alert(
        "Error",
        "An error occurred while submitting. Please try again."
      );
    }
    setIsLoading(false);
  };

  return (
    <ScrollView style={styles.scrollContainer}>
      <View>
        <Text style={styles.text}>
          Address
          <Text style={{ color: ColorsHelper.red, fontSize: 20 }}>*</Text>
        </Text>
        <TextInput
          style={styles.input}
          onChangeText={setAddress}
          value={address}
          placeholder="e.g. 1234 Main St."
          autoCapitalize="none"
        />
      </View>

      <View style={styles.locationDisplay}>
        <View style={styles.map}>
          <LocationManager
            handleLocationUpdate={handleLocationUpdate}
            resetSignal={resetLocation}
            onAddressFound={(newAddress) => setAddress(newAddress)}
          />
        </View>
      </View>

      <View style={styles.block2}>
        <View style={styles.postCode}>
          <Text style={styles.text}>
            Postal Code
            <Text style={{ color: ColorsHelper.red, fontSize: 20 }}>*</Text>
          </Text>
          <TextInput
            style={styles.input}
            onChangeText={setPostCode}
            value={postCode}
            placeholder="e.g. V5A 1S6"
          />
        </View>
        <View style={styles.city}>
          <Text style={styles.text}>
            City<Text style={{ color: ColorsHelper.red, fontSize: 20 }}>*</Text>
          </Text>
          <TextInput
            style={styles.input}
            onChangeText={setCity}
            value={city}
            placeholder="e.g. Vancouver, Burnaby"
          />
        </View>
      </View>

      <View style={styles.block3}>
        <View style={styles.unit}>
          <Text style={styles.text}>
            UnitType
            <Text style={{ color: ColorsHelper.red, fontSize: 20 }}>*</Text>
          </Text>
          <TextInput
            style={styles.input}
            onChangeText={setUnitType}
            value={unitType}
            placeholder="e.g. 1B1B, 2B2B"
          />
        </View>
        <View style={styles.rental}>
          <Text style={styles.text}>
            Monthly Rental $
            <Text style={{ color: ColorsHelper.red, fontSize: 20 }}>*</Text>
          </Text>
          <TextInput
            style={styles.input}
            onChangeText={setRental}
            value={rental}
            keyboardType="numeric"
            placeholder="e.g. 1000"
          />
        </View>
      </View>

      <View style={styles.block4}>
        <View style={styles.contractTermContainer}>
          <Text style={styles.text}>Contract Term</Text>
          <Dropdown
            style={styles.dropdown}
            placeholderStyle={styles.placeholderStyle}
            selectedTextStyle={styles.selectedTextStyle}
            data={terms}
            maxHeight={300}
            labelField="label"
            valueField="value"
            placeholder="Select your term"
            value={contractTerm}
            onChange={(item) => {
              setContractTerm(item.value);
            }}
            renderLeftIcon={() => <Entypo name="documents" size={20} />}
          />
        </View>
        <View style={styles.petPolicyContainer}>
          <Text style={styles.text}>Pet Policy</Text>
          <Dropdown
            style={styles.dropdown}
            placeholderStyle={styles.placeholderStyle}
            selectedTextStyle={styles.selectedTextStyle}
            data={policies}
            maxHeight={300}
            labelField="label"
            valueField="value"
            placeholder="Select pet policy"
            value={petPolicy}
            onChange={(item) => {
              setPetPolicy(item.value);
            }}
            renderLeftIcon={() => <MaterialIcons name="pets" size={20} />}
          />
        </View>
      </View>

      <View style={styles.block5}>
        <View style={styles.rating}>
          <AntDesign style={styles.icon} color="black" name="staro" size={20} />
          <Text style={styles.ratingText}>
            Rating
            <Text style={{ color: ColorsHelper.red, fontSize: 20 }}>*</Text>
          </Text>
        </View>
        <Dropdown
          style={styles.dropdownRating}
          placeholderStyle={styles.placeholderStyle}
          selectedTextStyle={styles.selectedTextStyle}
          data={ratings}
          maxHeight={300}
          labelField="label"
          valueField="value"
          placeholder="Select you rating(1-5)"
          value={rating}
          onChange={(item) => {
            setRating(item.value);
          }}
        />
      </View>

      <View style={styles.block6}>
        <ImageManager storeImageUri={storeImageUri} reset={isResetClicked} />
      </View>

      <View style={styles.block7}>
        <Text style={styles.text}>
          Comment
          <Text style={{ color: ColorsHelper.red, fontSize: 20 }}>*</Text>
        </Text>
        <TextInput
          style={styles.commentInput}
          onChangeText={setComments}
          value={comments}
          multiline
          textAlignVertical="top"
        />
      </View>

      <View style={styles.buttonContainer}>
        <PressableButton
          pressableFunction={resetFields}
          pressedStyle={{
            backgroundColor: ColorsHelper.buttonPressed,
            opacity: 0.5,
          }}
        >
          <Text style={styles.buttonText}>Reset</Text>
        </PressableButton>
        <PressableButton
          pressableFunction={handleSubmit}
          pressedStyle={{
            backgroundColor: ColorsHelper.buttonPressed,
            opacity: 0.5,
          }}
        >
          <Text style={styles.buttonText}>Submit</Text>
        </PressableButton>
      </View>
      {isLoading && (
        <View style={styles.loadingOverlay}>
          <ActivityIndicator
            size="large"
            color={ColorsHelper.inactiveTintColor}
          />
        </View>
      )}
      <View style={styles.idleSpace}></View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  scrollContainer: {
    flex: 1,
    padding: 20,
  },
  text: {
    fontSize: 16,
    marginBottom: 5,
  },
  input: {
    borderWidth: 1,
    borderColor: ColorsHelper.black,
    padding: 10,
    borderRadius: 5,
    width: "100%",
    marginBottom: 15,
  },
  // block1: {},
  locationDisplay: {
    alignItems: "center",
    margin: 10,
    height: 320,
    marginBottom: 20,
  },
  map: {
    width: "90%",
  },
  block2: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 10,
  },
  postCode: {
    flex: 1,
    paddingRight: 5,
  },
  city: {
    flex: 1,
    paddingLeft: 5,
  },
  block3: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 10,
  },
  unit: {
    flex: 1,
    paddingRight: 5,
  },
  rental: {
    flex: 1,
    paddingLeft: 5,
  },
  block4: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 10,
  },
  contractTermContainer: {
    flex: 1,
    paddingRight: 5,
    flexDirection: "column",
  },
  petPolicyContainer: {
    flex: 1,
    paddingLeft: 5,
    flexDirection: "column",
  },
  dropdown: {
    margin: 5,
    height: 40,
    borderRadius: 5,
    borderBottomColor: ColorsHelper.gray,
    borderBottomWidth: 0.8,
  },
  dropdownRating: {
    margin: 5,
    height: 40,
    borderRadius: 5,
    borderBottomColor: ColorsHelper.gray,
    borderBottomWidth: 0.8,
    width: "70%",
  },
  placeholderStyle: {
    color: ColorsHelper.gray,
    textAlign: "center",
  },
  selectedTextStyle: {
    textAlign: "center",
  },
  block5: {
    marginBottom: 15,
    flexDirection: "row",
    justifyContent: "space-between",
  },
  rating: {
    width: "20%",
    alignItems: "center",
    flexDirection: "row",
  },
  ratingText: {
    fontSize: 16,
  },
  block6: {
    marginTop: 20,
    height: 150,
    width: "100%",
  },
  block7: {
    marginTop: 50,
    marginBottom: 10,
  },
  commentInput: {
    borderWidth: 1,
    borderColor: ColorsHelper.black,
    padding: 10,
    borderRadius: 5,
    paddingTop: 10,
    width: "100%",
    height: 150,
    textAlign: "left",
  },
  buttonContainer: {
    flexDirection: "row",
    justifyContent: "space-around",
    marginBottom: 30,
    marginTop: 50,
  },
  buttonText: {
    fontSize: 14,
    color: ColorsHelper.white,
  },
  loadingOverlay: {
    position: "absolute",
    top: 0,
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: ColorsHelper.backgroundColor,
    justifyContent: "center",
    alignItems: "center",
  },
  idleSpace: {
    height: 300,
  },
});

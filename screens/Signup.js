import { useState } from "react";
import {
  View,
  Text,
  TextInput,
  StyleSheet,
  Alert,
  Dimensions,
} from "react-native";
import { auth } from "../Firebase/firebase-setup";
import { addUser } from "../Firebase/firestoreHelper";
import { registerForPushNotificationsAsync } from "../components/PushNotificationManager";
import { createUserWithEmailAndPassword } from "firebase/auth";
import PressableButton from "../components/PressableButton";
import ColorsHelper from "../components/ColorsHelper";

const screenWidth = Dimensions.get("window").width;
export default function Signup({ navigation }) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  const loginHandler = () => {
    navigation.replace("Login");
  };
  const signupHandler = async () => {
    //check password with confirmpassword
    if (password !== confirmPassword) {
      Alert.alert("The passwords don't match");
      return;
    }
    try {
      const userCred = await createUserWithEmailAndPassword(
        auth,
        email,
        password
      );

      const pushToken = await registerForPushNotificationsAsync();

      console.log(pushToken);

      await addUser({
        email: email,
        nickName: "",
        gender: "",
        dateOfBirth: "",
        userId: userCred.user.uid,
        pushToken: pushToken,
      });

      Alert.alert("Signup successfully");
    } catch (err) {
      if (err.code === "auth/weak-password") {
        Alert.alert(
          "Please enter a stronger password with at least 6 characters"
        );
      } else if (err.code === "auth/email-already-in-use") {
        setEmail("");
        setPassword("");
        setConfirmPassword("");
        Alert.alert("This email is already in use");
      } else {
        console.log("signup ", err);
      }
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.label}>Email</Text>
      <TextInput
        style={styles.input}
        placeholder="Email"
        value={email}
        onChangeText={(newText) => setEmail(newText)}
      />
      <Text style={styles.label}>Password</Text>
      <TextInput
        style={styles.input}
        secureTextEntry={true}
        placeholder="Password"
        value={password}
        onChangeText={(newText) => setPassword(newText)}
      />
      <Text style={styles.label}>Confirm Password</Text>
      <TextInput
        style={styles.input}
        secureTextEntry={true}
        placeholder="Confirm Password"
        value={confirmPassword}
        onChangeText={(newText) => setConfirmPassword(newText)}
      />

      <View style={styles.buttonContainer}>
        <PressableButton
          pressableFunction={signupHandler}
          defaultStyle={styles.linkButton}
          pressedStyle={{
            backgroundColor: ColorsHelper.buttonPressed,
            opacity: 0.5,
          }}
        >
          <Text style={styles.buttonText}>Register</Text>
        </PressableButton>

        <PressableButton
          pressableFunction={loginHandler}
          defaultStyle={styles.linkButton}
          pressedStyle={{
            backgroundColor: ColorsHelper.buttonPressed,
            opacity: 0.5,
          }}
        >
          <Text style={styles.buttonText}>Already Registered? Login </Text>
        </PressableButton>
      </View>
      {/* <Button title="Register" onPress={signupHandler} />
      <Button title="Already Registered? Login" onPress={loginHandler} /> */}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: ColorsHelper.white,
    alignItems: "stretch",
    justifyContent: "center",
  },
  input: {
    borderColor: ColorsHelper.headers,
    borderWidth: 2,
    width: "90%",
    borderRadius: 5,
    width: "80%",
    height: "7%",
    marginLeft: 25,
    marginBottom: 30,
    margin: 5,
    padding: 5,
  },
  label: {
    marginLeft: 25,
    fontSize: 20,
  },
  buttonContainer: {
    flexDirection: "column",
    justifyContent: "space-between",
    alignItems: "center",
  },
  linkButton: {
    backgroundColor: ColorsHelper.transparent,
    width: screenWidth * 0.9,
  },
  buttonText: {
    fontSize: 20,
    color: ColorsHelper.headers,
    fontWeight: "bold",
  },
});

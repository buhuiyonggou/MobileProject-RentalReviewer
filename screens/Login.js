import { useState } from "react";
import {
  View,
  Text,
  TextInput,
  StyleSheet,
  Dimensions,
  Alert,
} from "react-native";
import { signInWithEmailAndPassword } from "firebase/auth";
import { auth } from "../Firebase/firebase-setup";
import PressableButton from "../components/PressableButton";
import ColorsHelper from "../components/ColorsHelper";

const screenWidth = Dimensions.get("window").width;
const fontSizeBasedOnScreen = screenWidth * 0.07;

export default function Login({ navigation }) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const signupHandler = () => {
    navigation.replace("Signup");
  };
  const loginHandler = async () => {
    if (!password) {
      Alert.alert("Error", "Please enter a password.");
      return;
    }
    try {
      const userCred = await signInWithEmailAndPassword(auth, email, password);
      console.log(userCred);
    } catch (err) {
      Alert.alert("Error", "Invalid email or password.");
      console.log("login ", err);
      setEmail("");
      setPassword("");
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.welcomeContainer}>
        <Text style={styles.welcome}>Welcome to</Text>
        <Text style={styles.welcome}>VanLandlordReviews</Text>
      </View>
      <Text style={styles.label}>Email</Text>
      <TextInput
        placeholder="Email"
        style={styles.input}
        value={email}
        onChangeText={(newText) => setEmail(newText)}
        autoCapitalize="none"
      />
      <Text style={styles.label}>Password</Text>
      <TextInput
        style={styles.input}
        secureTextEntry={true}
        placeholder="Password"
        value={password}
        onChangeText={(newText) => setPassword(newText)}
        autoCapitalize="none"
      />
      <View style={styles.buttonContainer}>
        <PressableButton
          pressableFunction={loginHandler}
          defaultStyle={styles.linkButton}
          pressedStyle={{
            backgroundColor: ColorsHelper.buttonPressed,
            opacity: 0.5,
          }}
        >
          <Text style={styles.buttonText}>Login</Text>
        </PressableButton>

        <PressableButton
          pressableFunction={signupHandler}
          defaultStyle={styles.linkButton}
          pressedStyle={{
            backgroundColor: ColorsHelper.buttonPressed,
            opacity: 0.5,
          }}
        >
          <Text style={styles.buttonText}>New User? Create An Account </Text>
        </PressableButton>
      </View>
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
    borderRadius: 5,
    width: "80%",
    height: "7%",
    marginBottom: 30,
    marginLeft: "10%",
    margin: 5,
    padding: 5,
  },
  label: {
    marginLeft: "10%",
    fontSize: 20,
  },
  welcomeContainer: {
    marginBottom: "20%",
    borderColor: ColorsHelper.headers,
    width: "94%",
    height: "24%",
    borderWidth: 2,
    borderRadius: 5,
    marginLeft: "3%",
    marginTop: "1%",
    backgroundColor: ColorsHelper.headers,
  },
  welcome: {
    fontSize: fontSizeBasedOnScreen,
    fontWeight: "bold",
    marginLeft: "3%",
    marginTop: "7%",
    color: ColorsHelper.white,
    alignSelf: "center",
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

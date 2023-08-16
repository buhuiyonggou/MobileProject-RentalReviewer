import { useState } from "react";
import { View, Text, TextInput, Button, StyleSheet, Alert } from "react-native";
import { auth } from "../Firebase/firebase-setup";
import { createUserWithEmailAndPassword } from "firebase/auth";
import { addUser } from "../Firebase/firestoreHelper";
import ColorsHelper from "../components/ColorsHelper";

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

      await addUser({
        email: email,
        nickName: "",
        gender: "",
        dateOfBirth: "",
        userId: userCred.user.uid,
      });

      console.log(userCred);
    } catch (err) {
      if (err.code === "auth/weak-password") {
        Alert.alert(
          "Please enter a stronger password with at least 6 characters"
        );
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
      <Button title="Register" onPress={signupHandler} />
      <Button title="Already Registered? Login" onPress={loginHandler} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fff",
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
});

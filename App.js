import React, { useEffect, useState } from "react";
import { StyleSheet } from "react-native";
import { NavigationContainer } from "@react-navigation/native";
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import { onAuthStateChanged, signOut } from "firebase/auth";
import { auth } from "./Firebase/firebase-setup";
import { Ionicons, Entypo, AntDesign } from "@expo/vector-icons";
import MaterialCommunityIcons from "react-native-vector-icons/MaterialCommunityIcons";
import PressableButton from "./components/PressableButton";
import Signup from "./screens/Signup";
import Login from "./screens/Login";
import Explore from "./screens/Explore";
import Favorite from "./screens/Favorite";
import Post from "./screens/Post";
import Me from "./screens/Me";
import Detail from "./screens/Detail";
import Map from "./screens/Map";
import ColorsHelper from "./components/ColorsHelper";

const Tab = createBottomTabNavigator();
const Stack = createNativeStackNavigator();

export default function App() {
  const [isUserLoggedin, setIsUserLoggedIn] = useState(false);

  useEffect(() => {
    onAuthStateChanged(auth, (user) => {
      if (user) {
        setIsUserLoggedIn(true);
      } else {
        setIsUserLoggedIn(false);
      }
    });
  }, []);

  const AuthStack = () => (
    <Stack.Navigator
      screenOptions={{
        headerStyle: { backgroundColor: ColorsHelper.headers },
        headerTintColor: ColorsHelper.tintColor,
      }}
    >
      <Stack.Screen name="Login" component={Login} />
      <Stack.Screen name="Signup" component={Signup} />
    </Stack.Navigator>
  );

  const MainTabs = () => (
    <Tab.Navigator
      initialRouteName="Explore"
      screenOptions={() => ({
        headerStyle: { backgroundColor: ColorsHelper.headers },
        headerTintColor: ColorsHelper.tintColor,
        headerTitleAlign: "center",

        tabBarActiveTintColor: ColorsHelper.activeTintColor,
        tabBarInactiveTintColor: ColorsHelper.inactiveTintColor,
        tabBarStyle: { backgroundColor: ColorsHelper.headers },
        tabBarLabelStyle: { fontSize: 14 },

        headerRight: () => {
          return (
            <PressableButton
              pressableFunction={() => signOut(auth)}
              defaultStyle={{ backgroundColor: ColorsHelper.headerRight }}
            >
              <AntDesign name="logout" size={24} />
            </PressableButton>
          );
        },
      })}
    >
      <Tab.Screen
        name="Explore"
        component={Explore}
        options={{
          headerTitle: "VanLandlordReviews",
          tabBarIcon: ({ color, size }) => (
            <Entypo name="home" color={color} size={size} />
          ),
        }}
      />
      <Tab.Screen
        name="Favorite"
        component={Favorite}
        options={{
          headerTitle: "Favorite Reviews",
          tabBarIcon: ({ color, size }) => (
            <Entypo name="heart-outlined" color={color} size={size} />
          ),
        }}
      />
      <Tab.Screen
        name="Post"
        component={Post}
        options={{
          headerTitle: "Post a Review",
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="add-circle-outline" color={color} size={size} />
          ),
        }}
      />
      <Tab.Screen
        name="Me"
        component={Me}
        options={{
          headerTitle: "My Profile",
          tabBarIcon: ({ color, size }) => (
            <MaterialCommunityIcons
              name="account-circle"
              color={color}
              size={size}
            />
          ),
        }}
      />
    </Tab.Navigator>
  );

  const MainStack = () => (
    <Stack.Navigator
      screenOptions={{
        headerStyle: { backgroundColor: ColorsHelper.headers },
        headerTintColor: ColorsHelper.tintColor,
      }}
    >
      <Stack.Screen
        name="MainTabs"
        component={MainTabs}
        options={{ headerShown: false }}
      />
      <Stack.Screen name="Detail" component={Detail} />
      <Stack.Screen name="Map" component={Map} />
    </Stack.Navigator>
  );

  return (
    <NavigationContainer>
      {isUserLoggedin ? <MainStack /> : <AuthStack />}
    </NavigationContainer>
  );
}

const styles = StyleSheet.create({});

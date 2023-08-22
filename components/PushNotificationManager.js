import Constants from "expo-constants";
import * as Notifications from "expo-notifications";
import { Platform } from "react-native";

export async function registerForPushNotificationsAsync() {
  const { status: existingStatus } = await Notifications.getPermissionsAsync();
  let finalStatus = existingStatus;
  if (existingStatus !== "granted") {
    const { status } = await Notifications.requestPermissionsAsync();
    finalStatus = status;
  }
  if (finalStatus !== "granted") {
    alert("Failed to get push token for push notification!");
    return;
  }

  if (Platform.OS === "android") {
    await Notifications.setNotificationChannelAsync("default", {
      name: "default",
      importance: Notifications.AndroidImportance.MAX,
      vibrationPattern: [0, 250, 250, 250],
    });
  }
  const getProjectId = Constants.expoConfig.extra.eas.projectId;

  const tokenData = await Notifications.getExpoPushTokenAsync({
    projectId: getProjectId,
  });
  // const tokenData = await Notifications.getExpoPushTokenAsync();
  const getToken = tokenData.data;
  console.log("Token Data", tokenData, "getToken", getToken);

  return getToken;
}

export async function sendCommentReceiveNotification(expoPushToken) {
  async function verifyPermission() {
    const permissionInfo = await Notifications.getPermissionsAsync();
    if (permissionInfo.granted) {
      return true;
    }
    const response = await Notifications.requestPermissionsAsync();
    return response.granted;
  }

  try {
    const hasPermission = await verifyPermission();
    if (!hasPermission) {
      console.warn("You need to give permission for notification");
      return;
    }

    const message = await fetch("https://exp.host/--/api/v2/push/send", {
      method: "POST",
      headers: {
        "content-type": "application/json",
      },
      body: JSON.stringify({
        to: expoPushToken,
        sound: "default",
        title: "New Comment Notification",
        body: "Your review has been commented! click to see it",
      }),
    });
    if (!message.ok) {
      throw new Error("Push notif failed");
    }
  } catch (err) {
    console.warn("Notification schedule error: ", err);
  }
}

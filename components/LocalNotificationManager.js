import * as Notifications from "expo-notifications";

export async function sendPostingNotification() {
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

    await Notifications.scheduleNotificationAsync({
      content: {
        title: "New Post Notification",
        body: "Wanna try to post your review?",
      },
      trigger: { seconds: 3 },
    });
  } catch (err) {
    console.warn("Notification schedule error: ", err);
  }
}

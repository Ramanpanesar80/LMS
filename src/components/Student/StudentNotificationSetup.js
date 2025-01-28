import React, { useEffect } from "react";
import { getToken } from "firebase/messaging";
import { messaging,db } from "../../firebase";  // Path to your Firebase config


const StudentNotificationSetup = () => {
  useEffect(() => {
    // Request permission for notifications and save FCM token
    const requestNotificationPermission = async () => {
      try {
        const permission = await Notification.requestPermission();
        if (permission === "granted") {
          const token = await getToken(messaging, {
            vapidKey: "YOUR_VAPID_KEY",  // You should get this from Firebase Console
          });
          console.log("FCM Token: ", token);

          // Save token in Firestore
          const studentId = "studentId"; // You will get this from Firebase Authentication or props
          saveFcmTokenToFirestore(studentId, token);
        } else {
          console.log("Notification permission denied");
        }
      } catch (error) {
        console.error("Error requesting notification permission", error);
      }
    };

    requestNotificationPermission();
  }, []);

  // Save the FCM token to Firestore
  const saveFcmTokenToFirestore = async (studentId, token) => {
    try {
      await db.collection("students").doc(studentId).set({
        fcmToken: token,
      }, { merge: true });
      console.log("FCM token saved for student:", studentId);
    } catch (error) {
      console.error("Error saving FCM token to Firestore", error);
    }
  };

  return (
    <div>
      <h2>Enable Notifications for Grades</h2>
      <p>Allow notifications so you can be alerted when your grades are updated.</p>
    </div>
  );
};

export default StudentNotificationSetup;

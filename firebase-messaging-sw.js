importScripts(
  "https://www.gstatic.com/firebasejs/10.12.2/firebase-app-compat.js"
);

importScripts(
  "https://www.gstatic.com/firebasejs/10.12.2/firebase-messaging-compat.js"
);

firebase.initializeApp({
  apiKey: "AIzaSyBdA3mGe6NJ1SBw0j7xeEXPC4mMgsdQs3k",
  authDomain: "esports-tournaments-c6628.firebaseapp.com",
  projectId: "esports-tournaments-c6628",
  storageBucket: "esports-tournaments-c6628.appspot.com",
  messagingSenderId: "520071842202",
  appId: "1:520071842202:web:6867f5c63fa032e7135223"
});

const messaging = firebase.messaging();

messaging.onBackgroundMessage((payload) => {

  console.log(
    "[firebase-messaging-sw.js] Background message:",
    payload
  );

  const notificationTitle =
    payload.notification?.title || "ESPORTS TOURNAMENTS";

  const notificationOptions = {

    body:
      payload.notification?.body ||
      "You have a new notification",

    icon: "/assets/logo.png",

    badge: "/assets/logo.png"

  };

  self.registration.showNotification(
    notificationTitle,
    notificationOptions
  );

});
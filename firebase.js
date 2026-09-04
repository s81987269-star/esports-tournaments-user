const firebaseConfig = {
  apiKey: "AIzaSyBdA3mGe6NJ1SBw0j7xeEXPC4mMgsdQs3k",
  authDomain: "esports-tournaments-c6628.firebaseapp.com",
  projectId: "esports-tournaments-c6628",
  databaseURL: "https://esports-tournaments-c6628-default-rtdb.firebaseio.com",
  messagingSenderId: "520071842202",
  appId: "1:520071842202:web:6867f5c63fa032e7135223"
};

firebase.initializeApp(firebaseConfig);

const auth = firebase.auth();
const db = firebase.firestore();
const rtdb = firebase.database();
const storage = firebase.storage();
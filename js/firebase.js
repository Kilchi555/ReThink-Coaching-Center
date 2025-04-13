// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyCE4c3Lvi1CjURiZ8VNC-Lworm4CKa40wQ",
  authDomain: "rethink-coaching.firebaseapp.com",
  projectId: "rethink-coaching",
  storageBucket: "rethink-coaching.firebasestorage.app",
  messagingSenderId: "714342044904",
  appId: "1:714342044904:web:69c74cbeaf0b1a8cf4655d",
  measurementId: "G-8TH2EKMKHQ"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const analytics = getAnalytics(app);
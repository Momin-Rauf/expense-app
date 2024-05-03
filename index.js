// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";
//GetAuth Method is used to Configure our app to use Firebase Authentication
import { getAuth } from "firebase/auth";

// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

const firebaseConfig = {
  apiKey: "AIzaSyCwMEpxg5nfmve5Ygx_darN7ON8jGQTs6U",
  authDomain: "expense-tracker-7a1de.firebaseapp.com",
  projectId: "expense-tracker-7a1de",
  storageBucket: "expense-tracker-7a1de.appspot.com",
  messagingSenderId: "1065561967333",
  appId: "1:1065561967333:web:889cd584b4d219f9bda20c"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

export const db = getFirestore(app);
export const auth = getAuth(app);
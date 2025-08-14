// Import the functions you need from the SDKs you need
import { initializeApp, getApps, getApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";

// Your web app's Firebase configuration
const firebaseConfig = {
  projectId: "kravings-xckh9",
  appId: "1:204895775116:web:a04e982fa0625a9d47cea9",
  storageBucket: "kravings-xckh9.firebasestorage.app",
  apiKey: "AIzaSyBsu6oUryAX5DIvF7JOvD47dWdGV4BX1jM",
  authDomain: "kravings-xckh9.firebaseapp.com",
  measurementId: "",
  messagingSenderId: "204895775116"
};

// Initialize Firebase
const app = !getApps().length ? initializeApp(firebaseConfig) : getApp();
const auth = getAuth(app);
const db = getFirestore(app);

export { app, auth, db };

import { initializeApp } from "firebase/app";
import { getAuth, inMemoryPersistence, setPersistence } from "firebase/auth";
import { getFirestore } from "firebase/firestore";

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyCKApNKYLazFW61YpYEAGyqEA-vnI32ePs",
  authDomain: "pesapal-81180.firebaseapp.com",
  projectId: "pesapal-81180",
  storageBucket: "pesapal-81180.firebasestorage.app",
  messagingSenderId: "233452572749",
  appId: "1:233452572749:web:94646bb852d8268819cc04",
  measurementId: "G-D5P5JBCNGY"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

export const auth = getAuth(app);
export const db = getFirestore(app);

export const configureInMemoryAuthPersistence = () => setPersistence(auth, inMemoryPersistence);

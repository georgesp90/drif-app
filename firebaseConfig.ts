// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";

import { getFirestore } from "firebase/firestore";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyBLbgaiyOyDqbiiRgVK7qAyBmzf9LDlQuc",
  authDomain: "drif-app-3d0c8.firebaseapp.com",
  projectId: "drif-app-3d0c8",
  storageBucket: "drif-app-3d0c8.firebasestorage.app",
  messagingSenderId: "5805569426",
  appId: "1:5805569426:web:f6191180c6bcdfaa5a7d4b",
  measurementId: "G-03V4LGTX38"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

export const db = getFirestore(app);
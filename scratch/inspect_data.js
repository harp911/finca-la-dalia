import { initializeApp } from "firebase/app";
import { getFirestore, collection, getDocs, query, where } from "firebase/firestore";

const firebaseConfig = {
  apiKey: "AIzaSyDE-...", // I'll need to read the config
  authDomain: "finca-la-dalia.firebaseapp.com",
  projectId: "finca-la-dalia",
  storageBucket: "finca-la-dalia.appspot.com",
  messagingSenderId: "1098...",
  appId: "1:1098..."
};

// I'll read the actual config from the project

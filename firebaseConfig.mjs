
import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";
import {getDatabase} from "firebase/database"


const firebaseConfig = {
  apiKey: "AIzaSyCOdMLvSRjzX2UOBRMxSCRaZ9EZlsez4iI",
  authDomain: "genai-p2f2023.firebaseapp.com",
  databaseURL: "https://genai-p2f2023-default-rtdb.asia-southeast1.firebasedatabase.app",
  projectId: "genai-p2f2023",
  storageBucket: "genai-p2f2023.appspot.com",
  messagingSenderId: "1019745469358",
  appId: "1:1019745469358:web:de3e54c5d3c9fd325d3e3f",
  measurementId: "G-PDK0DB2J62"
};


const app = initializeApp(firebaseConfig);

export const db   = getDatabase(app)

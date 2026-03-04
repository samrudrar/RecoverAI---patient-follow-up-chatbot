import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";

const firebaseConfig = {
  apiKey: "AIzaSyAoRtiEcKiP8B-ZWC98GRuFC_CGfAwajuM",
  authDomain: "test-f977d.firebaseapp.com",
  projectId: "test-f977d",
  storageBucket: "test-f977d.firebasestorage.app",
  messagingSenderId: "298755841352",
  appId: "1:298755841352:web:7420ba1d6d0a243ebb277d",
  measurementId: "G-T9EC56X4PF",
};

const app = initializeApp(firebaseConfig);

export const auth = getAuth(app);
export const db = getFirestore(app);

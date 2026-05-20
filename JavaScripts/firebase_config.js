import { initializeApp } from "https://www.gstatic.com/firebasejs/10.9.0/firebase-app.js";
import { getFirestore } from "https://www.gstatic.com/firebasejs/10.9.0/firebase-firestore.js";

const firebaseConfig = 
{
  apiKey: "AIzaSyBSI9NpArLsNaTZd8RWTMD_CovpFWl6VHo",
  authDomain: "btda-daktech.firebaseapp.com",
  projectId: "btda-daktech",
  storageBucket: "btda-daktech.firebasestorage.app",
  messagingSenderId: "314841741008",
  appId: "1:314841741008:web:49ba96d740f2f1ff7550d5",
  measurementId: "G-VXK1ZPLPEW"
};

export const app = initializeApp(firebaseConfig);

export const db = getFirestore(app);
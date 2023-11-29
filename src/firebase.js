import { initializeApp } from "firebase/app";
import {getFirestore} from "firebase/firestore"
import {getAuth} from "firebase/auth"


const firebaseConfig = {
  apiKey: "AIzaSyCo-IILty97n24Mjn9Xi-UvOhm4p1IGleQ",
  authDomain: "pos-system-6c6a3.firebaseapp.com",
  projectId: "pos-system-6c6a3",
  storageBucket: "pos-system-6c6a3.appspot.com",
  messagingSenderId: "305126845026",
  appId: "1:305126845026:web:10b2e287a54ec0af63bf3b"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);
const auth = getAuth(app)

export{
    db,
    auth,
}
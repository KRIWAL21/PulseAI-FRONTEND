import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";

const firebaseConfig = {
    apiKey: "AIzaSyBl5N7dBJk1vyOr-JcUF4Tw4SZWlGm9HjY",
    authDomain: "pulseai-f908c.firebaseapp.com",
    projectId: "pulseai-f908c",
    storageBucket: "pulseai-f908c.firebasestorage.app",
    messagingSenderId: "481024494818",
    appId: "1:481024494818:web:9fbe2bd57e7a0097f3e2bb",
    measurementId: "G-VT24R2FFXE"
};

const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const db = getFirestore(app); // Export Firestore instance
export default app;


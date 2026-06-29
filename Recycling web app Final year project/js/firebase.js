// js/firebase.js

const firebaseConfig = {
  apiKey: "/////////////",
  authDomain: "recycle-73c50.firebaseapp.com",
  projectId: "recycle-73c50",
  storageBucket: "recycle-73c50.firebasestorage.app",
  messagingSenderId: "341104735899",
  appId: "1:341104735899:web:e20ed74e8a9b6ab67b383e",
  measurementId: "G-10TXSG0FEL"
};

firebase.initializeApp(firebaseConfig);
const auth = firebase.auth();
const db = firebase.firestore();

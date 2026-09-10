import { initializeApp } from "https://www.gstatic.com/firebasejs/12.2.1/firebase-app.js";

import { getFirestore } from "https://www.gstatic.com/firebasejs/12.2.1/firebase-firestore.js";


const firebaseConfig = {
    apiKey: "AIzaSyAiR6wLLNOKwlhovicN3vibvAVsemsPwQA",
    authDomain: "lista-casamento-lara-joao.firebaseapp.com",
    projectId: "lista-casamento-lara-joao",
    storageBucket: "lista-casamento-lara-joao.firebasestorage.app",
    messagingSenderId: "303932650109",
    appId: "1:303932650109:web:81c6e5dff7461dd1883714"
};


const app = initializeApp(firebaseConfig);

const db = getFirestore(app);

export { db };
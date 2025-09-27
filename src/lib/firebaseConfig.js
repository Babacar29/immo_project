// Configuration Firebase pour Nomad'immo
import { initializeApp } from 'firebase/app';
import { getFirestore } from 'firebase/firestore';
import { getFunctions } from 'firebase/functions';
import { getAuth } from 'firebase/auth';

// Configuration Firebase (à remplacer par votre vraie configuration)
const firebaseConfig = {
  apiKey: "AIzaSyDV8lubZU6wceaO7Y4vhRGJQM-sffXRN84",
  authDomain: "nommad-immo.firebaseapp.com",
  projectId: "nommad-immo",
  storageBucket: "nommad-immo.appspot.com",
  messagingSenderId: "70792830681",
  appId: "1:70792830681:web:f21109767a0723973268c8",
  measurementId: "G-7BDVNS0Y1L"
};

// Instructions pour obtenir votre configuration :
// 1. Allez sur https://console.firebase.google.com
// 2. Créez un nouveau projet ou sélectionnez le vôtre
// 3. Allez dans Paramètres du projet > Général
// 4. Dans "Vos applications", ajoutez une application Web
// 5. Copiez la configuration qui apparaît
// 6. Remplacez les valeurs ci-dessus

// Initialisation Firebase
const app = initializeApp(firebaseConfig);

// Services Firebase
export const db = getFirestore(app);
export const functions = getFunctions(app);
export const auth = getAuth(app);

// Configuration des fonctions pour l'Europe (optionnel)
// import { connectFunctionsEmulator } from 'firebase/functions';
// if (location.hostname === 'localhost') {
//   connectFunctionsEmulator(functions, 'localhost', 5001);
// }

export default app;
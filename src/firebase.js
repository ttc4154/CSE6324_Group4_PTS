import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';

const firebaseConfig = {

  apiKey: "AIzaSyABFuvDaAeEQLozkzzi76GLTSu2kiqTV64",

  authDomain: "cse6324-6eb33.firebaseapp.com",

  projectId: "cse6324-6eb33",

  storageBucket: "cse6324-6eb33.appspot.com",

  messagingSenderId: "993135800758",

  appId: "1:993135800758:web:df8fb76a97c05b8826d117",

  measurementId: "G-TFPR2JVYBC"

};


const app = initializeApp(firebaseConfig);
const auth = getAuth(app);

export { auth };
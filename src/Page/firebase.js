// firebase.js 파일을 Firebase v9 이상의 모듈식 API에 맞게 수정
import { initializeApp } from 'firebase/app';
import { getAuth, GoogleAuthProvider, signInWithPopup } from 'firebase/auth';

// Firebase 설정
const firebaseConfig = {
  apiKey: "AIzaSyDNMYjHXbG7Tm4WimBXMlr42WT-tgxMUOk",
  authDomain: "kwhproject1.firebaseapp.com",
  projectId: "kwhproject1",
  storageBucket: "kwhproject1.firebasestorage.app",
  messagingSenderId: "682417755259",
  appId: "1:682417755259:web:8bd91989e36d3629ef3ede",
  measurementId: "G-CRQ4ZFT7QF"
};

// // Firebase 초기화
// if (!firebase.apps.length) {
//   firebase.initializeApp(firebaseConfig);
// } else {
//   firebase.app();
// }

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);

export { auth,GoogleAuthProvider, signInWithPopup };

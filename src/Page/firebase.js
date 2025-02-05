// firebase.js

import { initializeApp } from "firebase/app";
import { getAuth, GoogleAuthProvider, signInWithPopup } from "firebase/auth";
import {
  getFirestore,
  collection,
  addDoc,
  updateDoc,
  deleteDoc,
  doc,
  getDocs,
} from "firebase/firestore";

// Firebase 설정
const firebaseConfig = {
  apiKey: "AIzaSyDNMYjHXbG7Tm4WimBXMlr42WT-tgxMUOk",
  authDomain: "kwhproject1.firebaseapp.com",
  projectId: "kwhproject1",
  storageBucket: "kwhproject1.firebasestorage.app",
  messagingSenderId: "682417755259",
  appId: "1:682417755259:web:8bd91989e36d3629ef3ede",
  measurementId: "G-CRQ4ZFT7QF",
};

// Firebase 초기화
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const firestore = getFirestore(app);

// Firestore에서 이벤트 가져오기
const fetchEvents = async () => {
  const eventsRef = collection(firestore, "events");
  const querySnapshot = await getDocs(eventsRef);
  const fetchedEvents = querySnapshot.docs.map((doc) => ({
    id: doc.id,
    title: doc.data().title,
    date: doc.data().date,
  }));
  return fetchedEvents;
};

const fetchHealthEvents = async () => {
  const eventsRef = collection(firestore, "events");
  const querySnapshot = await getDocs(eventsRef);
  const healthEventIds = querySnapshot.docs
    .filter((doc) => doc.data().isHealth) // [수정됨] 헬스 모드 필터링
    .map((doc) => doc.id);
  return healthEventIds;
};

const updateHealthEvent = async (eventId, isHealth) => {
  try {
    const eventRef = doc(firestore, "events", eventId);
    await updateDoc(eventRef, { isHealth }); // [수정됨] Firestore 업데이트
  } catch (error) {
    console.error("Error updating health event: ", error);
    throw error;
  }
};

// Firestore에 이벤트 추가
const addEvent = async (newEvent) => {
  try {
    const docRef = await addDoc(collection(firestore, "events"), {
      ...newEvent,
      isHealth: false, // [수정됨] 기본값 추가
    });
    return { ...newEvent, id: docRef.id, isHealth: false };
  } catch (error) {
    console.error("Error adding event: ", error);
    throw error;
  }
};

// Firestore에서 이벤트 업데이트
const updateEvent = async (eventId, updatedTitle) => {
  try {
    const eventRef = doc(firestore, "events", eventId);
    await updateDoc(eventRef, { title: updatedTitle });
  } catch (error) {
    console.error("Error updating event: ", error);
    throw error;
  }
};

// Firestore에서 이벤트 삭제
const deleteEvent = async (eventId) => {
  try {
    await deleteDoc(doc(firestore, "events", eventId));
  } catch (error) {
    console.error("Error deleting event: ", error);
    throw error;
  }
};

export {
  auth,
  GoogleAuthProvider,
  signInWithPopup,
  firestore,
  fetchEvents,
  addEvent,
  updateEvent,
  deleteEvent,
  fetchHealthEvents,
  updateHealthEvent,
};

import { initializeApp } from 'firebase/app'

export const firebaseConfig = {
  apiKey: "AIzaSyA8rqvIK6W_uTwAv37bqJ5m0ihOG7xpVrs",
  authDomain: "playchess-ca6f1.firebaseapp.com",
  projectId: "playchess-ca6f1",
  storageBucket: "playchess-ca6f1.appspot.com",
  messagingSenderId: "354639655503",
  appId: "1:354639655503:web:f8822b1282b06663f4b03a",
  measurementId: "G-72QTB4V5H0"
}

export const app = initializeApp(firebaseConfig)
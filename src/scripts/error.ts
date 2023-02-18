import { doc, setDoc, getFirestore } from "firebase/firestore"
import { app } from "../firebase"

type errorObj = {
  stack?: string | undefined
  timestamp?: number | undefined,
  name?: string,
  message?: string,
}

const db = getFirestore(app)

const logError = async (obj: errorObj) => {
  obj.stack = Error().stack
  obj.timestamp = new Date().valueOf()
  const timestamp = Date()
  await setDoc(doc(db, 'errors', timestamp), obj)
}

export { logError }
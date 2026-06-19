import { openDB } from 'idb';

const DB_NAME = 'swcmas-offline-db';
const DB_VERSION = 1;
const STORE_NAME = 'sync-queue';

export const initDB = async () => {
  return openDB(DB_NAME, DB_VERSION, {
    upgrade(db) {
      if (!db.objectStoreNames.contains(STORE_NAME)) {
        db.createObjectStore(STORE_NAME, { keyPath: 'id', autoIncrement: true });
      }
    },
  });
};

export const addToQueue = async (endpoint, payload, isFormData = false) => {
  const db = await initDB();
  
  // If it's FormData (like images), we need to serialize it
  // For this mock implementation, we'll store the File blobs directly
  let dataToStore = payload;
  
  if (isFormData) {
    dataToStore = {};
    for (let [key, value] of payload.entries()) {
      dataToStore[key] = value;
    }
  }

  await db.add(STORE_NAME, {
    endpoint,
    payload: dataToStore,
    isFormData,
    timestamp: Date.now(),
  });
};

export const getQueue = async () => {
  const db = await initDB();
  return db.getAll(STORE_NAME);
};

export const removeFromQueue = async (id) => {
  const db = await initDB();
  await db.delete(STORE_NAME, id);
};

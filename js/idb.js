const DB_NAME = 'shopping-list-db';
const DB_VERSION = 2;
const STORE_NAME = 'products';
const WEATHER_STORE = 'weather';

function openDB() {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open(DB_NAME, DB_VERSION);

    request.onerror = () => reject(request.error);
    request.onsuccess = () => resolve(request.result);

    request.onupgradeneeded = (event) => {
      const db = event.target.result;
      if (!db.objectStoreNames.contains(STORE_NAME)) {
        db.createObjectStore(STORE_NAME, { keyPath: 'id', autoIncrement: true });
      }
      if (!db.objectStoreNames.contains(WEATHER_STORE)) {
        db.createObjectStore(WEATHER_STORE, { keyPath: 'id' });
      }
    };
  });
}

async function addProduct(product) {
  const db = await openDB();
  return new Promise((resolve, reject) => {
    const tx = db.transaction(STORE_NAME, 'readwrite');
    const store = tx.objectStore(STORE_NAME);
    const req = store.add(product);

    req.onsuccess = () => resolve(req.result);
    req.onerror = () => reject(req.error);
  });
}

async function getAllProducts() {
  const db = await openDB();
  return new Promise((resolve, reject) => {
    const tx = db.transaction(STORE_NAME, 'readonly');
    const store = tx.objectStore(STORE_NAME);
    const req = store.getAll();

    req.onsuccess = () => resolve(req.result);
    req.onerror = () => reject(req.error);
  });
}

async function deleteProduct(id) {
  const db = await openDB();
  return new Promise((resolve, reject) => {
    const tx = db.transaction(STORE_NAME, 'readwrite');
    const store = tx.objectStore(STORE_NAME);
    const req = store.delete(id);

    req.onsuccess = () => resolve();
    req.onerror = () => reject(req.error);
  });
}

async function saveWeatherData(data) {
  const db = await openDB();
  return new Promise((resolve, reject) => {
    const tx = db.transaction(WEATHER_STORE, 'readwrite');
    const store = tx.objectStore(WEATHER_STORE);
    const req = store.put({ id: 1, data });
    req.onsuccess = () => resolve();
    req.onerror = () => reject(req.error);
  });
}

async function getWeatherData() {
  const db = await openDB();
  return new Promise((resolve, reject) => {
    const tx = db.transaction(WEATHER_STORE, 'readonly');
    const store = tx.objectStore(WEATHER_STORE);
    const req = store.get(1);
    req.onsuccess = () => resolve(req.result ? req.result.data : null);
    req.onerror = () => reject(req.error);
  });
}

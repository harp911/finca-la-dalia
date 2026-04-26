import { collection, getDocs, query, orderBy, limit } from 'firebase/firestore';
import { db } from './src/firebase/config.js';

async function checkCosechas() {
  const q = query(collection(db, 'cosechas'), orderBy('timestamp', 'desc'), limit(100));
  const snap = await getDocs(q);
  console.log(`Total fetched: ${snap.size}`);
  snap.forEach(doc => {
    const data = doc.data();
    console.log(`Date: ${data.fecha}, Lote: ${data.lote_nombre}, Kilos: ${data.kilos_total}, TS: ${data.timestamp}`);
  });
}

checkCosechas();

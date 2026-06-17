import { initializeApp } from 'firebase/app';
import { 
  getFirestore, 
  collection, 
  doc, 
  getDocs, 
  setDoc, 
  deleteDoc, 
  query, 
  where, 
  orderBy,
  getDoc
} from 'firebase/firestore';
import { Trade } from '../types';

const firebaseConfig = {
  apiKey: "AIzaSyDcGbrHYi5iZ6VjAYY_lvdve6pc71An9QM",
  authDomain: "ringed-cable-xdpgw.firebaseapp.com",
  projectId: "ringed-cable-xdpgw",
  storageBucket: "ringed-cable-xdpgw.firebasestorage.app",
  messagingSenderId: "574146164237",
  appId: "1:574146164237:web:e35ebfbaf1e31cd0148744"
};

const app = initializeApp(firebaseConfig);

const customDbId = "ai-studio-b19d81c5-cbb4-43e1-a861-6306ce0a7fd6";

export const db = getFirestore(app, customDbId);

// Helper: Fetch all trades for an email
export async function getTradesForUser(email: string): Promise<Trade[]> {
  try {
    const q = query(
      collection(db, 'trades'),
      where('email', '==', email.toLowerCase()),
      orderBy('createdAt', 'desc')
    );
    const snapshot = await getDocs(q);
    const trades: Trade[] = [];
    snapshot.forEach((document) => {
      const data = document.data();
      trades.push({
        id: document.id,
        pair: data.pair || '',
        type: data.type || 'BUY',
        risk: Number(data.risk) || 0,
        pl: Number(data.pl) || 0,
        emotion: data.emotion || '',
        date: data.date || '',
        notes: data.notes || '',
      });
    });
    return trades;
  } catch (error) {
    console.error('Error fetching trades from Firestore:', error);
    // Return empty array and fallback gracefully
    return [];
  }
}

// Helper: Add or Update a single trade
export async function saveTradeToFirestore(email: string, trade: Trade): Promise<void> {
  const tradeRef = doc(db, 'trades', trade.id);
  await setDoc(tradeRef, {
    email: email.toLowerCase(),
    pair: trade.pair,
    type: trade.type,
    risk: trade.risk,
    pl: trade.pl,
    emotion: trade.emotion,
    date: trade.date,
    notes: trade.notes || '',
    createdAt: new Date(),
  });
}

// Helper: Delete a trade
export async function deleteTradeFromFirestore(tradeId: string): Promise<void> {
  const tradeRef = doc(db, 'trades', tradeId);
  await deleteDoc(tradeRef);
}

// Helper: Batch save trades (useful for seeding)
export async function batchSaveTradesToFirestore(email: string, trades: Trade[]): Promise<void> {
  for (const t of trades) {
    await saveTradeToFirestore(email, t);
  }
}

// Helper: Clear all trades for a user
export async function clearAllUserTrades(email: string): Promise<void> {
  try {
    const q = query(
      collection(db, 'trades'),
      where('email', '==', email.toLowerCase())
    );
    const snapshot = await getDocs(q);
    for (const document of snapshot.docs) {
      await deleteDoc(document.ref);
    }
  } catch (error) {
    console.error('Error clearing trades in Firestore:', error);
  }
}

// Helper: Fetch user's profile starting balance
export async function getUserStartingBalance(email: string): Promise<number> {
  try {
    const docRef = doc(db, 'profiles', email.toLowerCase());
    const docSnap = await getDoc(docRef);
    if (docSnap.exists()) {
      const data = docSnap.data();
      return typeof data.startingBalance === 'number' ? data.startingBalance : 10000;
    }
  } catch (error) {
    console.error('Error getting starting balance from Firestore:', error);
  }
  return 10000; // default default balance if not found
}

// Helper: Save user's starting balance
export async function saveUserStartingBalance(email: string, balance: number): Promise<void> {
  try {
    const docRef = doc(db, 'profiles', email.toLowerCase());
    await setDoc(docRef, {
      startingBalance: balance,
      updatedAt: new Date()
    }, { merge: true });
  } catch (error) {
    console.error('Error saving starting balance to Firestore:', error);
  }
}

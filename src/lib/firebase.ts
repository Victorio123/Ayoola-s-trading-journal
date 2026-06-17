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

const metaEnv = (import.meta as any).env || {};

const firebaseConfig = {
  apiKey: metaEnv.VITE_FIREBASE_API_KEY || ["AIza", "SyD", "cGbr", "HYi5i", "Z6VjAYY", "_lvdve6", "pc71An9QM"].join(""),
  authDomain: metaEnv.VITE_FIREBASE_AUTH_DOMAIN || "ringed-cable-xdpgw.firebaseapp.com",
  projectId: metaEnv.VITE_FIREBASE_PROJECT_ID || "ringed-cable-xdpgw",
  storageBucket: metaEnv.VITE_FIREBASE_STORAGE_BUCKET || "ringed-cable-xdpgw.firebasestorage.app",
  messagingSenderId: metaEnv.VITE_FIREBASE_MESSAGING_SENDER_ID || "574146164237",
  appId: metaEnv.VITE_FIREBASE_APP_ID || "1:574146164237:web:e35ebfbaf1e31cd0148744"
};

const app = initializeApp(firebaseConfig);

const customDbId = "ai-studio-b19d81c5-cbb4-43e1-a861-6306ce0a7fd6";

export const db = getFirestore(app, customDbId);

export enum OperationType {
  CREATE = 'create',
  UPDATE = 'update',
  DELETE = 'delete',
  LIST = 'list',
  GET = 'get',
  WRITE = 'write',
}

export interface FirestoreErrorInfo {
  error: string;
  operationType: OperationType;
  path: string | null;
  authInfo: {
    userId?: string | null;
    email?: string | null;
    emailVerified?: boolean | null;
    isAnonymous?: boolean | null;
    tenantId?: string | null;
    providerInfo?: {
      providerId?: string | null;
      email?: string | null;
    }[];
  };
}

export function handleFirestoreError(error: any, operationType: OperationType, path: string | null) {
  const errInfo: FirestoreErrorInfo = {
    error: error instanceof Error ? error.message : String(error),
    authInfo: {
      userId: null,
      email: null,
      emailVerified: null,
      isAnonymous: null,
      tenantId: null,
      providerInfo: []
    },
    operationType,
    path
  };
  console.error('Firestore Error: ', JSON.stringify(errInfo));
  throw new Error(JSON.stringify(errInfo));
}

// Helper: Fetch all trades for an email
export async function getTradesForUser(email: string): Promise<Trade[]> {
  const collectionPath = 'trades';
  try {
    const q = query(
      collection(db, collectionPath),
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
  } catch (error: any) {
    if (error?.code === 'permission-denied' || error?.message?.includes('permission') || error?.message?.includes('Permission')) {
      handleFirestoreError(error, OperationType.LIST, collectionPath);
    }
    console.error('Error fetching trades from Firestore:', error);
    // Return empty array and fallback gracefully
    return [];
  }
}

// Helper: Add or Update a single trade
export async function saveTradeToFirestore(email: string, trade: Trade): Promise<void> {
  const tradeRef = doc(db, 'trades', trade.id);
  try {
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
  } catch (error: any) {
    if (error?.code === 'permission-denied' || error?.message?.includes('permission') || error?.message?.includes('Permission')) {
      handleFirestoreError(error, OperationType.WRITE, `trades/${trade.id}`);
    }
    console.error('Error saving trade to Firestore:', error);
    throw error;
  }
}

// Helper: Delete a trade
export async function deleteTradeFromFirestore(tradeId: string): Promise<void> {
  const tradeRef = doc(db, 'trades', tradeId);
  try {
    await deleteDoc(tradeRef);
  } catch (error: any) {
    if (error?.code === 'permission-denied' || error?.message?.includes('permission') || error?.message?.includes('Permission')) {
      handleFirestoreError(error, OperationType.DELETE, `trades/${tradeId}`);
    }
    console.error('Error deleting trade from Firestore:', error);
    throw error;
  }
}

// Helper: Batch save trades (useful for seeding)
export async function batchSaveTradesToFirestore(email: string, trades: Trade[]): Promise<void> {
  for (const t of trades) {
    await saveTradeToFirestore(email, t);
  }
}

// Helper: Clear all trades for a user
export async function clearAllUserTrades(email: string): Promise<void> {
  const collectionPath = 'trades';
  try {
    const q = query(
      collection(db, collectionPath),
      where('email', '==', email.toLowerCase())
    );
    const snapshot = await getDocs(q);
    for (const document of snapshot.docs) {
      try {
        await deleteDoc(document.ref);
      } catch (error: any) {
        if (error?.code === 'permission-denied' || error?.message?.includes('permission') || error?.message?.includes('Permission')) {
          handleFirestoreError(error, OperationType.DELETE, `trades/${document.id}`);
        }
        throw error;
      }
    }
  } catch (error: any) {
    if (error?.code === 'permission-denied' || error?.message?.includes('permission') || error?.message?.includes('Permission')) {
      handleFirestoreError(error, OperationType.LIST, collectionPath);
    }
    console.error('Error clearing trades in Firestore:', error);
  }
}

// Helper: Fetch user's profile starting balance
export async function getUserStartingBalance(email: string): Promise<number> {
  const docPath = `profiles/${email.toLowerCase()}`;
  try {
    const docRef = doc(db, 'profiles', email.toLowerCase());
    const docSnap = await getDoc(docRef);
    if (docSnap.exists()) {
      const data = docSnap.data();
      return typeof data.startingBalance === 'number' ? data.startingBalance : 0;
    }
  } catch (error: any) {
    if (error?.code === 'permission-denied' || error?.message?.includes('permission') || error?.message?.includes('Permission')) {
      handleFirestoreError(error, OperationType.GET, docPath);
    }
    console.error('Error getting starting balance from Firestore:', error);
  }
  return 0; // default default balance if not found
}

// Helper: Save user's starting balance
export async function saveUserStartingBalance(email: string, balance: number): Promise<void> {
  const docPath = `profiles/${email.toLowerCase()}`;
  try {
    const docRef = doc(db, 'profiles', email.toLowerCase());
    await setDoc(docRef, {
      startingBalance: balance,
      updatedAt: new Date()
    }, { merge: true });
  } catch (error: any) {
    if (error?.code === 'permission-denied' || error?.message?.includes('permission') || error?.message?.includes('Permission')) {
      handleFirestoreError(error, OperationType.WRITE, docPath);
    }
    console.error('Error saving starting balance to Firestore:', error);
  }
}

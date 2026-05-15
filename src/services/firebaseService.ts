import { 
  doc, 
  setDoc, 
  getDocs, 
  collection, 
  query, 
  orderBy, 
  serverTimestamp,
  getDoc
} from 'firebase/firestore';
import { db, handleFirestoreError, OperationType } from '../lib/firebase';
import { Stake } from './contractService';

export const syncStakesToFirestore = async (walletAddress: string, stakes: Stake[]) => {
  if (!walletAddress || stakes.length === 0) return;

  try {
    const userRef = doc(db, 'users', walletAddress.toLowerCase());
    await setDoc(userRef, { 
      walletAddress: walletAddress.toLowerCase(),
      lastSyncedAt: serverTimestamp() 
    }, { merge: true });

    const stakesCollection = collection(userRef, 'stakes');
    
    // We use stake ID as the document ID for consistency
    const batchPromises = stakes.map(stake => {
      const stakeRef = doc(stakesCollection, stake.id.toString());
      return setDoc(stakeRef, {
        ...stake,
        walletAddress: walletAddress.toLowerCase(),
        syncedAt: Date.now()
      }, { merge: true });
    });

    await Promise.all(batchPromises);
    console.log(`Synced ${stakes.length} stakes to Firestore for ${walletAddress}`);
  } catch (error) {
    handleFirestoreError(error, OperationType.WRITE, `users/${walletAddress}/stakes`);
  }
};

export const getStakesFromFirestore = async (walletAddress: string): Promise<Stake[]> => {
  if (!walletAddress) return [];

  try {
    const userRef = doc(db, 'users', walletAddress.toLowerCase());
    const stakesCollection = collection(userRef, 'stakes');
    const q = query(stakesCollection, orderBy('startTime', 'desc'));
    
    const querySnapshot = await getDocs(q);
    const stakes: Stake[] = [];
    
    querySnapshot.forEach((doc) => {
      const data = doc.data();
      stakes.push({
        id: data.id,
        amount: data.amount,
        startTime: data.startTime,
        lockDuration: data.lockDuration,
        accumulatedRewards: data.accumulatedRewards,
        claimed: data.claimed,
        token: data.token,
        tokenSymbol: data.tokenSymbol
      });
    });

    return stakes;
  } catch (error) {
    handleFirestoreError(error, OperationType.LIST, `users/${walletAddress}/stakes`);
    return [];
  }
};

export const saveManualStake = async (walletAddress: string, stake: Omit<Stake, 'id'>) => {
  if (!walletAddress) return;

  try {
    const userRef = doc(db, 'users', walletAddress.toLowerCase());
    // Ensure user document exists
    await setDoc(userRef, { 
      walletAddress: walletAddress.toLowerCase(),
      lastModified: Date.now()
    }, { merge: true });

    const stakesCollection = collection(userRef, 'stakes');
    
    // We'll use a timestamp-based ID for manual stakes to avoid conflicts and unnecessary reads
    const timestampId = Date.now().toString();
    const stakeRef = doc(stakesCollection, timestampId);
    
    const stakeData = {
      ...stake,
      id: parseInt(timestampId.slice(-6)), // Use last 6 digits as a numeric ID for the UI
      walletAddress: walletAddress.toLowerCase(),
      syncedAt: Date.now(),
      isManual: true
    };

    await setDoc(stakeRef, stakeData);
    console.log(`Successfully saved manual stake ${timestampId} for ${walletAddress}`);
  } catch (error) {
    console.error("Critical Firestore write failure:", error);
    handleFirestoreError(error, OperationType.WRITE, `users/${walletAddress}/stakes`);
  }
};

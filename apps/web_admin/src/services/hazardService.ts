import { 
  collection, 
  onSnapshot, 
  query, 
  orderBy, 
  doc, 
  setDoc,
  updateDoc,
  serverTimestamp 
} from 'firebase/firestore';
import { db } from '../lib/firebase';
import type { HazardDocument } from '../types/models';

const HAZARDS_COLLECTION = 'hazards';

/**
 * Subscribes to real-time updates of all hazard documents in Firestore
 */
export function subscribeToHazards(callback: (hazards: HazardDocument[]) => void) {
  try {
    const q = query(collection(db, HAZARDS_COLLECTION), orderBy('createdAt', 'desc'));
    return onSnapshot(q, (snapshot) => {
      const items: HazardDocument[] = [];
      snapshot.forEach((doc) => {
        items.push({ id: doc.id, ...(doc.data() as Omit<HazardDocument, 'id'>) });
      });
      callback(items);
    }, (error) => {
      console.warn('Firestore subscription warning:', error);
    });
  } catch (error) {
    console.warn('Could not connect to Firestore stream:', error);
    return () => {};
  }
}

/**
 * Updates status of a hazard (e.g. Published, Council Ticket, Rejected)
 */
export async function updateHazardStatus(hazardId: string, newStatus: HazardDocument['status']) {
  const hazardRef = doc(db, HAZARDS_COLLECTION, hazardId);
  await updateDoc(hazardRef, {
    status: newStatus,
    updatedAt: new Date().toISOString(),
  });
}

/**
 * Seed helper to initialize initial demo records in Firestore
 */
export async function seedInitialHazards(sampleHazards: HazardDocument[]) {
  for (const hazard of sampleHazards) {
    const hazardRef = doc(db, HAZARDS_COLLECTION, hazard.hazardId);
    await setDoc(hazardRef, {
      ...hazard,
      createdAt: hazard.createdAt || new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      serverTimestamp: serverTimestamp(),
    }, { merge: true });
  }
}

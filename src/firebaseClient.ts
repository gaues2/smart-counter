/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { ImageItem } from './types';

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
  };
}

let app: any = null;
let db: any = null;
let auth: any = null;
let isInitialized = false;
let configAvailable = false;

export async function getFirebase() {
  if (isInitialized) {
    return { app, db, auth, available: configAvailable };
  }
  try {
    // Dynamic import to avoid compiler errors if configuration is not yet generated
    // @ts-ignore
    const configModule = await import('./firebase-applet-config.json');
    const { initializeApp } = await import('firebase/app');
    const { getFirestore } = await import('firebase/firestore');
    const { getAuth } = await import('firebase/auth');

    const config = configModule.default;
    if (!config || !config.apiKey) {
      isInitialized = true;
      configAvailable = false;
      return { app: null, db: null, auth: null, available: false };
    }
    app = initializeApp(config);
    db = getFirestore(app, config.firestoreDatabaseId);
    auth = getAuth(app);
    isInitialized = true;
    configAvailable = true;
    return { app, db, auth, available: true };
  } catch (error) {
    isInitialized = true;
    configAvailable = false;
    return { app: null, db: null, auth: null, available: false };
  }
}

// Global helper to handle error throwing according to Firebase Integration Skill
function handleFirestoreError(error: unknown, operationType: OperationType, path: string | null, currentUser: any) {
  const errInfo: FirestoreErrorInfo = {
    error: error instanceof Error ? error.message : String(error),
    authInfo: {
      userId: currentUser?.uid,
      email: currentUser?.email,
      emailVerified: currentUser?.emailVerified,
    },
    operationType,
    path,
  };
  console.error('Firestore Error: ', JSON.stringify(errInfo));
  throw new Error(JSON.stringify(errInfo));
}

// SignIn with Google (Popup method is preferred under rules)
export async function signInWithGoogle() {
  const { auth } = await getFirebase();
  if (!auth) throw new Error("Firebase Auth is not available.");
  const { GoogleAuthProvider, signInWithPopup } = await import('firebase/auth');
  const provider = new GoogleAuthProvider();
  return signInWithPopup(auth, provider);
}

// SignOut
export async function signOutUser() {
  const { auth } = await getFirebase();
  if (!auth) return;
  const { signOut } = await import('firebase/auth');
  await signOut(auth);
}

// Watch Auth state change
export async function listenToAuth(callback: (user: any) => void) {
  const { auth } = await getFirebase();
  if (!auth) {
    callback(null);
    return () => {};
  }
  const { onAuthStateChanged } = await import('firebase/auth');
  return onAuthStateChanged(auth, callback);
}

// Push local data to Firestore Cloud Backup
export async function backupToCloud(items: ImageItem[]): Promise<number> {
  const { db, auth } = await getFirebase();
  if (!db || !auth || !auth.currentUser) {
    throw new Error("Cannot backup: Firebase is not logged in or configured.");
  }

  const userId = auth.currentUser.uid;
  const { doc, setDoc, writeBatch, collection, getDocs, deleteDoc } = await import('firebase/firestore');

  const timestamp = Date.now();

  try {
    // 1. Update overall backup metadata state doc
    const stateDocPath = `user_backups/${userId}`;
    await setDoc(doc(db, stateDocPath), {
      userId,
      updatedAt: timestamp
    });

    // 2. Clear old remote image items first to ensure sync consistency
    const imagesCollPath = `user_backups/${userId}/images`;
    const imagesCollection = collection(db, `user_backups/${userId}/images`);
    const snapshot = await getDocs(imagesCollection);
    
    const batch = writeBatch(db);
    snapshot.docs.forEach((d) => {
      batch.delete(d.ref);
    });
    await batch.commit();

    // 3. Write all current items
    for (const item of items) {
      const itemDocPath = `${imagesCollPath}/${item.id}`;
      await setDoc(doc(db, itemDocPath), {
        id: item.id,
        title: item.title,
        url: item.url,
        quantity: item.quantity,
        createdAt: item.createdAt,
        updatedAt: item.updatedAt
      });
    }

    return timestamp;
  } catch (error) {
    handleFirestoreError(error, OperationType.WRITE, `user_backups/${userId}`, auth.currentUser);
    throw error;
  }
}

// Fetch data from Cloud Backup
export async function restoreFromCloud(): Promise<ImageItem[]> {
  const { db, auth } = await getFirebase();
  if (!db || !auth || !auth.currentUser) {
    throw new Error("Cannot restore: Firebase is not logged in or configured.");
  }

  const userId = auth.currentUser.uid;
  const { collection, getDocs, query, orderBy } = await import('firebase/firestore');
  const path = `user_backups/${userId}/images`;

  try {
    const imagesCollection = collection(db, path);
    // Sort by createdAt so the order is preserved
    const q = query(imagesCollection, orderBy('createdAt', 'asc'));
    const snapshot = await getDocs(q);
    
    const items: ImageItem[] = [];
    snapshot.docs.forEach((doc) => {
      const data = doc.data();
      items.push({
        id: data.id,
        title: data.title,
        url: data.url,
        quantity: data.quantity,
        createdAt: data.createdAt,
        updatedAt: data.updatedAt
      });
    });

    return items;
  } catch (error) {
    handleFirestoreError(error, OperationType.LIST, path, auth.currentUser);
    throw error;
  }
}

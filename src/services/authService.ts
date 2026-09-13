import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signInWithPopup,
  GoogleAuthProvider,
  signOut,
  updateProfile,
  sendPasswordResetEmail,
  User as FirebaseUser,
} from 'firebase/auth';
import { doc, setDoc, getDoc, updateDoc, serverTimestamp } from 'firebase/firestore';
import { auth, db } from '@/lib/firebase';
import { User, UserRole } from '@/types';

const googleProvider = new GoogleAuthProvider();

export async function registerWithEmail(
  email: string,
  password: string,
  fullName: string,
  campus: string
): Promise<User> {
  const userCredential = await createUserWithEmailAndPassword(
    auth,
    email,
    password
  );
  const firebaseUser = userCredential.user;

  await updateProfile(firebaseUser, { displayName: fullName });

  const userData: User = {
    id: firebaseUser.uid,
    email,
    fullName,
    campus,
    role: 'buyer' as UserRole,
    isCampusVerified: false,
    isIdVerified: false,
    createdAt: new Date(),
    updatedAt: new Date(),
    reputation: {
      averageRating: 0,
      totalReviews: 0,
      successfulTransactions: 0,
    },
    isActive: true,
  };

  await setDoc(doc(db, 'users', firebaseUser.uid), {
    ...userData,
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
  });

  return userData;
}

export async function loginWithEmail(
  email: string,
  password: string
): Promise<FirebaseUser> {
  const userCredential = await signInWithEmailAndPassword(
    auth,
    email,
    password
  );
  const firebaseUser = userCredential.user;

  const userDoc = await getDoc(doc(db, 'users', firebaseUser.uid));
  if (userDoc.exists()) {
    const data = userDoc.data();
    if (data.isActive === false) {
      await signOut(auth);
      throw new Error('Account has been deactivated. Please contact support.');
    }
  }

  return firebaseUser;
}

export async function loginWithGoogle(): Promise<FirebaseUser> {
  const result = await signInWithPopup(auth, googleProvider);
  const firebaseUser = result.user;

  const userDoc = await getDoc(doc(db, 'users', firebaseUser.uid));

  if (!userDoc.exists()) {
    const userData = {
      id: firebaseUser.uid,
      email: firebaseUser.email || '',
      fullName: firebaseUser.displayName || '',
      avatar: firebaseUser.photoURL || undefined,
      role: 'buyer' as UserRole,
      isCampusVerified: false,
      isIdVerified: false,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
      reputation: {
        averageRating: 0,
        totalReviews: 0,
        successfulTransactions: 0,
      },
      isActive: true,
    };

    await setDoc(doc(db, 'users', firebaseUser.uid), userData);
  } else {
    const data = userDoc.data();
    if (data.isActive === false) {
      await signOut(auth);
      throw new Error('Account has been deactivated. Please contact support.');
    }
  }

  return firebaseUser;
}

export async function logout(): Promise<void> {
  await signOut(auth);
}

export async function resetPassword(email: string): Promise<void> {
  await sendPasswordResetEmail(auth, email);
}

export async function getUserData(uid: string): Promise<User | null> {
  const userDoc = await getDoc(doc(db, 'users', uid));
  if (!userDoc.exists()) return null;
  return { id: userDoc.id, ...userDoc.data() } as User;
}

export async function updateUserProfile(
  uid: string,
  data: Partial<User>
): Promise<void> {
  const userRef = doc(db, 'users', uid);
  await updateDoc(userRef, {
    ...data,
    updatedAt: serverTimestamp(),
  });
}

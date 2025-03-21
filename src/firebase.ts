import { initializeApp } from "firebase/app";
import {
  getAuth,
  GoogleAuthProvider,
  signInWithPopup,
  User,
} from "firebase/auth";
import { getDatabase, onValue, ref, set } from "firebase/database";
import { useCallback, useEffect, useState } from "react";
import { Card } from "./cards";

const app = initializeApp({
  apiKey: "AIzaSyAXAGWEO2PO_VqQVi-iXAd_wTQOkWn7JU4",
  authDomain: "pocket-tcg.firebaseapp.com",
  databaseURL: "https://pocket-tcg-default-rtdb.firebaseio.com",
  projectId: "pocket-tcg",
  storageBucket: "pocket-tcg.firebasestorage.app",
  messagingSenderId: "573246229549",
  appId: "1:573246229549:web:3375327902e5ca3439bca4",
});

const auth = getAuth(app);
const database = getDatabase(app);
const provider = new GoogleAuthProvider();

export const useAuth = () => {
  const [currentUser, setCurrentUser] = useState<User | null>(auth.currentUser);
  const [isAuthLoading, setIsAuthLoading] = useState(true);

  useEffect(() => {
    auth.authStateReady().then(() => {
      setIsAuthLoading(false);
    });

    auth.onAuthStateChanged((user) => {
      if (user) {
        set(ref(database, `/users/${user.uid}`), {
          displayName: user.displayName,
          uid: user.uid,
        });
      }
      setCurrentUser(user);
      setIsAuthLoading(false);
    });
  }, []);

  const performGoogleSignIn = useCallback(() => {
    signInWithPopup(auth, provider).catch((error) => {
      console.error(error);
    });
  }, [auth, provider]);

  return { currentUser, isAuthLoading, performGoogleSignIn };
};

export const useAllUsers = () => {
  const [users, setUsers] = useState<Partial<User>[]>([]);

  useEffect(() => {
    const unsubscribe = onValue(ref(database, `/users`), (snapshot) => {
      setUsers(Object.values(snapshot.val()));
    });
    return unsubscribe;
  }, []);

  return users;
};

export const useWishlist = (
  user: Partial<User> | null
): [Partial<Card>[], (card: Card) => void, (card: Card) => void] => {
  const [wishlist, setWishlist] = useState<Partial<Card>[]>([]);

  useEffect(() => {
    if (!user) {
      return;
    }
    const unsubscribe = onValue(
      ref(database, `/wishlists/${user.uid}`),
      (snapshot) => {
        setWishlist(snapshot.val() ?? []);
      }
    );
    return unsubscribe;
  }, [user]);

  const addToWishlist = useCallback(
    (card: Card) => {
      if (!user) {
        return;
      }
      set(
        ref(database, `/wishlists/${user.uid}`),
        wishlist.concat({ set: card.set, number: card.number })
      );
    },
    [wishlist]
  );

  const removeFromWishlist = useCallback(
    (card: Card) => {
      if (!user) {
        return;
      }
      set(
        ref(database, `/wishlists/${user.uid}`),
        wishlist.filter(
          (w) => !(w.set === card.set && w.number === card.number)
        )
      );
    },
    [wishlist]
  );

  return [wishlist, addToWishlist, removeFromWishlist];
};

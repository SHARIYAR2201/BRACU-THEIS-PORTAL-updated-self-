import React, { useEffect, useState } from 'react';

import {createUserWithEmailAndPassword, deleteUser, GoogleAuthProvider, onAuthStateChanged, signInWithEmailAndPassword, signInWithPopup, signOut } from "firebase/auth";
import { auth } from '../../firebase/firebase.init';
import { AuthContext } from './AuthContext';



const googleProvider = new GoogleAuthProvider();
const AuthProvider = ({children}) => {
 const [user, setUser] = useState(null);
 const [loading, setLoading] = useState(true);

const createUser = async (email, password) => {
    setLoading(true)
    return createUserWithEmailAndPassword(auth, email, password);
}

const signIn = async (email, password) => {
    setLoading(true)
    return signInWithEmailAndPassword(auth, email, password);
}

useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
        setUser(currentUser);
        setLoading(false);
    });
    return () => unsubscribe();
}, []);

const signInWithGoogle = async () => {
    setLoading(true)
    return signInWithPopup(auth, googleProvider);
}

const logOut = async () => {
    setLoading(true)
    return signOut(auth)

}
const deleteCurrentUser = async () => {
  setLoading(true);
  return deleteUser(auth.currentUser);
};
const authInfo = {
    user,
    loading,
    createUser,
    signIn,
    logOut,
    signInWithGoogle,
    deleteCurrentUser
}

    return (
        <AuthContext value={authInfo}>
            {children}
        </AuthContext>
    );
};

export default AuthProvider;
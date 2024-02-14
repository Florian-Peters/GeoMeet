import React, { useState } from 'react';
import { View, Text, TextInput, Button } from 'react-native';
import { getAuth, signInWithEmailAndPassword, createUserWithEmailAndPassword, indexedDBLocalPersistence } from "firebase/auth";
import { getFirestore, doc, setDoc, getDoc } from "firebase/firestore"; 
import app from './components/firebase.js'; // Importieren Sie Firebase

const SignInScreen = ({ navigation }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const handleSignIn = () => {
    if (email && password) {
      const auth = getAuth(app, {persistence: indexedDBLocalPersistence}); // Verwenden Sie die Firebase-App-Instanz
      signInWithEmailAndPassword(auth, email, password)
        .then((userCredential) => {
          // Der Benutzer wurde erfolgreich angemeldet.
          const db = getFirestore(app);
          const docRef = doc(db, "users", userCredential.user.uid);
          getDoc(docRef).then((docSnap) => {
            if (docSnap.exists()) {
              navigation.navigate('MapView', { username: docSnap.data().username });
              alert('Anmeldung erfolgreich!');
            } else {
              // doc.data() will be undefined in this case
              console.log("No such document!");
            }
          }).catch((error) => {
            console.log("Error getting document:", error);
          });
        })
        .catch((error) => {
          // Ein Fehler ist aufgetreten.
          alert('Fehler bei der Anmeldung: ' + error.message);
        });
    } else {
      alert('Bitte geben Sie eine gültige E-Mail und ein Passwort ein.');
    }
  };

  const handleForgotPassword = () => {
    // Implementieren Sie hier die Logik für "Passwort vergessen"
  };

  const handleRegister = () => {
    // Navigieren Sie zur Registrierungsseite
    navigation.navigate('RegisterScreen');
  };
  

  return (
    <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
      <Text>Geben Sie eine E-Mail ein:</Text>
      <TextInput
        style={{ height: 40, borderColor: 'black', borderWidth: 2, marginTop: 20, marginBottom: 20, paddingLeft: 15, paddingRight: 15, width: '80%' }}
        onChangeText={text => setEmail(text)}
      />
      <Text>Geben Sie ein Passwort ein:</Text>
      <TextInput
        style={{ height: 40, borderColor: 'black', borderWidth: 2, marginTop: 20, marginBottom: 20, paddingLeft: 15, paddingRight: 15, width: '80%' }}
        onChangeText={text => setPassword(text)}
        secureTextEntry
      />
      <Button
        title="Anmelden"
        onPress={handleSignIn}
      />
      <Button
        title="Passwort vergessen"
        onPress={handleForgotPassword}
      />
      <Button
        title="Noch kein Nutzer? Hier registrieren"
        onPress={handleRegister}
      />
    </View>
  );
};


export default SignInScreen;
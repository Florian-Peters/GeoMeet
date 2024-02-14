import React, { useState } from 'react';
import { View, Text, TextInput, Button } from 'react-native';
import { getAuth, createUserWithEmailAndPassword, indexedDBLocalPersistence } from "firebase/auth";
import app from './components/firebase.js'; // Importieren Sie Firebase
import { getFirestore, doc, setDoc } from "firebase/firestore"; 

const RegisterScreen = ({ navigation }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [username, setUsername] = useState('');
  const [bio, setBio] = useState('');

  const handleRegister = () => {
    if (email && password) {
      const auth = getAuth(app, {persistence: indexedDBLocalPersistence});
      createUserWithEmailAndPassword(auth, email, password)
        .then((userCredential) => {
       
          const db = getFirestore(app);
          setDoc(doc(db, "users", userCredential.user.uid), {
            username: username,
            bio: bio,
            uid: userCredential.user.uid,  // Hier wird die uid in Firestore gespeichert
          });
          alert('Registrierung erfolgreich!');
          navigation.navigate('MapView', { username: username });
        })
        .catch((error) => {
          // Ein Fehler ist aufgetreten.
          alert('Fehler bei der Registrierung: ' + error.message);
        });
    } else {
      alert('Bitte geben Sie eine gültige E-Mail, ein Passwort, einen Benutzernamen und eine Biografie ein.');
    }
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
      <Text>Geben Sie einen Benutzernamen ein:</Text>
      <TextInput
        style={{ height: 40, borderColor: 'black', borderWidth: 2, marginTop: 20, marginBottom: 20, paddingLeft: 15, paddingRight: 15, width: '80%' }}
        onChangeText={text => setUsername(text)}
      />
      <Text>Geben Sie eine Biografie ein:</Text>
      <TextInput
        style={{ height: 40, borderColor: 'black', borderWidth: 2, marginTop: 20, marginBottom: 20, paddingLeft: 15, paddingRight: 15, width: '80%' }}
        onChangeText={text => setBio(text)}
      />
      <Button
        title="Registrieren"
        onPress={handleRegister}
      />
    </View>
  );
};

export default RegisterScreen;

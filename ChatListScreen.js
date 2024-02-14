import React, { useEffect, useState } from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import { getFirestore, collection, query, onSnapshot, where, orderBy, limit } from 'firebase/firestore';
import { getAuth } from 'firebase/auth';
import app from './components/firebase.js'; // Importieren Sie Firebase

const ChatListScreen = ({ navigation }) => {
  const [chats, setChats] = useState([]);
  const auth = getAuth(app);
  const user = auth.currentUser;

  useEffect(() => {
    if (user) {
      const db = getFirestore(app);
      const q = query(
        collection(db, 'messages'),
        where('user._id', '==', user.uid),
        orderBy('createdAt', 'desc'),
        limit(1)
      );

      const unsubscribe = onSnapshot(q, (querySnapshot) => {
        const chats = querySnapshot.docs.map((doc) => {
          const data = doc.data();
          return {
            _id: data.receiver._id,
            name: data.receiver.name,
            lastMessage: data.text,
            createdAt: data.createdAt?.toDate() || new Date(),
          };
        });

        setChats(chats);
      });

      return () => unsubscribe();
    }
  }, [user]);

  return (
    <View>
      {chats.map((chat) => (
        <TouchableOpacity key={chat._id} onPress={() => navigation.navigate('Stack', { screen: 'Chat', params: { selectedUser: chat } })}>
          <Text>{chat.name}</Text>
          <Text>{chat.lastMessage}</Text>
          <Text>{chat.createdAt.toString()}</Text>
        </TouchableOpacity>
      ))}
    </View>
  );
};

export default ChatListScreen;

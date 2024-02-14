import React, { useState, useEffect } from 'react';
import { View, StyleSheet, TouchableOpacity, Text } from 'react-native';
import { GiftedChat, Bubble } from 'react-native-gifted-chat';
import {
  getFirestore,
  collection,
  addDoc,
  query,
  onSnapshot,
  orderBy,
  where,
  doc,
  getDoc,
} from 'firebase/firestore';
import { getAuth } from 'firebase/auth';
import app from './firebase';
import { useNavigation } from '@react-navigation/native';

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000',
  },
});

const ChatComponent = ({ selectedUser }) => {
  const [messages, setMessages] = useState([]);
  const [username, setUsername] = useState('');
  const auth = getAuth(app);
  const user = auth.currentUser;
  const navigation = useNavigation();

  useEffect(() => {
    setUsername(selectedUser.username);

    const fetchMessages = async () => {
      if (user && selectedUser) {
        const q = query(
          collection(getFirestore(app), 'messages'),
          orderBy('createdAt', 'desc'),
          where(
            'user._id',
            'in',
            [user.uid, selectedUser.uid].filter(Boolean)
          ),
          where(
            'receiver._id',
            'in',
            [user.uid, selectedUser.uid].filter(Boolean)
          )
        );

        const unsubscribe = onSnapshot(q, (querySnapshot) => {
          const newMessages = querySnapshot.docs.map((doc) => {
            const data = doc.data();
            return {
              _id: doc.id,
              text: data.text,
              createdAt: data.createdAt?.toDate() || new Date(),
              user: {
                _id: data.user?._id || '',
                name: data.user?.name || '',
              },
              receiver: {
                _id: data.receiver?._id || '',
                name: data.receiver?.name || '',
              },
            };
          });
          setMessages(newMessages);
        });

        return () => unsubscribe();
      }
    };

    fetchMessages();
  }, [user, selectedUser]);

  const handleSend = async (newMessages = []) => {
    if (user && selectedUser) {
      const text = newMessages[0].text;
      const db = getFirestore(app);
      const docRef = doc(db, 'users', user.uid);
      getDoc(docRef)
        .then((docSnap) => {
          if (docSnap.exists()) {
            const username = docSnap.data().username;
            const receiverData = {
              _id: selectedUser.uid,
              name: selectedUser.username,
            };

            if (receiverData.name) {
              addDoc(collection(db, 'messages'), {
                text,
                createdAt: new Date(),
                user: {
                  _id: user.uid,
                  name: username,
                },
                receiver: receiverData,
              });
            } else {
              console.log('selectedUser.username is undefined');
            }
          } else {
            console.log('No such document!');
          }
        })
        .catch((error) => {
          console.log('Error getting document:', error);
        });
    }
  };

  const renderBubble = (props) => {
    return (
      <Bubble
        {...props}
        wrapperStyle={{
          right: {
            backgroundColor: '#0f0',
          },
          left: {
            backgroundColor: '#007aff',
          },
        }}
        textStyle={{
          right: {
            color: '#fff',
          },
          left: {
            color: '#fff',
          },
        }}
      />
    );
  };

  const handleBackButton = () => {
    console.log('Navigating back to MapView. User:', user);
    navigation.navigate('MapView', { username: user ? user.displayName : '' });
  };

  return (
    <View style={styles.container}>
      <TouchableOpacity
        style={{ 
          backgroundColor: '#89ff55', 
          borderRadius: 50, 
          paddingVertical: 10, 
          paddingHorizontal: 20, 
          alignItems: 'center', 
          justifyContent: 'center', 
          alignSelf: 'flex-start', 
          margin: 10 
        }}
        onPress={handleBackButton}>
        <Text style={{ color: 'white' }}>Zurück</Text>
      </TouchableOpacity>
      <GiftedChat
        messages={messages}
        onSend={(newMessages) => handleSend(newMessages)}
        user={{
          _id: user ? user.uid : 1,
        }}
        renderBubble={renderBubble}
      />
    </View>
  );
};

export default ChatComponent;

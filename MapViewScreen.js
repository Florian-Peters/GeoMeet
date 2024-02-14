// MapViewScreen.js
import React, { useState, useEffect } from 'react';
import { View, TouchableOpacity, StyleSheet, Text, TextInput, Button, Image, Switch, ActivityIndicator, AsyncStorage } from 'react-native';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import MapView, { Marker, Callout } from 'react-native-maps';
import io from 'socket.io-client';
import * as Location from 'expo-location';
import socket from './socket';
import ChatComponent from './components/ChatComponent';
import MemoizedMarker from './components/MemoizedMarker.js';
import { getFirestore, query, where, getDocs,collection } from 'firebase/firestore';
import app from './components/firebase.js'; // Importieren Sie Firebase
import Modal from 'react-native-modal';

const CustomAlert = ({ isVisible, eventDescription, onClose }) => {
  return (
    <Modal isVisible={isVisible} onBackdropPress={onClose}>
      <View style={{ backgroundColor: 'white', padding: 20, borderRadius: 10 }}>
        <Text style={{ fontSize: 18, fontWeight: 'bold' }}>Event Description</Text>
        <Text>{eventDescription}</Text>
        <Button title="Close" onPress={onClose} />
      </View>
    </Modal>
  );
};


const Stack = createStackNavigator();

const MapViewScreen = ({ navigation, route }) => {
  const { username } = route.params; // Benutzername wird jetzt aus den Routenparametern abgerufen

  const [userLocations, setUserLocations] = useState([]);
  const [eventLocations, setEventLocations] = useState([]);
  const [myLocation, setMyLocation] = useState(null);
  const [mapReady, setMapReady] = useState(false);
  const [gpsEnabled, setGpsEnabled] = useState(true);
  const [initialRegionSet, setInitialRegionSet] = useState(false);
  const [region, setRegion] = useState(null);
  const [loading, setLoading] = useState(false);
  const [selectedUser, setSelectedUser] = useState(null);
  const [chatInput, setChatInput] = useState('');  // Assuming these variables are declared somewhere
  const [isChatOpen, setIsChatOpen] = useState(false);
  const [receivedMessages, setReceivedMessages] = useState([]);
  const [sentMessages, setSentMessages] = useState([]);
  const [hasUnreadMessages, setHasUnreadMessages] = useState(false); // Zustand für ungelesene Nachrichten

  const handleToggleGPS = () => {
    setGpsEnabled(!gpsEnabled);
  };
  useEffect(() => {
    navigation.setOptions({
      handleToggleGPS: () => setGpsEnabled(!gpsEnabled)
    });
    
  }, [navigation, gpsEnabled]);
  socket.on('updateLocation', (data) => {
    if (gpsEnabled) {
      setUserLocations(data);
    }
  });

  function handleMarkerPressEvent(event) {

    alert(event.eventDescription);
  }
  
  
  

  const handleMarkerPress = async (user) => {
    try {
      const userId = await getUserIdByUsername(user.username);
  
      if (userId) {
        const userWithUid = {
          ...user,
          uid: userId,
        };
  
        setSelectedUser(userWithUid);
        setIsChatOpen(true);
      } else {
        console.warn('Benutzer nicht gefunden.');
        // Handle accordingly
      }
    } catch (error) {
      console.error('Fehler beim Abrufen der Benutzer-ID:', error);
      // Handle error accordingly
    }
  };
  
  
  // Annahme: Du verwendest Firebase Firestore
const getUserIdByUsername = async (username) => {
  const usersCollection = collection(getFirestore(app), 'users');
  const userQuery = query(usersCollection, where('username', '==', username));
  const userSnapshot = await getDocs(userQuery);

  if (userSnapshot.docs.length > 0) {
    // Annahme: Du speicherst die Benutzer-ID unter 'uid' in deinem Firestore-Dokument
    return userSnapshot.docs[0].data().uid;
  } else {
    return null; // Benutzer nicht gefunden
  }
};


  

  useEffect(() => {
    const socket = io('http://192.168.178.55:3001');

    socket.on('connect', () => {
      console.log('Connected to server');
    });

    socket.on('updateEventLocations', (updatedEventLocations) => {
      console.log('Received updated event locations:', updatedEventLocations);
      setEventLocations(updatedEventLocations);
    });

    socket.on('eventEnded', (data) => {
      const { eventId } = data;
      console.log(`Received eventEnded event with eventId: ${eventId}`);
      const updatedEventLocations = eventLocations.filter((event) => event.eventId !== eventId);
      console.log(`Updated eventLocations: ${JSON.stringify(updatedEventLocations)}`);
      setEventLocations(updatedEventLocations);
    });

    const watchLocation = async () => {
      let { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') {
        console.error('Permission to access location was denied');
        return;
      }

      await Location.watchPositionAsync(
        {
          accuracy: Location.Accuracy.High,
          timeInterval: 8000,
          distanceInterval: 10,
        },
        (location) => {
          const { latitude, longitude } = location.coords;

          if (gpsEnabled) {
            const userLocationData = {
              latitude,
              longitude,
              username,
              image: 'https://i.ibb.co/DzTJJDQ/Nadel-Geojam.png',
            };

            console.log('Updated user location data:', userLocationData);
            socket.emit('updateLocation', userLocationData);
            setMyLocation(userLocationData);
          }
        }
      );
    };

    if (username && gpsEnabled) {
      watchLocation();
    }

    return () => {
      socket.disconnect();
      console.log('Disconnected from server');
    };
  }, [username, gpsEnabled]);

  useEffect(() => {
    if (!initialRegionSet && myLocation) {
      setRegion({
        latitude: myLocation.latitude,
        longitude: myLocation.longitude,
        latitudeDelta: 0.02,
        longitudeDelta: 0.02,
      });
      setMapReady(true);
      setInitialRegionSet(true);
    }
  }, [initialRegionSet, myLocation]);

  return (
    <View style={{ flex: 1 }}>
      {loading ? (
        <ActivityIndicator />
      ) : (
        <>
          <View style={{ flex: 1 }}>
            <View style={{ backgroundColor: 'black', flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', padding: 5 }}>
              <TouchableOpacity style={{ backgroundColor: '#89ff55', borderRadius: 50, paddingVertical: 10, paddingHorizontal: 20, alignItems: 'center', justifyContent: 'center' }} onPress={() => navigation.navigate('EventShop')}>
                <Text style={{ color: 'white' }}>Event Shop</Text>
              </TouchableOpacity>
              <View style={{ flexDirection: 'row', alignItems: 'right' }}>
                <Switch
                  value={gpsEnabled}
                  onValueChange={handleToggleGPS}
                />
                <Text style={{ color: gpsEnabled ? 'green' : 'red' }}>{gpsEnabled ? 'GPS An' : 'GPS Aus'}</Text>
              </View>
            </View>
            <MapView
              style={{ flex: 1 }}
              initialRegion={
                !initialRegionSet && myLocation
                  ? {
                      latitude: myLocation.latitude,
                      longitude: myLocation.longitude,
                      latitudeDelta: 0.02,
                      longitudeDelta: 0.02,
                    }
                  : undefined
              }
              onLayout={() => {
                setMapReady(true);
                if (myLocation) {
                  setInitialRegionSet(true);
                }
              }}
            >
              {mapReady &&
                eventLocations.map((event, index) => (
                  <Marker
                    key={index}
                    coordinate={{
                      latitude: event.latitude,
                      longitude: event.longitude,
                    }}
                    onPress={() => handleMarkerPressEvent(event)}
                  >
                    <View style={{ alignItems: 'center' }}>
                      <View style={{ backgroundColor: 'transparent', padding: 5, borderRadius: 5 }}>
                        {/* Name wird weiterhin dauerhaft angezeigt */}
                        <Text style={{ color: 'red', fontWeight: 'bold' }}>{event.eventname}</Text>
                        {/* Beschreibung hier nicht anzeigen */}
                      </View>
                      <Image
                        source={{ uri: event.image }}
                        style={{ width: 60, height: 60 }}
                      />
                    </View>
                  </Marker>
                ))}
              {mapReady &&
                userLocations.map((user, index) => (
                  <Marker
                    key={index}
                    coordinate={{
                      latitude: user.latitude,
                      longitude: user.longitude,
                    }}
                    title={user.username}
                    onPress={() => handleMarkerPress(user)}
                  >
                    {user.image && (
                      <Image
                        source={{ uri: user.image }}
                        style={{ width: 80, height: 80 }}
                      />
                    )}
                  </Marker>
                ))}
              {mapReady && myLocation && (
                <Marker
                  coordinate={{
                    latitude: myLocation.latitude,
                    longitude: myLocation.longitude,
                  }}
                  title={`Mein Standort (${username})`}
                >
                  <Image
                    source={require('./assets/NadelGeojam.png')}
                    style={{ width: 80, height: 80 }}
                  />
                </Marker>
              )}
            </MapView>
          </View>
          {mapReady && username && selectedUser && isChatOpen && (
            <ChatComponent
              selectedUser={selectedUser ? selectedUser : {}}
            />
          )}
        </>
      )}
    </View>
  );
  };
  
  export default MapViewScreen;
  
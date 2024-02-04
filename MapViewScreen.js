import React, { useState, useEffect, useRef } from 'react';
import { View, TouchableOpacity, StyleSheet, Text, TextInput, Button, Image, Switch, ActivityIndicator } from 'react-native';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import MapView, { Marker } from 'react-native-maps';
import io from 'socket.io-client';
import * as Location from 'expo-location';
import socket from './socket';
import ChatComponent from './ChatComponent';

const Stack = createStackNavigator();

const MemoizedMarker = React.memo(({ event }) => {
  const [imageLoaded, setImageLoaded] = useState(false);
  const imageRef = useRef(null);

  useEffect(() => {
    const loadImage = async () => {
      try {
        const response = await fetch(event.image);
        const blob = await response.blob();
        const reader = new FileReader();
        reader.onloadend = () => {
          setImageLoaded(true);
          imageRef.current.src = reader.result;
        };
        reader.readAsDataURL(blob);
      } catch (error) {
        console.error('Error loading image:', error);
        setImageLoaded(false);
      }
    };

    if (event.image) {
      loadImage();
    }
  }, [event.image]);

  if (!imageLoaded) {
    return null;
  }

  console.log('Rendering Marker für Event:', event);

  return (
    <Marker
      coordinate={{
        latitude: event.latitude,
        longitude: event.longitude,
      }}
      title={event.username}
    >
      {event.image && (
        <Image
          ref={imageRef}
          source={{ uri: event.image }}
          style={{ width: 80, height: 80 }}
        />
      )}
    </Marker>
  );
});

// ... (vorheriger Code)

const MapViewScreen = ({ navigation, route }) => {
  const { logoUri } = route.params;

  const [userLocations, setUserLocations] = useState([]);
  const [eventLocations, setEventLocations] = useState([]);
  const [myLocation, setMyLocation] = useState(null);
  const [username, setUsername] = useState('');
  const [input, setInput] = useState('');
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




  const handleCreateUser = () => {
    if (input && input.length > 1) {
      setUsername(input.trim());
      alert('Benutzer angelegt!');
    } else {
      alert('Der Benutzername muss mehr als einen Buchstaben enthalten.');
    }
  };

  const handleToggleGPS = () => {
    setGpsEnabled(!gpsEnabled);
  };

  const handleMarkerPress = (user) => {
    setSelectedUser(user);
  };

  const handleSendMessage = (message) => {
    const timestamp = new Date().getTime(); // Add timestamp to the message
    socket.emit('sendMessage', { sender: username, receiver: selectedUser.username, message, timestamp });
    const newSentMessage = { sender: username, receiver: selectedUser.username, message, timestamp };
    setSentMessages((prevSentMessages) => [...prevSentMessages, newSentMessage]);
    setChatInput('');
  };
  
  
  

  const handleToggleChat = () => {
    setIsChatOpen(!isChatOpen);
  };

  useEffect(() => {
    const socket = io('http://192.168.178.55:3001');

    socket.on('connect', () => {
      console.log('Connected to server');
    });
     socket.on('messageSentConfirmation', (data) => {
    const { receiver, message } = data;
    // Leere das Texteingabefeld nach dem erfolgreichen Versenden der Nachricht
    setChatInput('');

    // Hier kannst du die gesendete Nachricht in deinem UI verarbeiten, wenn gewünscht
    console.log(`Sent message to ${receiver}: ${message}`);
  });

    socket.on('updateLocation', (data) => {
      if (gpsEnabled) {
        setUserLocations(data);
      }
    });

    socket.on('updateEventLocations', (updatedEventLocations) => {
      setEventLocations(updatedEventLocations);
    });

    socket.on('eventEnded', (data) => {
      const { eventId } = data;
      console.log(`Received eventEnded event with eventId: ${eventId}`);
      const updatedEventLocations = eventLocations.filter((event) => event.eventId !== eventId);
      console.log(`Updated eventLocations: ${JSON.stringify(updatedEventLocations)}`);
      setEventLocations(updatedEventLocations);
    });

    socket.on('receiveMessage', (data) => {
      console.log('Received message:', data);

      // Hier fügen Sie die empfangene Nachricht zum State hinzu
      setReceivedMessages((prevMessages) => [...prevMessages, data]);
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
              <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                <Switch
                  value={gpsEnabled}
                  onValueChange={handleToggleGPS}
                />
                <Text style={{ color: gpsEnabled ? 'green' : 'red' }}>{gpsEnabled ? 'GPS An' : 'GPS Aus'}</Text>
              </View>
            </View>
            {!username ? (
              <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
                <Text>Geben Sie einen Benutzernamen ein:</Text>
                <TextInput
                  style={{ height: 40, borderColor: 'black', borderWidth: 2, marginTop: 20, marginBottom: 20, paddingLeft: 15, paddingRight: 15, width: '80%' }}
                  onChangeText={text => setInput(text)}
                />
                <Button
                  title="Benutzer anlegen"
                  onPress={handleCreateUser}
                />
              </View>
            ) : (
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
                  eventLocations
                  .filter((event)=> event.eventId)
                  .map((event, index) => (
                    <MemoizedMarker key={index} event={event} />
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
            )}
          </View>
          {mapReady && selectedUser && username && (  // Check if username is set before rendering ChatComponent
            <ChatComponent
            selectedUser={selectedUser}
            chatInput={chatInput}
            setChatInput={setChatInput}
            onSendMessage={handleSendMessage}
            onToggleChat={handleToggleChat}
            receivedMessages={receivedMessages} // Hier übergeben Sie die empfangenen Nachrichten an die ChatComponent
            sentMessages={sentMessages}


            />
          )}
        </>
      )}
    </View>
  );
};

export default MapViewScreen;
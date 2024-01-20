import React, { useState, useEffect } from 'react';
import { View, Text, TextInput, Button, Modal, Alert, Image } from 'react-native';
import MapView, { Marker } from 'react-native-maps';
import io from 'socket.io-client';
import * as Location from 'expo-location';

const MapViewScreen = ({ navigation }) => {
  const [userLocations, setUserLocations] = useState([]);
  const [myLocation, setMyLocation] = useState(null);
  const [username, setUsername] = useState('');
  const [input, setInput] = useState('');
  const [mapReady, setMapReady] = useState(false);

  const handleCreateUser = () => {
    if (input && input.length > 1) {
      setUsername(input.trim());
      alert('Benutzer angelegt!');
    } else {
      alert('Der Benutzername muss mehr als einen Buchstaben enthalten.');
    }
  };

  useEffect(() => {
    const socket = io('http://192.168.178.55:3001');

    socket.on('connect', () => {
      console.log('Connected to server');
    });

    socket.on('updateLocation', (data) => {
      console.log('Empfangene Standortaktualisierung:', data);
      setUserLocations(data);
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
          timeInterval: 1000,
          distanceInterval: 1,
        },
        (location) => {
          const { latitude, longitude } = location.coords;

          console.log('Aktuelle Koordinaten:', { latitude, longitude, username });



          const userLocationData = {
            latitude,
            longitude,
            username,
            image: 'https://i.ibb.co/DzTJJDQ/Nadel-Geojam.png',
          };

          socket.emit('updateLocation', userLocationData);
          setMyLocation(userLocationData);
          
        }
      );
    };

    const fetchDummyLocation = async () => {
      try {
        const response = await fetch('http://192.168.178.55:3001/api/dummyLocation');
        const data = await response.json();
        setUserLocations(data);
      } catch (error) {
        console.error('Error fetching dummy location:', error);
      }
    };

    fetchDummyLocation();

    if (username) {
      watchLocation();
    }

    return () => {
      socket.disconnect();
    };
  }, [username]);

  return (
    <View style={{ flex: 1 }}>
      {!username ? (
        <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
          <Text>Geben Sie einen Benutzernamen ein:</Text>
          <TextInput
            style={{
              height: 40,
              borderColor: 'gray',
              borderWidth: 2,
              marginTop: 20,
              marginBottom: 20,
              paddingLeft: 15,
              paddingRight: 15,
              width: '80%', }}
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
          initialRegion={{
            latitude: 50.9375,
            longitude: 6.9603,
            latitudeDelta: 0.02,
            longitudeDelta: 0.02,
          }}
          onLayout={() => setMapReady(true)}
        >
          {mapReady &&
            userLocations.map((user, index) => (
              <Marker
                key={index}
                coordinate={{
                  latitude: user.latitude,
                  longitude: user.longitude,
                }}
                title={user.username}
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
              coordinate={myLocation}
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
  );
};

export default MapViewScreen;

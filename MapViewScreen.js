import React, { useState, useEffect } from 'react';
import { View, Text, TextInput, Button, Modal, Alert, Image, Switch } from 'react-native';
import MapView, { Marker } from 'react-native-maps';
import io from 'socket.io-client';
import * as Location from 'expo-location';

const MapViewScreen = ({ navigation, route }) => {
  const { logoUri } = route.params; // LogoUri vom Navigationsparameter erhalten

  const [userLocations, setUserLocations] = useState([]);
  const [myLocation, setMyLocation] = useState(null);
  const [username, setUsername] = useState('');
  const [input, setInput] = useState('');
  const [mapReady, setMapReady] = useState(false);
  const [gpsEnabled, setGpsEnabled] = useState(true); // Schalter für GPS aktiviert/deaktiviert

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

  useEffect(() => {
    const socket = io('http://192.168.178.55:3001');

    socket.on('connect', () => {
      console.log('Connected to server');
    });

    socket.on('updateLocation', (data) => {
      if (gpsEnabled) {
        setUserLocations(data);
      }
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

    if (username && gpsEnabled) {
      watchLocation();
    }

    return () => {
      socket.disconnect();
    };
  }, [username, gpsEnabled]);

  return (
    <View style={{ flex: 1 }}>
      <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', padding: 10 }}>
        <Text>GPS aktivieren:</Text>
        <Switch
          value={gpsEnabled}
          onValueChange={handleToggleGPS}
        />
      </View>
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
              width: '80%',
            }}
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
            latitude: userLocations.length > 0 ? userLocations[0].latitude : 50.9375,
            longitude: userLocations.length > 0 ? userLocations[0].longitude : 6.9603,
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

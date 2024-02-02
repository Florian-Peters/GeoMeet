import React, { useState, useEffect } from 'react';
import { View, TouchableOpacity, StyleSheet, Text, TextInput, Button, Image, Switch } from 'react-native';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import MapView, { Marker } from 'react-native-maps';
import io from 'socket.io-client';
import * as Location from 'expo-location';

const Stack = createStackNavigator();

const MemoizedMarker = React.memo(({ event }) => {
  const [imageLoaded, setImageLoaded] = useState(false);

   useEffect(() => {
    const loadImage = async () => {
      try {
        const response = await fetch(event.image);
        const blob = await response.blob();
        const reader = new FileReader();
        reader.onloadend = () => {
          setImageLoaded(true);
          event.image = reader.result;
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
          source={{ uri: event.image }}
          style={{ width: 80, height: 80 }}
        />
      )}
    </Marker>
  );
});





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

 

    socket.on('updateEventLocations', (updatedEventLocations) => {
      setEventLocations(updatedEventLocations);
    });

    socket.on('eventEnded', (data) => {
      const { eventId } = data;
      // Finde das Event im eventLocations-Array anhand der eventId
      const updatedEventLocations = eventLocations.filter((event) => event.eventId !== eventId);
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
          timeInterval: 1000,
          distanceInterval: 1,
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
    eventLocations.map((event, index) => (
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
  );
};

export default MapViewScreen;
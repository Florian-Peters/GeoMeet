import React, { useState, useEffect, useRef } from 'react';
import { View, Text, Image, Button, StyleSheet, FlatList, TouchableOpacity, TextInput } from 'react-native';
import io from 'socket.io-client';

const EventShopScreen = ({ navigation }) => {
  const [socket, setSocket] = useState(null);
  const [username, setUsername] = useState('');
  const [latitude, setLatitude] = useState('');
  const [longitude, setLongitude] = useState('');
  const [userLocations, setUserLocations] = useState([]);
  const eventUsernameRef = useRef('');

  const products = [
    { 
      id: '1', 
      name: 'Produkt 1', 
      price: 2000, 
      image: 'https://i.ibb.co/DzTJJDQ/Nadel-Geojam.png',
      priceImage: require('./assets/Bubble.png'), 
      description: 'Kurze Beschreibung des Produkts 1',  
    },
    // Weitere Produkte...
  ];

  useEffect(() => {
    const socketInstance = io('http://192.168.178.55:3001');
    setSocket(socketInstance);

    socketInstance.on('connect', () => {
      console.log('Connected to server');
    });

   

    return () => {
      socketInstance.disconnect();
    };
  }, []);

  const clearEventLocation = (eventUsername) => {
    if (socket) {
      socket.emit('clearEventLocation', { eventUsername });
    }
  };

  const handleProductPress = (product) => {
    const eventUsername = username || 'DefaultEventName'; // Verwende den eingegebenen Benutzernamen oder einen Standardwert
    eventUsernameRef.current = eventUsername;
  
    const data = {
      latitude: parseFloat(latitude),
      longitude: parseFloat(longitude),
      username: eventUsername,
      image: product.image,
    };
  
    if (socket) {
      socket.emit('buyProduct', data); // Senden Sie eine neue Nachricht 'buyProduct' an den Server
    }
  };

  useEffect(() => {
    if (socket && userLocations.length > 0) {
      const timerId = setTimeout(() => {
        const eventUsername = eventUsernameRef.current;
        clearEventLocation(eventUsername);
      }, 30 * 1000); // 30 Sekunden in Millisekunden

      // Stelle sicher, den Timer zu löschen, wenn die Komponente entladen wird
      return () => clearTimeout(timerId);
    }
  }, [socket, userLocations]);

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Willkommen im Event Shop!</Text>

      {/* TextInput-Feld für den Eventnamen */}
      <Text style={styles.inputLabel}>Dein Benutzername:</Text>
      <TextInput
        style={styles.input}
        onChangeText={setUsername}
        value={username}
      />

      <Text style={styles.inputLabel}>Breitengrad:</Text>
      <TextInput
        style={styles.input}
        onChangeText={setLatitude}
        value={latitude}
        keyboardType="numeric"
      />

      <Text style={styles.inputLabel}>Längengrad:</Text>
      <TextInput
        style={styles.input}
        onChangeText={setLongitude}
        value={longitude}
        keyboardType="numeric"
      />

      <FlatList
        data={products}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <TouchableOpacity onPress={() => handleProductPress(item)}>
            <View style={styles.itemContainer}>
              <Image style={styles.itemImage} source={{ uri: item.image }} />
              <Text style={styles.itemName}>{item.name}</Text>
              <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                <Text style={styles.itemPrice}>{item.price}</Text>
                <Image source={item.priceImage} style={{ width: 20, height: 20 }} />
              </View>
              <Text style={styles.itemDescription}>{item.description}</Text>
              <Button title="BUY" onPress={() => handleProductPress(item)} />
            </View>
          </TouchableOpacity>
        )}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#1f1f1f',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginTop: 20,
    marginBottom: 20,
    color: '#89ff55',
  },
  itemContainer: {
    padding: 20,
    marginVertical: 10,
    borderWidth: 1,
    borderRadius: 5,
    alignItems: 'center',
    backgroundColor: 'black', // Hintergrundfarbe der Produktcontainer
  },
  itemImage: {
    width: '100%',
    height: 150,
    marginBottom: 10,
    borderRadius: 5,
  },
  itemName: {
    fontSize: 18,
    fontWeight: 'bold',
    color: 'white',
  },
  itemPrice: {
    fontSize: 16,
    color: 'white',
  },
  itemDescription: {
    fontSize: 14,
    color: 'white',
    marginBottom: 10,
  },
  inputLabel: {
    fontSize: 16,
    color: 'white',
  },
  input: {
    height: 40,
    width: '80%',
    borderColor: 'gray',
    borderWidth: 1,
    marginBottom: 20,
    color: 'white',
  },
});

export default EventShopScreen;

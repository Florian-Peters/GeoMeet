import React, { useState, useEffect } from 'react';
import { View, Text, TextInput, Button, StyleSheet } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import io from 'socket.io-client';

const ProductDetailsScreen = ({ route }) => {
  const navigation = useNavigation();
  const { product } = route.params;
  const [username, setUsername] = useState('');
  const [latitude, setLatitude] = useState('');
  const [longitude, setLongitude] = useState('');
  const [socket, setSocket] = useState(null);

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

  const handleProductPress = (product) => {
    navigation.navigate('ProductDetails', { product });
  };

  const handleConfirmPurchase = () => {
    const data = {
      latitude: parseFloat(latitude),
      longitude: parseFloat(longitude),
      username: username,
      image: product.image,
    };

    // Überprüfe, ob die Socket-Verbindung existiert und geöffnet ist
    if (socket && socket.connected) {
      // Sende die Daten an den Server
      socket.emit('confirmPurchase', data);
      console.log (data);
    }

    // Füge die Logik hinzu, um den Kauf mit den Daten zu verarbeiten
    // ...

    // Nachdem der Kauf verarbeitet wurde, kannst du zur vorherigen Seite navigieren
    handleGoBack();
  };

  const handleGoBack = () => {
    navigation.goBack();
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Product Details</Text>
      <Text style={styles.productName}>{product.name}</Text>

      <Text style={styles.inputLabel}>Event Name</Text>
      <TextInput
        style={styles.input}
        onChangeText={setUsername}
        value={username}
      />

      <Text style={styles.inputLabel}>Latitude:</Text>
      <TextInput
        style={styles.input}
        onChangeText={setLatitude}
        keyboardType="numeric"
      />

      <Text style={styles.inputLabel}>Longitude:</Text>
      <TextInput
        style={styles.input}
        onChangeText={setLongitude}
        keyboardType="numeric"
      />

      <Button title="Confirm Purchase" onPress={handleConfirmPurchase} />
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
    marginBottom: 20,
    color: '#89ff55',
  },
  productName: {
    fontSize: 18,
    fontWeight: 'bold',
    color: 'white',
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

export default ProductDetailsScreen;

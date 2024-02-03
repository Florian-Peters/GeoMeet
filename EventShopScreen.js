import React, { useState, useEffect, useRef } from 'react';
import { View, Text, Image, Button, StyleSheet, FlatList, TouchableOpacity, TextInput } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import io from 'socket.io-client';

const EventShopScreen = () => {
  
  const [socket, setSocket] = useState(null);
  const [username, setUsername] = useState('');
  const [latitude, setLatitude] = useState('');
  const [longitude, setLongitude] = useState('');
  const [userLocations, setUserLocations] = useState([]);
  const eventUsernameRef = useRef('');

  const navigation = useNavigation();

  const products = [
    { 
      id: '1', 
      name: '24H Marker!', 
      price: 20000, 
      duration: 1 * 2 * 15 * 1000, // 24 hours in milliseconds
      image: require('./assets/24h.jpeg'), 
      priceImage: require('./assets/Bubble.png'), 
      description: 'With this purchase, the event will be marked on the map for 24 hours. Consider carefully when the right time frame is!',  
    },
    { 
      id: '2', 
      name: '48H Marker!', 
      price: 20000, 
      duration: 1 * 2 * 15 * 1000, // 24 hours in milliseconds
      image: require('./assets/48h.jpeg'), 
      priceImage: require('./assets/Bubble.png'), 
      description: 'With this purchase, the event will be marked on the map for 24 hours. Consider carefully when the right time frame is!',  
    },
    { 
      id: '3', 
      name: '7Day Marker!', 
      price: 20000, 
      duration: 1 * 2 * 15 * 1000, // 24 hours in milliseconds
      image: require('./assets/7days.jpeg'), 
      priceImage: require('./assets/Bubble.png'), 
      description: 'With this purchase, the event will be marked on the map for 24 hours. Consider carefully when the right time frame is!',  
    },
    { 
      id: '4', 
      name: '14Day Marker!', 
      price: 20000, 
      duration: 1 * 2 * 15 * 1000, // 24 hours in milliseconds
      image: require('./assets/14days.jpeg'), 
      priceImage: require('./assets/Bubble.png'), 
      description: 'With this purchase, the event will be marked on the map for 24 hours. Consider carefully when the right time frame is!',  
    },
  ];

  const handleProductPress = (product) => {
    // ... Implement logic for the product details page here

    // Navigate to "ProductDetails" and pass the required parameters
    navigation.navigate('ProductDetails', { product,  duration: product.duration });
  };
  
  return (
    <View style={styles.container}>
      <Text style={styles.title}>Welcome to the Event Shop!</Text>

      <FlatList
        data={products}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <TouchableOpacity onPress={() => handleProductPress(item)}>
            <View style={styles.itemContainer}>
              <View style={styles.imageContainer}>
                <Image source={item.image} style={styles.itemImage} />
              </View>
              <Text style={styles.itemName}>{item.name}</Text>
              <View style={styles.priceContainer}>
                <Text style={styles.itemPrice}>{item.price}</Text>
                <Image source={item.priceImage} style={{ width: 20, height: 20 }} />
              </View>
              <View style={styles.descriptionContainer}>
                <Text style={styles.itemDescription}>{item.description}</Text>
              </View>
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
    padding: 50,
    marginVertical: 10,
    borderWidth: 1,
    borderRadius: 5,
    alignItems: 'center',
    backgroundColor: 'black', // Background color of the product container
  },
  imageContainer: {
    width: '100%', // Adjust the width as needed
    alignItems: 'center',
    marginBottom: 10,
  },
  itemImage: {
    width: '70%',
    height: 180,
    borderRadius: 5,
    backgroundColor: 'black',
  },
  itemName: {
    fontSize: 18,
    fontWeight: 'bold',
    color: 'white',
  },
  priceContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  itemPrice: {
    fontSize: 16,
    color: 'white',
  },
  descriptionContainer: {
    marginTop: 25,
    width: '100%', // Adjust the width as needed
    marginBottom: 10,
  },
  itemDescription: {
    fontSize: 14,
    color: '#89ff55',
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

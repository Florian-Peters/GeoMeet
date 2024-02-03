import React, { useState, useEffect } from 'react';
import { View, Text, TextInput, Button, StyleSheet, Image, Platform } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import io from 'socket.io-client';
import * as ImagePicker from 'expo-image-picker';
import uuid from 'react-native-uuid';

const ProductDetailsScreen = ({ route }) => {
  
  const navigation = useNavigation();
  const { product } = route.params;
  const { duration } = route.params;
  const [username, setUsername] = useState('');
  const [latitude, setLatitude] = useState('');
  const [longitude, setLongitude] = useState('');
  const [socket, setSocket] = useState(null);
  const [image, setImage] = useState(null);

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

  useEffect(() => {
    (async () => {
      if (Platform.OS !== 'web') {
        const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
        if (status !== 'granted') {
          alert('Sorry, we need camera roll permissions to make this work!');
        }
      }
    })();
  }, []);

  const pickImage = async () => {
    let result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.All,
      allowsEditing: true,
      aspect: [4, 3],
      quality: 0.8,
    });
    
    console.log(result); // Log the entire result object
    
  
    if (!result.cancelled) {
      setImage(result.assets[0].uri);
      console.log('Selected image URI:', result.assets[0].uri); // Hinzugefügt für Debugging
    }
    
  };
  
  const handleConfirmPurchase = async () => {
    try {
      if (image) {
        let localUri = image;
        let filename = localUri.split('/').pop();
      
        // Infer the type of the image
        let match = /\.(\w+)$/.exec(filename);
        let type = match ? `image/${match[1]}` : `image`;
      
        // Upload the image using the fetch and FormData APIs
        let formData = new FormData();
        // Assume "photo" is the name of the form field the server expects
        formData.append('image', { uri: localUri, name: filename, type });
        formData.append('latitude', latitude.toString());
        formData.append('longitude', longitude.toString());
      
        const response = await fetch('http://192.168.178.55:3001/upload', {
          method: 'POST',
          body: formData,
          headers: {
            'Content-Type': 'multipart/form-data',
          },
        });
  
        const data = await response.text(); // Hier verwende text(), um den Antworttext zu erhalten
        console.log('Image upload response:', data);
  
        // Versuche, die Antwort als JSON zu parsen
        const jsonData = JSON.parse(data);
        console.log('Parsed JSON response:', jsonData);
  
        // Erstelle eine eindeutige eventId
        const eventId = uuid.v4();
  
        if (socket && socket.connected) {
          socket.emit('confirmPurchase', {
            latitude: parseFloat(latitude),
            longitude: parseFloat(longitude),
            duration,
            username,
            image: jsonData.imagePath,
            eventId, // Füge die eventId hinzu
          });
        }
  
        navigation.goBack();
      } else {
        console.log('No image selected');
      }
    } catch (error) {
      console.error('Image upload error:', error);
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Product Details</Text>
      <Button title="Select Image" onPress={pickImage} />
      {image && <Image source={{ uri: `data:image/jpeg;base64,${image}` }} style={{ width: 200, height: 200 }} />}
      <Text style={styles.productName}>{product.name}</Text>
      <Text style={styles.productDescription}>{product.description}</Text>

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

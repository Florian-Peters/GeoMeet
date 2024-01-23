import React from 'react';
import { View, Text, Image, Button, StyleSheet, FlatList, TouchableOpacity } from 'react-native';

const EventShopScreen = ({ navigation }) => {
  const products = [
    { id: '1', name: 'Produkt 1', price: 2000, priceImage: require('./assets/Bubble.png'), description: 'Kurze Beschreibung des Produkts 1', image: require('./assets/shop1.jpeg') },
    { id: '2', name: 'Produkt 2', price: 2000, priceImage: require('./assets/Bubble.png'), description: 'Kurze Beschreibung des Produkts 2', image: require('./assets/shop1.jpeg') },
    { id: '3', name: 'Produkt 3', price: 2000, priceImage: require('./assets/Bubble.png'), description: 'Kurze Beschreibung des Produkts 3', image: require('./assets/shop1.jpeg') },
    { id: '4', name: 'Produkt 4', price: 2000, priceImage: require('./assets/Bubble.png'), description: 'Kurze Beschreibung des Produkts 4', image: require('./assets/shop1.jpeg') },
    // Füge hier weitere Produkte hinzu
  ];

  const handleProductPress = (product) => {
    // Hier könntest du die Navigation zu einer anderen Ansicht für eine umfangreichere Beschreibung implementieren
    // Beispiel: navigation.navigate('ProductDetails', { product });
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Willkommen im Event Shop!</Text>
      <FlatList
        data={products}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
            <TouchableOpacity onPress={() => handleProductPress(item)}>
              <View style={styles.itemContainer}>
                <Image style={styles.itemImage} source={item.image} />
                <Text style={styles.itemName}>{item.name}</Text>
                <View style={{flexDirection: 'row', alignItems: 'center'}}>
                  <Text style={styles.itemPrice}>{item.price}</Text>
                  <Image source={item.priceImage} style={{width: 20, height: 20}} />
                </View>
                <Text style={styles.itemDescription}>{item.description}</Text>
                <Button title="IN DEN WARENKORB" onPress={() => {}} />
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
});

export default EventShopScreen;

import React, { useState,  } from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import MapViewScreen from './MapViewScreen';
import { AppRegistry, StyleSheet,Platform,View } from 'react-native';
import { Image } from 'react-native';
import EventShopScreen from './EventShopScreen';

const Stack = createStackNavigator();

const styles = StyleSheet.create({
  logo: {
    width: 180,
    height: 40,
    alignSelf: 'center',
    marginLeft: Platform.OS === 'android' ? 'auto' : 0,
    marginRight: Platform.OS === 'android' ? 'auto' : 0,
  },
});

const App = () => {
  const logoUri = 'https://static.wixstatic.com/media/8299f7_6d97b890b6914f138622072d558db729~mv2.png/v1/fill/w_332,h_144,al_c,q_85,usm_0.66_1.00_0.01,enc_auto/Green_Type_Only_Logo.png';
  const [gpsEnabled, setGpsEnabled] = useState(true);
  const LogoHeader = () => {
    return (
      <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center' }}>
  <Image
    source={{ uri: logoUri }}
    style={styles.logo}
  />
</View>
    
    );
  };

  return (
<NavigationContainer>
  <Stack.Navigator
    screenOptions={{
      headerTitle: () => <LogoHeader />,
      headerStyle: {
        backgroundColor: 'black', // Ändern Sie die Hintergrundfarbe hier
      },
      headerTitleAlign: 'center', // Fügt diese Zeile hinzu
      headerShadowVisible: false,
    }}
  >
    <Stack.Screen
      name="MapView"
      component={MapViewScreen}
      initialParams={{ logoUri, gpsEnabled, setGpsEnabled }}
    />
    {/* Weitere Screens hier hinzufügen, falls gewünscht */}
    <Stack.Screen
       name="EventShop"
       component={EventShopScreen}
/>

  </Stack.Navigator>
</NavigationContainer>

  );
};

AppRegistry.registerComponent('main', () => App);

export default App;

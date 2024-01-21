import React, { useState } from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import MapViewScreen from './MapViewScreen';
import { AppRegistry } from 'react-native';
import { Image } from 'react-native';
import GPSContext from './GPSContext';

const Stack = createStackNavigator();

const App = () => {
  const logoUri = 'https://static.wixstatic.com/media/8299f7_6d97b890b6914f138622072d558db729~mv2.png/v1/fill/w_332,h_144,al_c,q_85,usm_0.66_1.00_0.01,enc_auto/Green_Type_Only_Logo.png';
  const [gpsEnabled, setGpsEnabled] = useState(true);
  const LogoHeader = () => {
    return (
      <Image
        source={{ uri: logoUri }}
        style={{ width: 120, height: 50 }}  // Ajustieren Sie die Größe nach Bedarf
      />
    );
  };

  return (
    <NavigationContainer>
      <Stack.Navigator
        screenOptions={{
          headerTitle: () => <LogoHeader />,
          headerLeft: null,  // Verstecke die Schaltfläche "Zurück"
          headerStyle: {
            backgroundColor: 'black', // Ändern Sie die Hintergrundfarbe hier
          },
        }}
      >
        <Stack.Screen
          name="MapView"
          component={MapViewScreen}
          initialParams={{ logoUri, gpsEnabled, setGpsEnabled }}
        />
        {/* Weitere Screens hier hinzufügen, falls gewünscht */}
      </Stack.Navigator>
    </NavigationContainer>
  );
};

AppRegistry.registerComponent('main', () => App);

export default App;

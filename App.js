import React, { useState, useEffect } from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createStackNavigator } from '@react-navigation/stack';
import MapViewScreen from './MapViewScreen';
import { AppRegistry, StyleSheet, Platform, View } from 'react-native';
import { Image } from 'react-native';
import EventShopScreen from './EventShopScreen';
import ProductDetailsScreen from './ProductDetailsScreen';
import Login from './Login';
import RegisterScreen from './RegisterScreen';
import Icon from 'react-native-vector-icons/FontAwesome5';
import ChatComponent from './components/ChatComponent';
import ChatListScreen from './ChatListScreen'; // Importieren Sie die ChatListScreen-Komponente

const Tab = createBottomTabNavigator();
const Stack = createStackNavigator();

const App = () => {
  const logoUri = 'https://static.wixstatic.com/media/8299f7_6d97b890b6914f138622072d558db729~mv2.png/v1/fill/w_332,h_144,al_c,q_85,usm_0.66_1.00_0.01,enc_auto/Green_Type_Only_Logo.png';
  const [gpsEnabled, setGpsEnabled] = useState(true);

  return (
    <NavigationContainer>
      <Tab.Navigator
        screenOptions={({ route }) => ({
          tabBarIcon: ({ color, size }) => {
            let iconName;

            if (route.name === 'Login') {
              iconName = 'home';
            } else if (route.name === 'RegisterScreen') {
              iconName = 'user';
            } else if (route.name === 'MapView') {
              iconName = 'map-marked-alt';
            } else if (route.name === 'ChatList') { // Fügen Sie ein neues Symbol für den ChatList-Tab hinzu
              iconName = 'comments';
            } else if (route.name === 'EventShop') {
              iconName = 'shopping-cart';
            }

            return <Icon name={iconName} size={size} color={color} />;
          },
          tabBarActiveTintColor: 'white',
          tabBarInactiveTintColor: 'gray',
          tabBarStyle: {
            display: 'flex',
            backgroundColor: 'black',
          },
          headerTitle: () => (
            <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center' }}>
              <Image
                source={{ uri: logoUri }}
                style={styles.logo}
              />
            </View>
          ),
          headerStyle: {
            backgroundColor: 'black',
          },
          headerTitleAlign: 'center',
          headerShadowVisible: false,
        })}
      >
        <Tab.Screen name="Login" component={Login} options={{ tabBarStyle: { display: 'none' } }} />
        <Tab.Screen name="RegisterScreen" component={RegisterScreen} options={{ tabBarStyle: { display: 'none' } }} />
        <Tab.Screen
          name="MapView"
          component={MapViewScreen}
          initialParams={{ logoUri, gpsEnabled, setGpsEnabled }}
        />
        <Tab.Screen name="ChatList" component={ChatListScreen} /> 
        <Tab.Screen name="EventShop" component={StackScreen} />
      </Tab.Navigator>
    </NavigationContainer>
  );
};

const StackScreen = () => {
  return (
    <Stack.Navigator
      screenOptions={{
        headerStyle: { backgroundColor: 'black' },
        headerTintColor: 'white',
        headerBackTitleVisible: false,
        cardStyle: { backgroundColor: 'black' }
      }}
    >
      <Stack.Screen 
        name="EventShop" 
        component={EventShopScreen}  
        options={{
          title: '',
        }}  
      />
      <Stack.Screen 
        name="ProductDetails" 
        component={ProductDetailsScreen}  
        options={{
          title: '',
        }}  
      />
    </Stack.Navigator>
  );
};

const styles = StyleSheet.create({
  logo: {
    width: 180,
    height: 40,
    alignSelf: 'center',
    marginLeft: Platform.OS === 'android' ? 'auto' : 0,
    marginRight: Platform.OS === 'android' ? 'auto' : 0,
  },
});

AppRegistry.registerComponent('main', () => App);

export default App;

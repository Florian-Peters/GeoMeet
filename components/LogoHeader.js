import React from 'react';
import { View, Image, StyleSheet } from 'react-native';

const LogoHeader = ({ logoUri }) => {
  return (
    <View style={styles.container}>
      <Image source={{ uri: logoUri }} style={styles.logo} />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  logo: {
    width: 180,
    height: 40,
    alignSelf: 'center',
  },
});

export default LogoHeader;

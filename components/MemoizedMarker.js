// MemoizedMarker.js
import React, { useState, useEffect, useRef } from 'react';
import { Image } from 'react-native';
import { Marker } from 'react-native-maps';

const MemoizedMarker = React.memo(({ event }) => {
  console.log('Rendering Marker für Event:', event);

  const [imageLoaded, setImageLoaded] = useState(false);
  const imageRef = useRef(null);

  useEffect(() => {
    const loadImage = async () => {
      try {
        console.log('Start loading image:', event.image);

        const response = await fetch(event.image);
        console.log('Image fetch response:', response);

        if (!response.ok) {
          console.error('Image fetch failed:', response.status, response.statusText);
          setImageLoaded(false);
          return;
        }

        const blob = await response.blob();
        console.log('Image blob:', blob);

        const reader = new FileReader();
        reader.onloadend = () => {
          console.log('Image loaded successfully:', reader.result);
          setImageLoaded(true);
          imageRef.current.src = reader.result;
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
          ref={imageRef}
          source={{ uri: event.image }}
          style={{ width: 80, height: 80 }}
        />
      )}
    </Marker>
  );
});

export default MemoizedMarker;

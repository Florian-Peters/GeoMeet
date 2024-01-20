const express = require('express');
const http = require('http');
const socketIo = require('socket.io');

const app = express();
const server = http.createServer(app);
const io = socketIo(server);

const userLocationDatavonH = [];
const socketToUsernameMap = new Map(); // Map to track socket IDs to usernames

app.get('/api/userLocations', (req, res) => {
  res.json(userLocationDatavonH);
});

app.get('/api/dummyLocation', (req, res) => {
  res.json(DummyLocation); // Hinzugefügt: DummyLocation senden
});

io.on('connection', (socket) => {
  console.log('Client connected');

  io.emit('updateLocation', userLocationDatavonH);

  socket.on('getLocations', () => {
    io.emit('updateLocation', userLocationDatavonH);
  });

  socket.on('updateLocation', (data) => {
    console.log('Received location update:', data);

    const updatedUser = {
      latitude: data.latitude,
      longitude: data.longitude,
      username: data.username,
      image: data.image,
    };

    const existingUser = userLocationDatavonH.find((user) => user.username === data.username);
    if (existingUser) {
      Object.assign(existingUser, updatedUser);
    } else {
      userLocationDatavonH.push(updatedUser);
    }

    // Update the map with the socket ID and username
    socketToUsernameMap.set(socket.id, data.username);

    io.emit('updateLocation', userLocationDatavonH);
  });

  socket.on('disconnect', () => {
    console.log('Client disconnected');
    // Remove the disconnected user from the list
    const username = socketToUsernameMap.get(socket.id);
    const index = userLocationDatavonH.findIndex((user) => user.username === username);
    if (index !== -1) {
      userLocationDatavonH.splice(index, 1);
      io.emit('updateLocation', userLocationDatavonH);
    }
    // Remove the entry from the map
    socketToUsernameMap.delete(socket.id);
  });
});

const DummyLocation = [
  {
    latitude: 50.9375,
    longitude: 7.9603,
    username: 'DummyUser',
    image: 'https://i.ibb.co/DzTJJDQ/Nadel-Geojam.png',
  },
];

server.listen(3001, () => {
  console.log('Server is running on port 3001');
});

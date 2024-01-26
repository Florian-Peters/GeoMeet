const express = require('express');
const http = require('http');
const socketIo = require('socket.io');

const app = express();
const server = http.createServer(app);
const io = socketIo(server);

const userLocationDatavonH = [];
const socketToUsernameMap = new Map();
const eventLocations = [];

app.get('/api/userLocations', (req, res) => {
  res.json(userLocationData);
});

const addEventLocation = (data) => {
  eventLocations.push(data);
  io.emit('updateEventLocations', eventLocations);
};

const removeEventLocation = (index) => {
  eventLocations.splice(index, 1);
  io.emit('updateEventLocations', eventLocations);
};

io.on('connection', (socket) => {
  console.log('Client connected');
  io.emit('updateLocation', userLocationDatavonH);
  io.emit('updateEventLocations', eventLocations);

  socket.on('getLocations', () => {
    io.emit('updateLocation', userLocationDatavonH);
  });

  socket.on('confirmPurchase', (data) => {
    console.log('Received product purchase:', data);

    addEventLocation(data);

    setTimeout(() => {
      const index = eventLocations.findIndex((event) => event.username === data.username);
      if (index !== -1) {
        removeEventLocation(index);
      }
    }, 30 * 5000);
  });

  socket.on('updateLocation', (data) => {
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

server.listen(3001, () => {
  console.log('Server is running on port 3001');
});
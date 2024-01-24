const express = require('express');
const http = require('http');
const socketIo = require('socket.io');

const app = express();
const server = http.createServer(app);
const io = socketIo(server);

let userLocationData = [];
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
  io.emit('updateLocation', userLocationData);
  io.emit('updateEventLocations', eventLocations);

  socket.on('getLocations', () => {
    io.emit('updateLocation', userLocationData);
  });

  socket.on('buyProduct', (data) => {
    console.log('Received product purchase:', data);

    addEventLocation(data);

    setTimeout(() => {
      const index = eventLocations.findIndex((event) => event.username === data.username);
      if (index !== -1) {
        removeEventLocation(index);
      }
    }, 30 * 1000);
  });

  socket.on('updateLocation', (data) => {
    const updatedUser = {
      latitude: data.latitude,
      longitude: data.longitude,
      username: data.username,
      image: data.image,
    };

    const existingUser = userLocationData.find((user) => user.username === data.username);
    if (existingUser) {
      Object.assign(existingUser, updatedUser);
    } else {
      userLocationData.push(updatedUser);
    }

    socketToUsernameMap.set(socket.id, data.username);

    io.emit('updateLocation', userLocationData);
    addEventLocation(data);
  });

  socket.on('clearEventLocation', ({ eventUsername }) => {
    const index = eventLocations.findIndex((event) => event.username === eventUsername);
    if (index !== -1) {
      removeEventLocation(index);
    }
  });

  socket.on('disconnect', () => {
    socketToUsernameMap.delete(socket.id);
  });
});

server.listen(3001, () => {
  console.log('Server is running on port 3001');
});

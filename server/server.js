const express = require('express');
const http = require('http');
const socketIo = require('socket.io');
const multer = require('multer');
const path = require('path');
const fs = require('fs');

const app = express();
const server = http.createServer(app);
const io = socketIo(server);

const userLocationData = [];
const eventLocations = [];
const socketToUsernameMap = new Map();
const usernameToSocketMap = new Map();


const getUsernameSocketId = (username) => {
  for (const [socketId, name] of socketToUsernameMap.entries()) {
    if (name === username) {
      return socketId;
    }
  }
  return null; // Benutzer nicht gefunden
};

io.on('connection', (socket) => {
  console.log('Client connected');
  io.emit('updateLocation', userLocationData);
  io.emit('updateEventLocations', eventLocations);

  socket.on('getLocations', () => {
    io.emit('updateLocation', userLocationData);
  });

  // Hier füge die Logik für die Chat-Nachrichten hinzu
  socket.on('sendMessage', (data) => {
    const { sender, receiver, message } = data;
    const timestamp = new Date().getTime(); // Erstellen Sie einen Zeitstempel
  
    // Überprüfen, ob der Empfänger online ist
    const receiverSocketId = usernameToSocketMap.get(receiver);
    if (receiverSocketId) {
      // Sende die Nachricht nur an den spezifizierten Empfänger
      io.to(receiverSocketId).emit('receiveMessage', { sender, message, timestamp }); // Fügen Sie den Zeitstempel zur Nachricht hinzu
  
      // Sende eine Bestätigungsnachricht an den Sender
      socket.emit('messageSentConfirmation', { receiver, message, timestamp }); // Fügen Sie den Zeitstempel zur Bestätigungsnachricht hinzu
    }
  });

  socket.on('eventImage', ({ eventId, imagePath }) => {
    console.log(`Received eventImage with eventId: ${eventId} and imagePath: ${imagePath}`);
    const updatedEventLocations = [...eventLocations];
    updatedEventLocations[eventId].image = imagePath;
    io.emit('updateEventLocations', updatedEventLocations);
  });

  socket.on('confirmPurchase', (data) => {
    console.log(`Received confirmPurchase with data: ${JSON.stringify(data)}`);
    addEventLocation(data);

    setTimeout(() => {
      const index = eventLocations.findIndex((event) => event.eventId === data.eventId);
      if (index !== -1) {
        removeEventLocation(data.eventId, () => {
          io.emit('updateEventLocations', eventLocations);
        });
      }
    }, data.duration);
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

    // Update the map with the socket ID and username
    socketToUsernameMap.set(socket.id, data.username);
    usernameToSocketMap.set(data.username, socket.id);



    io.emit('updateLocation', userLocationData);
    
  });

  socket.on('disconnect', () => {
    console.log('Client disconnected');
    // Remove the disconnected user from the list
    const username = socketToUsernameMap.get(socket.id);
    const index = userLocationData.findIndex((user) => user.username === username);
    if (index !== -1) {
      userLocationData.splice(index, 1);
      io.emit('updateLocation', userLocationData);
    }
    // Remove the entry from the map
    socketToUsernameMap.delete(socket.id);
  });
});

// ... (weiterer Servercode)

const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, 'uploads/');
  },
  filename: function (req, file, cb) {
    cb(null, Date.now() + path.extname(file.originalname));
  }
});

const upload = multer({
  storage: storage,
  fileFilter: (req, file, cb) => {
    if (file.mimetype.startsWith('image/')) {
      cb(null, true);
    } else {
      cb(new Error('Invalid file type. Only image files are allowed.'));
    }
  },
});

app.use(express.json());
app.use('/uploads', express.static('uploads'));

app.post('/upload', upload.single('image'), (req, res) => {
  console.log(`Received latitude: ${req.body.latitude}, longitude: ${req.body.longitude}`);
  if (!req.file) {
    return res.status(400).json({ message: 'No file in request.' });
  }

  const latitude = parseFloat(req.body.latitude);
  const longitude = parseFloat(req.body.longitude);

  if (isNaN(latitude) || isNaN(longitude)) {
    return res.status(400).json({ message: 'Latitude and longitude are required and cannot be null.' });
  }

  const { eventId } = req.body; // Die vom Client übermittelte eventId

  addEventLocation({
    latitude: latitude,
    longitude: longitude,
    username: req.body.username,
    image: `http://192.168.178.55:3001/uploads/${req.file.filename}`,
    eventId: eventId,
  });

  res.status(200).json({
    message: 'Image uploaded successfully',
    eventId: eventId,
    imagePath: `http://192.168.178.55:3001/uploads/${req.file.filename}`,
  });
});

const addEventLocation = (data) => {
  eventLocations.push({
    latitude: data.latitude,
    longitude: data.longitude,
    username: data.username,
    image: data.image,
    eventId: data.eventId,
  });
  io.emit('updateEventLocations', eventLocations);
};

const removeEventLocation = (eventId, callback) => {
  console.log(`Removing event with eventId: ${eventId}`);
  const index = eventLocations.findIndex((event) => event.eventId === eventId);

  if (index === -1) {
    console.error(`Event with eventId ${eventId} not found.`);
    return;
  }

  const event = eventLocations[index];
  const imagePath = path.join(__dirname, 'uploads', path.basename(event.image));

  fs.unlink(imagePath, (err) => {
    if (err) {
      console.error(`Error removing image at ${imagePath}:`, err);
      return;
    }

    console.log(`Image at ${imagePath} removed successfully`);

    // Rufe das Callback auf, um fortzufahren
    if (callback) {
      callback();
    }
  });

  // Entferne das Event aus der Liste
  eventLocations.splice(index, 1);
  io.emit('eventEnded', { eventId: event.eventId });
  io.emit('updateEventLocations', eventLocations);
};

server.listen(3001, () => {
  console.log('Server is running on port 3001');
});

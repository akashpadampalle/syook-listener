const crypto = require('crypto');
const express = require('express');
const http = require('http');
const socketIo = require('socket.io');
const path = require('path')
const emmiter = require('./emitter');
const db = require('./configs/db');
const DataModel = require('./models/dataSchema');

const app = express();
const server = http.createServer(app);



const io = socketIo(server);

// Function to decrypt a message using AES-256-CTR
function decryptMessage(encryptedMessage, key) {
    const parts = encryptedMessage.split('|');
    const iv = Buffer.from(parts[0], 'hex');
    const encrypted = parts[1];
    const decipher = crypto.createDecipheriv('aes-256-ctr', Buffer.from(key, 'hex'), iv);
    const decrypted = decipher.update(encrypted, 'hex', 'utf8') + decipher.final('utf8');
    return decrypted;
}

// Serve your frontend
app.use(express.static(path.join(__dirname, 'public'))); // Replace 'public' with your frontend's build directory

io.on('connection', (socket) => {
  console.log('Emitter connected.');

  socket.on('dataStream', (dataStream) => {
    // Split the data stream into individual messages
    const encryptedMessages = dataStream.split('-');

    // Iterate through each encrypted message
    encryptedMessages.forEach(async (encryptedMessage) => {
      try {
        // Decrypt the message using your secret key
        const decryptedMessage = decryptMessage(encryptedMessage, process.env.ENCRYPTIOIN_KEY);

        // Parse the decrypted message into a JavaScript object
        const message = JSON.parse(decryptedMessage);

        // Validate the message using the secret_key
        const calculatedSecretKey = crypto
          .createHash('sha256')
          .update(JSON.stringify({ ...message, secret_key: undefined }))
          .digest('hex');

        if (calculatedSecretKey === message.secret_key) {
          // If validation passes, add a timestamp and save it to the MongoDB collection
          const dataEntry = new DataModel({
            ...message,
            timestamp: new Date(),
          });

          // Save the data to the database
          await dataEntry.save();


          // Emit the saved data to the connected frontend(s)
          io.emit('savedData', {...message, secret_key: undefined});
        } else {
          console.log('Data validation failed:', message);
        }
      } catch (error) {
        console.error('Error processing message:', error);
      }
    });
  });
});

const PORT = process.env.PORT || 3000;

server.listen(PORT, () => {
  console.log(`Listener service is running on port ${PORT}.`);
});

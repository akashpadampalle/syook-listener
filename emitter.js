const crypto = require('crypto')
const randomBytes = require('crypto').randomBytes; // Use the built-in crypto module for randomBytes
const io = require('socket.io-client');

// data file
const data = require('./data.json');

const emitter = io('https://syook-listener.vercel.app:3000'); // listener server

// Function to generate random number
function getRandomInt(min, max) {
  return Math.floor(Math.random() * (max - min + 1) + min);
}

// Function to create random integer
function createRandomMessage() {
  const randomNameIndex = getRandomInt(0, data.names.length - 1);
  const randomOriginCityIndex = getRandomInt(0, data.cities.length - 1);
  const randomDestinationCityIndex = getRandomInt(0, data.cities.length - 1);

  const name = data.names[randomNameIndex];
  const origin = data.cities[randomOriginCityIndex];
  const destination = data.cities[randomDestinationCityIndex];

  const originalMessage = {
    name,
    origin,
    destination,
  };


  // Use the built-in crypto module for hashing
  const secret_key = crypto
    .createHash('sha256')
    .update(JSON.stringify(originalMessage))
    .digest('hex');

  return {
    ...originalMessage,
    secret_key,
  };
}

// Function to encrypt a message using AES-256-CTR
function encryptMessage(message, key) {
  const iv = randomBytes(16);
  const cipher = crypto.createCipheriv('aes-256-ctr', Buffer.from(key, 'hex'), iv);
  const encrypted = Buffer.concat([cipher.update(JSON.stringify(message), 'utf8'), cipher.final()]); 
  return iv.toString('hex') + '|' + encrypted.toString('hex');
}

// Function to send a batch of messages
function sendMessages() {
  const batchSize = getRandomInt(49, 499);
  const messages = [];

  for (let i = 0; i < batchSize; i++) {
    const message = createRandomMessage();
    const encryptedMessage = encryptMessage(message, process.env.ENCRYPTIOIN_KEY);
    messages.push(encryptedMessage);
  }

  const messageStream = messages.join('-');
  console.log(messageStream);
  emitter.emit('dataStream', messageStream);
}

// Start sending messages every 10 seconds
setInterval(sendMessages, 10000);


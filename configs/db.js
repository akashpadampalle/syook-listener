const mongoose = require('mongoose');

const url = process.env.DB_URL;
// process.env.DB_URL;

mongoose.connect(url, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
});

const db = mongoose.connection;

db.on('error', (error) => {
    console.error(error);
});


db.once('open', () => {
    console.log(`db connected`);
})


module.exports = db;


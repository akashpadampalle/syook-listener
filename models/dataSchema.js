const mongoose = require('mongoose')

const dataSchema = new mongoose.Schema({
    name: String,
    origin: String,
    destination: String,
    secret_key: String,
    timestamp: Date,
  });
  
  const DataModel = mongoose.model('Data', dataSchema);


  module.exports = DataModel;
const characters = require('./characters.json')
const mongoose = require('mongoose')
const Character = mongoose.model('Character');

exports.fillDatabase = () => {
  characters.forEach(function(element) {
    Character.updateOne({name: element.name}, element, {upsert:true})})
}

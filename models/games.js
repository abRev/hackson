const mongoose = require('mongoose');

const Schema = mongoose.Schema;

const GameSchema = new Schema({
    name: String,
    content: Schema.Types.Mixed
})
mongoose.model('Game', GameSchema);
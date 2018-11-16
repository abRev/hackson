const mongoose = require('mongoose');


mongoose.connection.on("error", function (err) {
    console.error(err);
});
mongoose.connect('mongodb://localhost/hackson', { useNewUrlParser: true });

require('./games.js');
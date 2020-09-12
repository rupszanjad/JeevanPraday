var mongoose = require('mongoose');
//mongoose.connect('mongodb+srv://rupali:7887901955@room-b43kg.mongodb.net/blood?retryWrites=true&w=majority', { useNewUrlParser: true }, { useUnifiedTopology: false }, { useCreateIndex: true }, );
mongoose.connect('mongodb+srv://search:search@search-0o89m.mongodb.net/rupali?retryWrites=true&w=majority', { useNewUrlParser: true }, { useUnifiedTopology: false }, { useCreateIndex: true }, );

//mongoose.connect('mongodb+srv://rupali:7887901955@room-b43kg.mongodb.net/test?retryWrites=true&w=majority', { useNewUrlParser: true }, { useUnifiedTopology: false }, { useCreateIndex: true }, );

var conn = mongoose.Collection;
var userSchema = new mongoose.Schema({
    fullname: {
        type: String,
        required: true,
    },

    bloodgroup: {
        type: String,
        required: true,
    },

    country: {
        type: String,
        required: true,
    },

    state: {
        type: String,
        required: true,
    },

    district: {
        type: String,
        required: true,
    },
    city: {
        type: String,
        required: true,
    },
    email: {
        type: String,
        required: true,
        index: {
            unique: true,
        },
    },

    mobileno: {
        type: String,
        required: true,
    },

    password: {
        type: String,
        required: true,
        index: {
            unique: true,
        },
    },

    date: {
        type: Date,
        default: Date.now
    }
});
var userModel = mongoose.model('donor', userSchema);
module.exports = userModel;
var mongoose = require('mongoose');
//mongoose.connect('mongodb+srv://rupali:7887901955@room-b43kg.mongodb.net/blood?retryWrites=true&w=majority', { useNewUrlParser: true }, { useUnifiedTopology: false }, { useCreateIndex: true }, );
mongoose.connect('mongodb+srv://search:search@search-0o89m.mongodb.net/rupali?retryWrites=true&w=majority',{ useNewUrlParser: true} ,{ useUnifiedTopology: false },{useCreateIndex:true}, );

//mongoose.connect('mongodb+srv://rupali:7887901955@room-b43kg.mongodb.net/test?retryWrites=true&w=majority', { useNewUrlParser: true }, { useUnifiedTopology: false }, { useCreateIndex: true }, );

var conn = mongoose.Collection;
var campSchema = new mongoose.Schema({
    organizer: {
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
    venue: {
        type: String,
        required: true,
    },

    date: {
        type: String,
        required: true,
    },

    time: {
        type: String,
        required: true,
    },

    contact: {
        type: Number,
        required: true,
    },

    email: {
        type: String,
        required: true,
    },

    details: {
        type: String,
    },
    status: {
        type: String,
        required: true,
    },
    ddate: {
        type: Date,
        default: Date.now
    }
});
var campModel = mongoose.model('camp', campSchema);
module.exports = campModel;
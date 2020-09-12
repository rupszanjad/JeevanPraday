var mongoose = require('mongoose');
//mongoose.connect('mongodb+srv://rupali:7887901955@room-b43kg.mongodb.net/blood?retryWrites=true&w=majority', { useNewUrlParser: true }, { useUnifiedTopology: false }, { useCreateIndex: true }, );
mongoose.connect('mongodb+srv://search:search@search-0o89m.mongodb.net/rupali?retryWrites=true&w=majority',{ useNewUrlParser: true} ,{ useUnifiedTopology: false },{useCreateIndex:true}, );

//mongoose.connect('mongodb+srv://rupali:7887901955@room-b43kg.mongodb.net/test?retryWrites=true&w=majority', { useNewUrlParser: true }, { useUnifiedTopology: false }, { useCreateIndex: false });


var campregSchema = new mongoose.Schema({

    campemail: {
        type: String,
        required: true,
    },
    campdate: {
        type: String,
        required: true,
    },
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
    useremail: {
        type: String,
        required: true,
    },

    mobileno: {
        type: String,
        required: true,

    },
    lastdonationdate: {
        type: String,
    
    }
});
var campregModel = mongoose.model('campUserRegi', campregSchema);
module.exports = campregModel;
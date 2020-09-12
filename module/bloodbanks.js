var mongoose = require('mongoose');
//mongoose.connect('mongodb+srv://rupali:7887901955@room-b43kg.mongodb.net/blood?retryWrites=true&w=majority', { useNewUrlParser: true }, { useUnifiedTopology: false }, { useCreateIndex: true }, );
mongoose.connect('mongodb+srv://search:search@search-0o89m.mongodb.net/rupali?retryWrites=true&w=majority',{ useNewUrlParser: true} ,{ useUnifiedTopology: false },{useCreateIndex:true}, );

//mongoose.connect('mongodb+srv://rupali:7887901955@room-b43kg.mongodb.net/test?retryWrites=true&w=majority', { useNewUrlParser: true }, { useUnifiedTopology: false }, { useCreateIndex: true }, );
//mongoose.connect('mongodb://vrushali:Yash%40123@bloodbond-shard-00-00-5iah6.mongodb.net:27017,bloodbond-shard-00-01-5iah6.mongodb.net:27017,bloodbond-shard-00-02-5iah6.mongodb.net:27017/Bloodbond?ssl=true&replicaSet=Bloodbond-shard-0&authSource=admin&retryWrites=true&w=majority',{ useNewUrlParser: true} ,{ useUnifiedTopology: false },{useCreateIndex:true}, );

/*const MongoClient = require('mongodb').MongoClient;
const uri = "mongodb+srv://vrushali:Yash%40123@bloodbond-5iah6.mongodb.net/Bloodbond?retryWrites=true&w=majority";
const client = new MongoClient(uri, { useNewUrlParser: true });
client.connect(err => {
  const collection = client.db("Bloodbond").collection("devices");
  // perform actions on the collection object
  client.close();
});*/

var conn = mongoose.Collection;
var bloodbanksSchema = new mongoose.Schema({
    bcordinate: {
        type: String,
        required: true,
    },

    bname: {
        type: String,
        required: true,
    },

    bdist: {
        type: String,
        required: true,
    },

    bcity: {
        type: String,
        required: true,
    },

    bcontact: {
        type: String,
        required: true,
    },

    bdetails: {
        type: String,
    },
    date: {
        type: Date,
        default: Date.now
    }
});
var bloodbanksModel = mongoose.model('blood_banks', bloodbanksSchema);
module.exports = bloodbanksModel;
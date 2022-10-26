const { MongoClient } = require("mongodb");

// Replace the uri string with your connection string.
const uri = "mongodb://localhost:27017/";
//const uri = "mongodb+srv://bvrignaud:V9UEY3mf9BNCYvGI@cluster0.l6szew2.mongodb.net/"


const options = {
    tls: true,
    auth: {user: 'myuser', password:'mypassword'},
    useNewUrlParser: true,
    useUnifiedTopology: true,
    poolSize: 5,
    maxPoolSize: 5
}

const client = new MongoClient(uri);

module.exports = {
    client
}


const { MongoClient, ServerApiVersion } = require('mongodb');
const uri = "mongodb+srv://ReachTestServer:V4RYk7AnUXGrT8b1@cluster0.fyvos.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0";

// Create a MongoClient with a MongoClientOptions object to set the Stable API version
const client = new MongoClient(uri, {
  serverApi: {
    version: ServerApiVersion.v1,
    strict: true,
    deprecationErrors: true,
  }
});
const app = require('express')();
const PORT = 8000;

app.listen(PORT);
app.get('/helloGuys', (req, res)=>{
    res.status(200).send("chai peelo");
})


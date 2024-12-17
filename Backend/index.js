const { MongoClient, ServerApiVersion } = require('mongodb');
const express = require('express');

const uri = "mongodb+srv://<user>:<password>@cluster0.fyvos.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0";

// Create a MongoClient with a MongoClientOptions object to set the Stable API version
const client = new MongoClient(uri, {
  serverApi: {
    version: ServerApiVersion.v1,
    strict: true,
    deprecationErrors: true,
  },
  // Add these options to help with connection issues
  connectTimeoutMS: 10000,
  socketTimeoutMS: 45000,
  serverSelectionTimeoutMS: 10000
});

const app = express();
const PORT = 8000;

async function startServer() {
  try {
    // Connect to the database
    await client.connect();
    console.log('Connected to MongoDB');

    // Define routes after successful connection
    app.get('/helloGuys', (req, res) => {
      res.status(200).send("chai peelo");
    });
    
    app.get('/initialiseListings', async (req, res) => {
        await client.db('ReachDB').collection('Listings').insertMany([
          {
            name: 'Bangalore Cafe',
            type: 'restaurant',
            tags: 'family, noUno, unoGamblingGame'
          },
          {
            name: 'Koshy\'s',
            type: 'restaurant',
            tags: 'oldPeople, niceFood'
          },
          {
            name: 'Tharavad',
            type: 'restaurant',
            tags: 'family, kerala, arabian'
          },
          {
            name: 'Toit',
            type: 'restaurant',
            tags: 'beer, food, american'
          },
          {
            name: 'Sapna',
            type: 'grocery',
            tags: 'fruits, vegetables,kerala'
          },
          {
            name: 'Meridien Stays Girls PG',
            type: 'pg',
            tags: 'girls, nofirstfloor, nosmoking, maybe3ambreakins'
          },
          {
            name: 'Sapna Magic Oven',
            type: 'grocery',
            tags: 'bakery, Puff Patisserie, smoodh',
          },
          {
            name: 'Sherlock',
            type: 'pg',
            tags: 'boys, yesfirstfloor, nosmoking, maybe3ambreakins'
          },
          {
            name: 'Mayas Beauty Parlour',
            type: 'salon',
            tags: 'closetotemple, loudnoises, cute, opensometimes, closedothertimes'
          },
          {
            name: 'Yakesh',
            type: 'laundry',
            tags: 'useless, rich, smoking, dumbass, rat, mouse, nikhilbehaviourhonestly'
          }
        ])
        res.status(200);
    })
    app.get('/Restaurants', async (req, res) => {
        try{
            const rests = await client.db("ReachDB").collection('Listings').find({type: 'Restaurant'});
        } catch (error) {
            console.error('Error retrieving restaurants: ', error);
            res.status(500).json({error: 'Failed to retrieve restaurants'})
        }

    })
    app.get('/addUser', async (req, res) => {
      try {
        const result = await client.db("ReachDB").collection('Users').insertOne({
          item: 'canvas',
          qty: 100,
          tags: ['cotton'],
          size: { h: 28, w: 35.5, uom: 'cm' }
        });
        res.status(200).json({
          message: 'User added successfully',
          insertedId: result.insertedId
        });
      } catch (error) {
        console.error('Error inserting user:', error);
        res.status(500).json({ error: 'Failed to add user' });
      }
    });

    // Start the server
    app.listen(PORT, () => {
      console.log(`Server running on port ${PORT}`);
    });

    //User Functions
    app.post('/Register', async (req, res) => {
       try {
            await client.db('ReachDB').insertOne(req);
            res.status(200).send("Registration Successfull!");
        } catch {
            console.error('Error registering user: ', error);
            res.status(500).json({error: 'Failed to register'})
        }
    })
    app.get('/Login', async (req, res) => {
        try {

        } catch {
            console.error('Login Failed')
        }
    })
    
    //Listing Functions
    

    //Review Functions


    //Bookmark Function


  } catch (error) {
    console.error('Failed to connect to MongoDB:', error);
    process.exit(1);
  }
}

// Call the function to start the server
startServer();

// Graceful shutdown
process.on('SIGINT', async () => {
  try {
    await client.close();
    console.log('MongoDB connection closed');
    process.exit(0);
  } catch (error) {
    console.error('Error closing MongoDB connection:', error);
    process.exit(1);
  }
});
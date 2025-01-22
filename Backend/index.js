const { MongoClient, ServerApiVersion } = require('mongodb');
const express = require('express');

const uri = "process.env.MONGODB_URI";

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
    
    app.get('/initialiseBookmarks', async (req, res) => {
        await client.db('ReachDB').collection('Bookmarks').insertMany([
          {
            id: '123',
            listings: ['676197c2c8ff98e20e791fa3','676197c2c8ff98e20e791fa4'],
            title: 'food'
          },
          {
            id: '124',
            listings: ['676197c2c8ff98e20e791fa5','676197c2c8ff98e20e791fa6'],
            title: 'yummy'
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
            res.status(200).send("Registration Successful!");
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
    
    //Listing Functions//
    

    //Review Functions//


    //Bookmark Function//
    const bookmarks = {};
    let bookmarkIdCounter = 1;

    app.get('/bookmarks/:id', async(req, res) => {
    try {
      const bookmarksCollection = await client.db('ReachDB').collection('Bookmarks');
      const bookmarks = await bookmarksCollection.find().toArray();

      res.status(200).json(bookmarks);
      const { id } = req.id;
      if (id) {
        const bookmarkId = id;
        const bookmark = bookmarks[bookmarkId];
        if (bookmark) {
          return res.status(200).json({ id: bookmarkId, ...bookmark });
        }
          return res.status(404).json({ error: "Bookmark not found" });
        }
        const allBookmarks = Object.entries(bookmarks).map(([id, data]) => ({ id: parseInt(id, 10), ...data }));
        res.status(200).json(allBookmarks);
    } catch (error) {
        res.status(500).json({ error: "An error occurred while retrieving bookmarks" });
    }
});

    app.post('/bookmarks', async(req, res) => {
      try {
        const { title, url, description = "" } = req.body;
        if (!title || !url) {
          return res.status(400).json({ error: "Invalid data" });
        }
        const bookmarkId = bookmarkIdCounter++;
        bookmarks[bookmarkId] = { title, url, description };

        res.status(201).json({ id: bookmarkId, ...bookmarks[bookmarkId] });
    } catch (error) {
      res.status(500).json({ error: "An error occurred while creating the bookmark" });
    }
});

    app.patch('/bookmarks/:id', async(req, res) => {
      try {
        const bookmarkId = parseInt(req.params.id, 10);
        const bookmark = bookmarks[bookmarkId];
        if (!bookmark) {
          return res.status(404).json({ error: "Bookmark not found" });
        }
        const { title, url, description } = req.body;

        if (title) bookmark.title = title;
        if (url) bookmark.url = url;
        if (description) bookmark.description = description;

        res.status(200).json({ id: bookmarkId, ...bookmark });
    } catch (error) {
        res.status(500).json({ error: "An error occurred while updating the bookmark" });
    }
});

    app.delete('/bookmarks/:id', async(req, res) => {
    try {
        const bookmarkId = parseInt(req.params.id, 10);
        if (bookmarks[bookmarkId]) {
          delete bookmarks[bookmarkId];
          return res.status(200).json({ message: "Bookmark deleted" });
        }
        res.status(404).json({ error: "Bookmark not found" });
    } catch (error) {
        res.status(500).json({ error: "An error occurred while deleting the bookmark" });
    }
});
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
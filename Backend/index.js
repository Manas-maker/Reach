const { MongoClient, ServerApiVersion, ObjectId } = require('mongodb');
const express = require('express');

const uri = "mongodb+srv://<user>:<password>@cluster0.fyvos.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0";

// Create a MongoClient with a MongoClientOptions object to set the Stable API version
const client = new MongoClient(uri, {
  autoSelectFamily: false,
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
  
    
    //Listing Functions
    //add a listing    
    app.post('/newListing', async(req,res)=>{
      try {
        const {name,location,type,desc,rating,tags} = req.body;
        let check = "not found"; //verifyListing(n,loc);
        if (check==="not found"){
          await client.db('ReachDB').collection('Listings').insertOne({
            name: name,
            location: location,
            type : type,
            desc: desc,
            rating: rating,
            tags: tags
          });
          res.status(200).send('Listing Added!');
        } else {
          res.status(400).send('Listing Already Exists!');
        }
        
      } catch (error) {
        console.error('Invalid Listing: ', error);
        res.status(500).json({error: 'Something went wrong!'}); //check
      }
  })

  //delete a listing - verified
  app.delete('/removeListing/:id', async(req,res)=>{
    try{
      let id = req.params['id']
      console.log((id))
      const validID = ObjectId.isValid(id) ? new ObjectId(id):null;
      if (validID){
        const result = await client.db('ReachDB').collection('Listings').deleteOne({"_id":validID}); 
        if (result.deletedCount===1){
          res.status(200).send("Successfully deleted!");
        }else{
          res.status(400).send("Record not Found");
        }
        
      }else{
        res.status(400).send("Invalid ID");
      }
      
      
    } catch(err) {
      console.error('Unable to Delete Listing: ',err);
      res.status(500).json({error: 'Something went wrong!'})
    }
  })


  //view all listings of one category - verified
  app.get('/search/:type',async (req,res)=>{
    try{
      const list = await client.db('ReachDB').collection('Listings').find({type:req.params['type']}).toArray();
      list.length!==0? res.status(200).send(list): res.status(400).send("Not Found");
    } catch (err){
      console.log('Failed to retrieve:',err)
      res.status(500).json({error: 'Something went wrong!'})
    }
  })

  //view one listing
  /*
  app.get('/search/:id',async(req,res)=>{
    try{
      const listing = client.db('ReachDB').collection('Listings').find({"_id":req.params['id']}).toArray();
      listing.length===1?res.status(200).send(listing): res.status(400).send("Not Found")
    } catch {
      console.error('Failed to retrieve: ', error);
      res.status(500).json({error: 'Something went wrong!'});
    }
  })*/

  //search for listing - name, tags, type - 2 mistakes - verified
  app.get('/search',async (req,res)=>{ 
    try{
      let query = req.query.query;
      console.log(query);
      const collection = await client.db("ReachDB").collection("Listings");

      const docs = await collection.aggregate([
       {
        $search: {
          "text": {
          "query": query,
          "path": ["name","tags","type"],
          "fuzzy":{
            "maxEdits":2
          }
          }
        }
      }
    ]).toArray();
    console.log(docs);  
    docs.length!==0?res.status(200).send(docs):res.status(400).send("Not found")
          
   } catch (error) {
      console.error('Failed to retrieve: ', error);
      res.status(500).json({error: 'Something went wrong!'})
    }
  })

  //update listing - verified
  app.patch('/updateListing/:id',async (req,res)=>{
    try{
      let id = req.params['id']
      const validID = ObjectId.isValid(id) ? ObjectId.createFromHexString(id):null;
      console.log(req.body);
      const {name, type, tags} = req.body;
      

      if (validID){
        const result = await client.db('ReachDB').collection('Listings').updateOne(
          {"_id":validID},
          {
            $set: {
              name: name,
              type: type,
              tags: tags
            }
          }
        ); 
        console.log("Updated");
        
      }else{
        res.status(400).send("Invalid ID");
      }
      
    } catch (err){
      console.log('Unable to Update:',err)
      res.status(500).json({error: 'Something went wrong!'})
    }
  })

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
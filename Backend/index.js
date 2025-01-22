const { MongoClient, ServerApiVersion, ObjectId } = require('mongodb');
const express = require('express');

const uri = "process.env.MONGODB_URI";

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
app.use(express.json());
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

    // Start the server
    app.listen(PORT, () => {
      console.log(`Server running on port ${PORT}`);
    });
    
    //Review Functions
    /*
    await client.db('ReachDB').collection('Reviews').insertMany([
          {
            user: 'Marissa M',
            listing: 'Bangalore Cafe',
            header: 'This place sucks',
            body: 'This place is literally the worst',
            rating: 1,
            upvotes: null,
            downvotes: null,
            date: new Date()
          },
          {
            userid: 'Nikhil',
            listing: 'Maachiz',
            header: 'Could it get any better',
            body: 'Cheesy fries cheesy fries cheesy fries',
            rating: 4,
            upvotes: null,
            downvotes: null,
            date: new Date()
          }
        ])
    */
  // Create Reviews Function
  const CreateReview =  async (req, res) => {
    try {
      const { userid, listingid, header, body, rating } = req.body;
      if (!userid || !listingid || !rating) {
        return res.status(400).json({message: 'Fields must be entered!'});
      }

      const rev = {
        userid: userid,
        listingid: listingid,
        header: header,
        body: body,
        rating: rating,
        upvotes: [],
        downvotes: [],
        date: new Date()
      };
          
      await client.db('ReachDB').collection('Reviews').insertOne(rev);
      res.status(200).send("Review Created!");
    } catch (error){
      console.error('Error creating review: ', error);
      res.status(500).json({error: 'Failed to create review, try again later'});
    }
  }
  app.post('/create-review', CreateReview);

  //Get Reviews
  const GetReview = async (req, res) => {
    try {
      let {listingid} = req.params;
      
      const result = await client.db('ReachDB').collection('Reviews').find({listingid: listingid}).toArray();
      console.log(result);
      res.status(200).send(result);
    } catch (error){
      console.error('Error getting reviews: ', error);
      res.status(500).json({error: 'Failed to get reviews, try again later'});
    }
  }
  app.get('/:listingid/reviews', GetReview);

  //Update Review
  const UpdateReview = async (req, res) => {
    try {
      const {revid} = req.params;
      let objectrevId = "";
      const { userid, listingid, header, body, rating } = req.body;

      if (ObjectId.isValid(revid)) {
        objectrevId = ObjectId.createFromHexString(revid);
      } else {
        return res.status(400).json({ error: "Invalid review ID provided" });
      }

      if (!userid || !listingid || !rating) {
        return res.status(400).json({error: 'Fields must be entered!'});
      }

      const newrev = {
        userid: userid,
        listingid: listingid,
        header: header,
        body: body,
        rating: rating,
        upvotes: [], downvotes: [],
        date: new Date()
      };

      const result = await client.db('ReachDB').collection('Reviews').updateOne(
        {_id: objectrevId},
        {$set: newrev}
      );
      console.log(result);
      res.status(200).send(result);
    } catch (error){
      console.error('Error updating review: ', error);
      res.status(500).json({error: 'Failed to update review, try again later'});
    }
  }
  app.patch('/:revid/update-review', UpdateReview);

  //Updating upvotes and downvotes
  const VoteUpdate =  async (req, res) => {
    try {
      const revid = req.params;
      const {userid, votetype} = req.body;
      let query = {};

      let objectrevId = "";
        
      if (ObjectId.isValid(revid)) {
        objectrevId = ObjectId.createFromHexString(revid);
      } else {
        return res.status(400).json({ error: "Invalid review ID provided" });
      }

      const review = await client.db('ReachDB').collection('Reviews').findOne({ _id: objectrevId });
      if (!review) {
          return res.status(404).json({ error: "Review not found" });
      }

      if (votetype === "upvote"){
        if (review.upvotes.includes(userid)){
          query = {$pull: {upvotes: userid}};
        }else{
          query = {$addToSet: { upvotes: userid }, $pull: { downvotes: userid }};
        }
      }else if (votetype === "downvote"){
        if (review.downvotes.includes(userid)){
          query = {$pull: {downvotes: userid}};
        }else{
          query = {$addToSet: { downvotes: userid }, $pull: { upvotes: userid }};
        }
      }
      await client.db('ReachDB').collection('Reviews').updateOne({ _id: objectrevId }, query);
      res.status(200).send("Vote updated!");
      console.log("Received review ID:", revid);
    } catch (error) {
      console.error('Error updating vote: ', error);
      res.status(500).json({error: 'Failed to update vote'});
    }
  }
  app.patch('/:revid/update-votes', VoteUpdate);
  
  //Delete Review
  const DeleteReview = async (req, res) => {
    try {
      const {revid} = req.body;
      let objectrevId = "";

      if (ObjectId.isValid(revid)) {
        objectrevId = ObjectId.createFromHexString(revid);
      } else {
        return res.status(400).json({ error: "Invalid review ID provided" });
      }

      const result = await client.db('ReachDB').collection('Reviews').deleteOne({_id: objectrevId});

      if (result.deletedCount === 0){
        return res.status(404).json({ error: "Review not found" });
      }
      console.log("Review deleted:", result);
      res.status(200).send("Review deleted successfully");

    } catch (error){
      console.error('Error deleting review: ', error);
      res.status(500).json({error: 'Failed to delete review, try again later'});
    }
  }
  app.delete('/delete-review', DeleteReview);

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
const { MongoClient, ServerApiVersion, ObjectId } = require('mongodb');
const express = require('express');
const dotenv = require('dotenv').config("/.env");

console.log(process.env);
const uri = process.env.MONGODB_URI;

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
    
    //Permissions
    const roles = {
      admin: {
        name: 'admin',
        inherits: ['user'],
        permissions: ['manage_users', 'manage_content']
      },
      user: {
        name: 'user',
        inherits: ['guest'],
        permissions: ['create_post', 'delete_own_post']
      },
      guest: {
        name: 'guest',
        permissions: ['read_post']
      }
    }
    //User Functions

    const authenticateToken = async (req, res, next) => {
      try {
        const authHeader = req.headers['authorization']
        const token = authHeader && authHeader.split(' ')[1]
        
        if (!token) {
          return res.status(401).json({ error: 'Token missing' })
        }
    
        const decodedToken = jwt.verify(token, process.env.SECRET)
        req.user = decodedToken
        next()
      } catch (error) {
        return res.status(403).json({ error: 'Invalid token' })
      }
    }
    
    const authorize = (options = {}) => {
      return async (req, res, next) => {
        try {
          // 1. Extract path and method
          const path = req.path
          const method = req.method
          
          // 2. Get route configuration
          const routeConfig = routePermissions[path]
          if (!routeConfig || !routeConfig[method]) {
            return res.status(404).json({ error: 'Route not found' })
          }
    
          // 3. Determine user role
          const userRole = req.user ? (req.user.role || ROLES.USER) : ROLES.GUEST
    
          // 4. Check if role is allowed for this route
          const allowedRoles = routeConfig[method]
          if (!allowedRoles.includes(userRole)) {
            return res.status(403).json({ error: 'Insufficient permissions' })
          }
    
          // 5. Additional ownership checks for user operations
          if (options.checkOwnership && userRole !== ROLES.ADMIN) {
            const resourceUserId = req.params.userId || req.body.userId
            if (resourceUserId && resourceUserId !== req.user.id) {
              return res.status(403).json({ error: 'Not authorized to access this resource' })
            }
          }
    
          // 6. Check specific permissions if required
          if (options.requiredPermissions) {
            const userPermissions = rolePermissions[userRole]
            const hasAllPermissions = options.requiredPermissions.every(
              permission => userPermissions.includes(permission)
            )
            if (!hasAllPermissions) {
              return res.status(403).json({ error: 'Insufficient permissions' })
            }
          }
    
          next()
        } catch (error) {
          console.error('Authorization error:', error)
          res.status(500).json({ error: 'Authorization failed' })
        }
      }
    }

    app.post('/Register', async (req, res) => {
       try {
          const { username, name, email, phoneNo, profilePhoto, password } = req.body
          if (!username || !name || !password) {
            return res.status(400).json({ error: 'Username, name, and password are required' })}
          const saltRounds = 10
          const passwordHash = await bcrypt.hash(password, saltRounds)
        
          const user = {
            username: username,
            name: name,
            passwordHash: passwordHash,
            role: 'user',
            ...(email && { email }),
            ...(phoneNo && { phoneNo }),
            ...(profilePhoto && { profilePhoto })
          }
        
          const savedUser = await client.db("ReachDB").collection('Users').insertOne(user)
        
          res.status(201).json(savedUser)
        } catch (error) {
            console.error('Error registering user: ', error);
            res.status(500).json({error: 'Failed to register'})
        }
    })
    app.post('/Login', async (req, res) => {
        try {
          const { username, password } = req.body

          const user = await client.db("ReachDB").collection('Users').findOne({ username })
          const passwordCorrect = user === null
            ? false
            : await bcrypt.compare(password, user.passwordHash)
        
          if (!(user && passwordCorrect)) {
            return res.status(401).json({
              error: 'invalid username or password'
            })
          }
        
          const userForToken = {
            username: user.username,
            id: user._id,
          }
        
          const token = jwt.sign(userForToken, process.env.SECRET)
        
          res
            .status(200)
            .send({ token, username: user.username, name: user.name })
        } catch (error) {
            console.error('Error logging user in: ', error)
            res.status(500).json({error: 'Failed to login'})
        }
    })

    app.get('/users/:userId', 
      authenticateToken, // First check if token is valid
      authorize({ checkOwnership: true }), // Check authorization
      async (req, res) => {
        try {
          // Fetch requested user
          const targetUserId = req.params.userId
          const targetUser = await client
            .db("ReachDB")
            .collection('Users')
            .findOne({ _id: new ObjectId(targetUserId) })

          if (!targetUser) {
            return res.status(404).json({ error: 'User not found' })
          }

          // Get all permissions for the requesting user's role
          const userRole = req.user ? req.user.role : 'guest'
          const userPermissions = getAllPermissions(userRole)

          // Function to get all permissions including inherited ones
          function getAllPermissions(roleName) {
            const role = roles[roleName]
            if (!role) return []
            
            let permissions = [...role.permissions]
            
            // Add inherited permissions
            if (role.inherits) {
              role.inherits.forEach(inheritedRole => {
                permissions = [...permissions, ...getAllPermissions(inheritedRole)]
              })
            }
            
            return [...new Set(permissions)] // Remove duplicates
          }

          // Determine what data to return based on permissions
          let userData = {}

          // Basic public data (available to all)
          userData = {
            username: targetUser.username,
            name: targetUser.name,
            profilePhoto: targetUser.profilePhoto
          }

          // Additional data for authenticated users
          if (userRole === 'user' || userRole === 'admin') {
            userData = {
              ...userData,
              email: targetUser.email,
              lastActive: targetUser.lastActive,
              joinDate: targetUser.joinDate
            }
          }

          // Full data for admin or self
          if (userRole === 'admin' || (req.user && req.user.id === targetUserId)) {
            const { passwordHash, _id, ...fullData } = targetUser
            userData = {
              ...fullData,
              id: _id
            }
          }

          res.status(200).json(userData)

        } catch (error) {
          console.error('Error fetching user: ', error)
          res.status(500).json({ error: 'Failed to fetch user data' })
        }
    })
    app.delete('/users',
      authenticateToken,
      authorize({ checkOwnership: true, requiredPermissions: ['manage_users'] }),
      async (req, res) => {
      try {
        const userId = req.user.id
    
        const result = await client.db("ReachDB").collection('Users').deleteOne({ _id: new ObjectId(userId) })
    
        if (result.deletedCount === 0) {
          return res.status(404).json({ error: 'User not found' })
        }
    
        res.status(200).json({ message: 'User deleted successfully' })
      } catch (error) {
        console.error('Error deleting user: ', error)
        res.status(500).json({ error: 'Failed to delete user' })
      }
    })

    app.put('/users',
      authenticateToken,
      authorize({ checkOwnership: true }),
       async (req, res) => {
      try {
        const userId = req.user.id
        const { name, email, phoneNo, profilePhoto, currentPassword, newPassword } = req.body
        
        // Find the current user
        const user = await client
          .db("ReachDB")
          .collection('Users')
          .findOne({ _id: new ObjectId(userId) })
    
        if (!user) {
          return res.status(404).json({ error: 'User not found' })
        }
    
        // If password change is requested, verify current password
        let passwordHash = user.passwordHash
        if (currentPassword && newPassword) {
          const passwordCorrect = await bcrypt.compare(currentPassword, user.passwordHash)
          if (!passwordCorrect) {
            return res.status(401).json({ error: 'Current password is incorrect' })
          }
          passwordHash = await bcrypt.hash(newPassword, 10)
        }
    
        // Create update object with only provided fields
        const updateData = {
          ...(name && { name }),
          ...(email && { email }),
          ...(phoneNo && { phoneNo }),
          ...(profilePhoto && { profilePhoto }),
          ...(newPassword && { passwordHash })
        }
    
        // Only update if there are changes
        if (Object.keys(updateData).length === 0) {
          return res.status(400).json({ error: 'No update data provided' })
        }
    
        const result = await client
          .db("ReachDB")
          .collection('Users')
          .updateOne(
            { _id: new ObjectId(userId) },
            { $set: updateData }
          )
    
        if (result.matchedCount === 0) {
          return res.status(404).json({ error: 'User not found' })
        }
    
        res.status(200).json({ message: 'User updated successfully' })
      } catch (error) {
        console.error('Error updating user: ', error)
        res.status(500).json({ error: 'Failed to update user' })
      }
    })
    
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

  //Bookmarks
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
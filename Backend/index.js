const { MongoClient, ServerApiVersion } = require('mongodb');
const { GridFSBucket, ObjectId } = require('mongodb');
const express = require('express');
const multer = require('multer');
const dotenv = require('dotenv').config("/.env");
const jwt = require('jsonwebtoken')
const bcrypt = require('bcrypt')
const cors = require('cors')

const uri = process.env.MONGODB_URI;
const fs = require('fs');
const path = require('path');

// Set up multer for file uploading
const storage = multer.memoryStorage(); // Store files in memory temporarily
const upload = multer({ 
  storage: storage,
  limits: {
    fileSize: 5 * 1024 * 1024, // 5MB limit
  },
  fileFilter: (req, file, cb) => {
    // Accept only image files
    if (file.mimetype.startsWith('image/')) {
      cb(null, true);
    } else {
      cb(new Error('Only image files are allowed!'), false);
    }
  }
});



// Create a MongoClient with a MongoClientOptions object to set the Stable API version
const client = new MongoClient(uri, {
  autoSelectFamily: false,
  serverApi: {
    version: ServerApiVersion.v1,
    strict: false,
    deprecationErrors: true,
  },
  // Add these options to help with connection issues
  connectTimeoutMS: 10000,
  socketTimeoutMS: 45000,
  serverSelectionTimeoutMS: 10000
});
let gfsBucket;


const app = express();
app.use(cors({
  origin: process.env.FRONTEND_URL || "http://localhost:5173", // React Vite frontend
  methods: ["GET", "POST", "PUT", "PATCH","DELETE"],
  credentials: true
}));
app.use(express.json());
const PORT = process.env.PORT || 8000;

app.use(cors({
  origin: "http://localhost:5173", 
  credentials: true
}));

async function startServer() {
  try {
    // Connect to the database
    await client.connect();
    console.log('Connected to MongoDB');
    gfsBucket = new GridFSBucket(client.db("ReachDB"), {
      bucketName: 'profileImages'
    });
    
    console.log('GridFS bucket initialized');

    // Define routes after successful connection
    app.get('/helloGuys', (req, res) => {
      res.status(200).json({message:"chai peelo"});
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
            return res.status(400).json({ error: req })}
          const valid = await client.db("ReachDB").collection('Users').findOne({username})
          console.log(valid)
          if ( valid != null) {
            console.log("user already exists")
            return res.status(204).json("User already exists")
          } else {
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
            const userMongo = await client.db("ReachDB").collection('Users').findOne({username})
            const blankBookmarks = await client.db("ReachDB").collection('Bookmarks').insertOne({
              title: "Saved",
              userid: userMongo._id.toString(),
              listings: []
            })
          
            res.status(201).json(savedUser)
            console.log(savedUser)
          }
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
                .send({ token, username: user.username, name: user.name , id:user._id, phoneNo:user.phoneNo, email: user.email})
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
      async (req, res) => {
      try {
        const { username } = req.body
        const result = await client.db("ReachDB").collection('Users').deleteOne({ username })
    
        if (result.deletedCount === 0) {
          return res.status(404).json({ error: 'User not found' })
        }
    
        res.status(200).json({ message: 'User deleted successfully' })
      } catch (error) {
        console.error('Error deleting user: ', error)
        res.status(500).json({ error: 'Failed to delete user' })
      }
    })

    app.patch('/users',
      authenticateToken,
      upload.single('profileImage'), // 'profileImage' is the name of the file input field
      async (req, res) => {
        try {
          const authHeader = req.headers['authorization'];
          const token = authHeader && authHeader.split(' ')[1];
          const username = req.user.username;
          const { name, email, phoneNo, currentPassword, newPassword } = req.body;
    
          // Find the current user
          const user = await client
            .db("ReachDB")
            .collection('Users')
            .findOne({ username });
    
          if (!user) {
            return res.status(404).json({ error: 'User not found' });
          }
    
          // If password change is requested, verify current password
          let passwordHash = user.passwordHash;
          if (currentPassword && newPassword) {
            const passwordCorrect = await bcrypt.compare(currentPassword, user.passwordHash);
            if (!passwordCorrect) {
              return res.status(401).json({ error: 'Current password is incorrect' });
            }
            passwordHash = await bcrypt.hash(newPassword, 10);
          }
    
          // Create update object with only provided fields
          const updateData = {
            ...(name && { name }),
            ...(email && { email }),
            ...(phoneNo && { phoneNo }),
            ...(newPassword && { passwordHash })
          };
    
          // Handle profile image upload if present
          if (req.file) {
            // If user already has a profile image, delete the old one
            if (user.profileImageId) {
              try {
                await gfsBucket.delete(new ObjectId(user.profileImageId));
              } catch (error) {
                console.error("Error deleting old profile image:", error);
                // Continue with the update even if deletion fails
              }
            }
    
            // Create a unique filename
            const filename = `${username}-${Date.now()}${path.extname(req.file.originalname)}`;
            
            // Create a stream to upload the file
            const uploadStream = gfsBucket.openUploadStream(filename, {
              contentType: req.file.mimetype,
              metadata: {
                username: username,
                uploadDate: new Date()
              }
            });
    
            // Write the file to GridFS
            uploadStream.write(req.file.buffer);
            uploadStream.end();
    
            // Wait for the upload to complete
            await new Promise((resolve, reject) => {
              uploadStream.on('finish', resolve);
              uploadStream.on('error', reject);
            });
    
            // Add the file ID to the update data
            updateData.profileImageId = uploadStream.id.toString();
            updateData.profileImageUrl = `/users/profile-image/${uploadStream.id.toString()}`;
          }
    
          console.log(updateData);
          console.log({ username });
          
          // Only update if there are changes
          if (Object.keys(updateData).length === 0) {
            return res.status(400).json({ error: 'No update data provided' });
          }
          
          const result = await client
            .db("ReachDB")
            .collection('Users')
            .updateOne(
              { username },
              { $set: updateData }
            );
          
          console.log(result);
    
          if (result.matchedCount === 0) {
            return res.status(404).json({ error: 'User not found' });
          }
    
          // Get the updated user to return
          const updatedUser = await client
            .db("ReachDB")
            .collection('Users')
            .findOne({ username });
    
          res.status(200).send({ 
            token, 
            username: updatedUser.username, 
            name: updatedUser.name, 
            id: updatedUser._id, 
            phoneNo: updatedUser.phoneNo, 
            email: updatedUser.email,
            profileImageUrl: updatedUser.profileImageUrl
          });
        } catch (error) {
          console.error('Error updating user: ', error);
          res.status(500).json({ error: 'Failed to update user' });
        }
      }
    );
    //get user's profile photo
    app.get('/users/profile-image/:id', async (req, res) => {
      try {
        const imageId = new ObjectId(req.params.id);
        
        // Check if the file exists
        const files = await gfsBucket.find({ _id: imageId }).toArray();
        if (!files || files.length === 0) {
          return res.status(404).json({ error: 'Image not found' });
        }
    
        const file = files[0];
        res.set('Content-Type', file.contentType);
        
        // Stream the file to the response
        const downloadStream = gfsBucket.openDownloadStream(imageId);
        downloadStream.pipe(res);
      } catch (error) {
        console.error('Error serving profile image:', error);
        res.status(500).json({ error: 'Failed to get profile image' });
      }
    });


    //Listing Functions
    //add a listing   
    
    app.post('/verifyListing',async(req,res)=>{

        try{
          const collection = await client.db("ReachDB").collection("Listings");
          console.log(req.body)
          const n = req.body.name;
          const loc = req.body.coordinates;
    
          const docs = await collection.aggregate([
            {
             $search: {
               "text": {
               "query": n,
               "path": "name",
               "fuzzy":{
                 "maxEdits":2
               }
               }
             }
  
           }
         ]).toArray()
  
          const result = await collection.find({
              location: {
                $near: {
                  $geometry: {
                     type: "Point",
                     coordinates: loc
                  },
                  $maxDistance : 100
              }
            }
          }
          ).toArray()
  
          if (docs.length!=0 && result.length!=0){
            res.status(400).send({result:'Listing Exists!'});
            console.log("listing exists")
          } else {
            res.status(200).send({result:'Listing does not Exists!'});
            console.log("listing does not exist");
          }
  
        } catch (err){
          console.log(err)
        }
        
      }

    );
  
  
    app.post('/newListing', authenticateToken, async(req,res)=>{
      try {
        const {name,location,address,type,hours,tags,phone,images,id} = req.body;
        
        await client.db('ReachDB').collection('Listings').insertOne({
            name: name,
            location: location,
            address:address,
            type : type,
            hours: hours,
            tags: tags,
            phone: phone,
            images:images,
            creator:id,
            rating:0,
            verified:[id]
          });
          res.status(200).send({result:'Listing Added!'});
        
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
      list.length!==0? res.status(200).send(list): res.status(400).send([]);
    } catch (err){
      console.log('Failed to retrieve:',err)
      res.status(500).json({error: 'Something went wrong!'})
    }
  })

  //view one listing
  
  app.get('/listing/:id',async(req,res)=>{
    try{
      const {id} = req.params;
      const validID = ObjectId.isValid(id) ? new ObjectId(id):null;

      const listing = await client.db('ReachDB').collection('Listings').find({"_id":validID}).toArray();
      listing.length===1?res.status(200).send(listing): res.status(404).send([])
    } catch (error){
      console.error('Failed to retrieve: ', error);
      res.status(500).json({error: 'Something went wrong!'});
    }
  })

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
    docs.length!==0?res.status(200).send(docs):res.status(400).send([])
          
   } catch (error) {
      console.error('Failed to retrieve: ', error);
      res.status(500).json({error: 'Something went wrong!'})
    }
  })

  //update listing - verified

  app.patch('/updateListing/:id', async(req,res)=>{
    try{
      let id = req.params['id']
      const validID = ObjectId.isValid(id) ? ObjectId.createFromHexString(id):null;
      console.log(req.body);
      const {name,location,address,hours,tags,phone,images,verified} = req.body;
      

      if (validID){
        const result = await client.db('ReachDB').collection('Listings').updateOne(
          {"_id":validID},
          {
            $set: {
              name:name,
              location:location,
              address:address,
              hours:hours,
              tags:tags,
              phone:phone,
              images:images,
              verified:verified
            }
          }
        ); 
        res.status(200).send({result:"ListingUpdated!"})
        
      }else{
        res.status(400).send("Invalid ID");
      }
      
    } catch (err){
      console.log('Unable to Update:',err)
      res.status(500).json({error: 'Something went wrong!'})
    }
  });

  app.patch('/listing/:id',async (req,res)=>{
    try{
      let id = req.params['id']
      const validID = ObjectId.isValid(id) ? ObjectId.createFromHexString(id):null;
      console.log(req.body);
      const {images} = req.body;
      

      if (validID){
        const result = await client.db('ReachDB').collection('Listings').updateOne(
          {"_id":validID},
          {
            $set: {
              images:images
            }
          }
        ); 
        res.status(200).send({result:"Images Updated!"})
        
      }else{
        res.status(400).send("Invalid ID");
      }
      
    } catch (err){
      console.log('Unable to Update:',err)
      res.status(500).json({error: 'Something went wrong!'})
    }
  })

  app.patch('/updateRating/:id',async (req,res)=>{
    try{
      let id = req.params['id']
      const validID = ObjectId.isValid(id) ? ObjectId.createFromHexString(id):null;
      console.log(req.body);
      const {rating} = req.body;
      

      if (validID){
        const result = await client.db('ReachDB').collection('Listings').updateOne(
          {"_id":validID},
          {
            $set: {
              rating:rating.averageRating
            }
          }
        ); 
        res.status(200).send({result:"Rating Updated!"})
        
      }else{
        res.status(400).send("Invalid ID");
      }
      
    } catch (err){
      console.log('Unable to Update:',err)
      res.status(500).json({error: 'Something went wrong!'})
    }
  })

  //update the verification counter
  app.patch('/updateVerification/:id', async(req,res)=>{
    try{
      let id = req.params['id']
      const validID = ObjectId.isValid(id) ? ObjectId.createFromHexString(id):null;
      console.log(req.body);
      const {verified} = req.body;
      console.log(verified)
      console.log(validID?"true":"false")
      console.log(id)
      console.log(validID)

      if (validID){
        const result = await client.db('ReachDB').collection('Listings').updateOne(
          {"_id":validID},
          {
            $set: {
              verified:verified
            }
          }
        ); 
        res.status(200).send({result:"Verification Updated!"})
        console.log(result);
          
      }else{
          res.status(400).send("Invalid ID");
      }
        
      } catch (err){
        console.log('Unable to Update:',err)
        res.status(500).json({error: 'Something went wrong!'})
      
      }

  });
//Review Functions
  // Create Reviews
  const CreateReview =  async (req, res) => {
    try {
      const { userid, username, header, body, rating, images } = req.body;
      const { listingid } = req.params;
      if (!userid || !username || !listingid || !rating) {
        return res.status(400).json({message: 'Fields must be entered!'});
      }
      const existingRev = await client.db('ReachDB').collection('Reviews').findOne({ listingid, userid });

      if (existingRev) {
        const updatedRev = await client.db('ReachDB').collection('Reviews').updateOne(
            { _id: existingRev._id },
            { $set: { header, body, rating, images: images || [], date: new Date() } }
        );
        console.log("Review Updated:", updatedRev);
        return res.status(200).json({ message: "Review updated successfully!" });
      }

      const rev = {
        username: username,
        userid: userid,
        listingid: listingid,
        header: header,
        body: body,
        rating: rating,
        images: images || [],
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
  app.post('/create-review/:listingid', authenticateToken, CreateReview);

  //Get listingid to create a review for that listing
  app.get('/listings/:listingid', async (req, res) => {
    try {
        const { listingid } = req.params;
        const listing = await client.db('ReachDB').collection('Listings').findOne({ _id: new ObjectId(listingid) });

        if (!listing) {
            return res.status(404).json({ error: "Listing not found" });
        }

        res.json({ listingName: listing.name });
    } catch (error) {
        console.error("Error fetching listing:", error);
        res.status(500).json({ error: "Internal server error" });
    }
  });

  //Check if review for a listing by a particular user already exists
  app.get("/reviews/:listingid/user/:userid", async (req, res) => {
    const { listingid, userid } = req.params;
    console.log(userid, listingid);
    try {
        const review = await client.db('ReachDB').collection('Reviews').findOne({ listingid: listingid, userid: userid });
        if (!review) {
            return res.status(404).json({ message: "Review not found" });
        }
        res.json(review);
    } catch (error) {
        console.error("Error fetching review:", error);
        res.status(500).json({ message: "Internal Server Error" });
    }
  });

  //Get Reviews
  const GetReview = async (req, res) => {
    try {
      let {listingid} = req.params;
      let objectlisId = '';

      if (ObjectId.isValid(listingid)) {
        objectlisId = ObjectId.createFromHexString(listingid);
      } else {
        return res.status(400).json({ error: "Invalid review ID provided" });
      }

      const listing = await client.db('ReachDB').collection('Listings').findOne({ _id: objectlisId });
      if (!listing) {
        return res.status(404).json({ error: "Listing not found" });
      }

      const reviews  = await client.db('ReachDB').collection('Reviews').find({listingid: listingid}).toArray();
      console.log('Fetched Reviews:', reviews);

      res.status(200).json({
        listingName: listing.name,
        listingAddress: listing.address,
        reviews: reviews,
      });

    } catch (error){
      console.error('Error getting reviews: ', error);
      res.status(500).json({error: 'Failed to get reviews, try again later'});
    }
  }
  app.get('/reviews/:listingid', GetReview);

  //Update Review
  const UpdateReview = async (req, res) => {
    try {
      const {revid} = req.params;
      let objectrevId = "";
      const { userid, username, listingid, header, body, rating, images } = req.body;

      if (ObjectId.isValid(revid)) {
        objectrevId = ObjectId.createFromHexString(revid);
      } else {
        return res.status(400).json({ error: "Invalid review ID provided" });
      }

      if (!userid || !username || !listingid || !rating) {
        return res.status(400).json({error: 'Fields must be entered!'});
      }

      const newrev = {
        userid: userid,
        username: username,
        listingid: listingid,
        header: header,
        body: body,
        rating: rating,
        images: images || [],
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
  app.patch('/update-review/:revid', authenticateToken, UpdateReview);

  //Updating upvotes and downvotes
  const VoteUpdate =  async (req, res) => {
    try {
      const { revid } = req.params;

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
      const updatedReview = await client.db('ReachDB').collection('Reviews').findOne({ _id: objectrevId });
      res.status(200).json(updatedReview);
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
      const {revid} = req.params;
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
      return res.status(200).send("Review deleted successfully");

    } catch (error){
      console.error('Error deleting review: ', error);
      return res.status(500).json({error: 'Failed to delete review, try again later'});
    }
  }

  app.delete('/delete-review/:revid', DeleteReview);

  //Bookmark Functions 
 app.get('/:id/bookmarks', async (req, res) => {
  try {
      const { id } = req.params;
      const bookmarksCollection = await client.db('ReachDB').collection('Bookmarks');
      const allBookmarks = await bookmarksCollection.find({userid:id}).toArray();
      allBookmarks.length!==0? res.status(200).send(allBookmarks): res.status(400).send({result:"Not Found"});
  } catch (error) {
      console.error("Error fetching bookmarks:", error);
      res.status(500).json({ error: "An error occurred while retrieving bookmarks" });
  }
});

app.get('/bookmarks/:id', async (req, res) => {
try {
    const { id } = req.params;

    if (!ObjectId.isValid(id)) {
        return res.status(400).json({ error: "Invalid Bookmark ID" });
    }
    const validID = new ObjectId(id);

    const bookmark = await client
        .db('ReachDB')
        .collection('Bookmarks')
        .findOne({ _id: validID });

    console.log(bookmark)

    if (!bookmark) {
        return res.status(404).json({ error: "Bookmark not found" });
    }

    const bookmarkTitle = bookmark.title;
    const listingIds = bookmark.listings
  .filter(id => ObjectId.isValid(id) || typeof id === 'object')
  .map(id => {
  if (typeof id === 'string') {
    return new ObjectId(id);
  } else {
    return id; 
  }
  });
    console.log(listingIds);
    if (listingIds.length === 0) {
        return res.json({ listings: [] });
    }

    const listings = await client
        .db('ReachDB')
        .collection('Listings')
        .find({ _id: { $in: listingIds } })
        .toArray();
    res.send({title:bookmarkTitle, listings});
    console.log({title:bookmarkTitle, listings})

} catch (error) {
    console.error("Error fetching listings:", error);
    res.status(500).json({ error: "Internal Server Error" });
}
});

app.post('/bookmarks', async (req, res) => {
try {
  const { userid, title, listings } = req.body;

  const bookmarksCollection = client.db('ReachDB').collection('Bookmarks');
  const existingBookmark = await bookmarksCollection.findOne({ userid, title });
  if (existingBookmark) {
      return res.status(400).json({ error: "Collection already exists!" });
  }

  const newBookmark = await bookmarksCollection.insertOne({ userid, title, listings });
  const createdBookmark = await bookmarksCollection.findOne({ _id: newBookmark.insertedId })

  res.status(201).json(createdBookmark);
} catch (error) {
  console.error("Error creating bookmark:", error);
  res.status(500).json({ error: "An error occurred while creating the bookmark" });
}
});

app.patch('/bookmarks/:id', async (req, res) => {
try {
  const { id } = req.params;
  const bookmarksCollection = await client.db('ReachDB').collection('Bookmarks');
  const validID = ObjectId.isValid(id) ? new ObjectId(id) : null;
  const { title, listings} = req.body;

  const updatedBookmark = await bookmarksCollection.findOneAndUpdate(
      { "_id": validID },
      { $set: { title, listings } },
      { returnDocument: 'after' }
  );
  console.log(updatedBookmark)

  res.status(200).json(updatedBookmark.value);
} catch (error) {
  console.error("Error updating bookmark:", error);
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

//Miscellaneous Functions

//To calculate rating of a listing
const CalcRating = async (req, res) => {
  try {
    let {listingid} = req.body;
    let objectlisId = '';

    if (ObjectId.isValid(listingid)) {
      objectlisId = ObjectId.createFromHexString(listingid);
    } else {
      return res.status(400).json({ error: "Invalid listing ID provided" });
    }

    const listing = await client.db('ReachDB').collection('Listings').findOne({ _id: objectlisId });
    if (!listing) {
      return res.status(404).json({ error: "Listing not found" });
    }

    const reviews  = await client.db('ReachDB').collection('Reviews').find({listingid: listingid}).toArray();
    console.log('Fetched Reviews:', reviews);

    const revCount = reviews.length;
    const totRat = reviews.reduce((sum, review) => sum + (review.rating), 0);
    const rating = revCount > 0 ? parseFloat((totRat / revCount).toFixed(1)) : 0;

    const result = await client.db('ReachDB').collection('Listings').updateOne(
      { _id: objectlisId },
      { $set: { revCount, rating } }
    );

    res.status(200).json(result);

  } catch (error){
    console.error('Error calculating rating: ', error);
    res.status(500).json({error: 'Failed to calculate rating'});
  }
}
app.patch('/ratings', CalcRating);

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
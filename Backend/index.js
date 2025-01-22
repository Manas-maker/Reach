const { MongoClient, ServerApiVersion, ObjectId } = require('mongodb');
const express = require('express');
require('dotenv').config();

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
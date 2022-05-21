const express = require('express');
const cors = require('cors');
const {MongoClient} = require('mongodb');
const ObjectId = require('mongodb').ObjectId;
require('dotenv').config();

const app = express();
app.use(cors());
app.use(express.json());
const port = process.env.PORT || 5000;

const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASSWORD}@cluster0.uth2f.mongodb.net/pomato-restaurant?retryWrites=true&w=majority`;

const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true });

client.connect((err) => {
	const database = client.db('pomato-restaurant');
	const foodsCollection = database.collection('foods');
	const usersCollection = database.collection('users');
	const orderCollection = database.collection('orders');
	const featuresCollection = database.collection('features');

	console.log('Pomato Restaurant DataBase Connected');
    /********************************
             All Routes
*********************************/
    app.get('/' , (req, res) => {
        res.send("Welcome to Pomato Restaurant Backend Server");
    })

    app.get('/foods' , (req, res) => {
        foodsCollection.find().toArray((rej,documents) => {
            if(rej){
                res.status(500).send("Filed to Fetch Data ")
            }else{
                res.send(documents);
            }
        })
})

app.get('/food/:id', (req,res) => {
    const foodId = Number(req.params.id)
        foodsCollection.find({id:foodId}).toArray((err, documents) => {
            if(err){
                console.log(err);
            }else{
                res.send(documents[0]);
            }
        })
})

app.get('/allorders' , (req, res) => {
    orderCollection.find().toArray((rej,documents) => {
        if(rej){
            res.status(500).send("Filed to Fetch Data ")
        }else{
            res.send(documents);
        }
    })
})


app.get('/features' , (req,res) => {
    featuresCollection.find().toArray((rej,documents) => {
        if(rej){
            res.status(500).send("Failed to fetch data");
        }else{
            res.send(documents)
        }
    }) 

})

//get admin
app.get('/users/:email', async (req, res) => {
	const email = req.params.email;
	const query = { email: email };
	const user = await usersCollection.findOne(query);
	let isAdmin = false;
	if (user?.role === 'admin') {
			isAdmin = true;
	}
	res.json({ admin: isAdmin });
})

// Post routes
app.post('/submitorder' , (req,res) => {
    const data = req.body;
        orderCollection.insertOne(data , (rej, result) =>  {
            if(rej){
                res.status(500).send("Filed to inset")
            }else{
                res.send(result.ops[0])
            }
        })
})

//user --
app.post('/users', async (req, res) => {
    const user = req.body;
    const result = await usersCollection.insertOne(user);
    res.json(result);
});

//admin-----
app.put('/users/admin', async (req, res) => {
    const user = req.body;
                    const filter = { email: user.email };
                    const updateDoc = { $set: { role: 'admin' } };
                    const result = await usersCollection.updateOne(filter, updateDoc);
                    res.json(result);				
})
//update status
app.patch('/orders/update/:id', async (req, res) => {
    orderCollection.updateOne({_id: ObjectId(req.params.id)},
    {
      $set: {status: req.body.status}
    }
    )
    .then(result=>{
      res.send(result.modifiedCount > 0);
    })				
})

app.put('/users', async (req, res) => {
	const user = req.body;
	const filter = { email: user.email };
	const options = { upsert: true };
	const updateDoc = { $set: user };
	const result = await usersCollection.updateOne(filter, updateDoc, options);
	res.json(result);
});

// Bellows are dummy post method used just one time
app.post('/addfood' , (req,res) => {
    const data = req.body;
    console.log(data);
        foodsCollection.insert(data , (rej, result) =>  {
            if(rej){
                res.status(500).send("Filed to insert")
            }else{
                res.send(result.ops)
            }
        })
})
app.post('/addfeatures' , (req,res) => {
    const data = req.body;
        featuresCollection.insert(data , (rej, result) =>  {
            if(rej){
                res.status(500).send("Filed to inset")
            }else{
                res.send(result.ops)
            }
        })
})


});

app.listen(port, err => {
    err ? console.log(err) : console.log("Listing for port :" , port);
})











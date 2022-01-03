const express = require('express');
const app = express();
const port = process.env.PORT || 3030;

require('dotenv').config();



const cors = require('cors');
app.use(cors());
app.use(express.json());

const { MongoClient } = require('mongodb');
const ObjectId = require('mongodb').ObjectId;

const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.p55ig.mongodb.net/myFirstDatabase?retryWrites=true&w=majority`;
const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true });

async function run() {
    try {
        await client.connect();
        const database = client.db('ClockFox');

        const productsCollection = database.collection('products');
        const ordersCollection = database.collection('orders');
        const reviewsCollection = database.collection('reviews');
        const usersCollection = database.collection('users');

         // post data from ui to db
         app.post('/products', async (req, res) => {
            const data = req.body;
            const result = await productsCollection.insertOne(data);
            res.json(result);
        })

        // get data from db to ui
        app.get('/products', async (req, res) => {
            const data = productsCollection.find({});
            const result = await data.toArray();
            res.json(result);
        })

        // get single product from db to ui
        app.get('/products/:id', async (req, res) => {
            const id = req.params.id;
            const query = { _id: ObjectId(id) };
            const watch = await productsCollection.findOne(query);
            res.json(watch);
        })

        // Update Product Data
    app.put('/products/:id', async(req,res) =>{
        const updateProduct = req.body;
        const id = req.params.id;
        const query = { _id: ObjectId(id) };
        const option = { upsert: true };
        const updateDoc = {$set: {updateProduct}};
        const result = await productsCollection.updateOne(query,updateDoc, option);
        res.json(result);
      })

        

        // delete single product from ui
        app.delete('/products/:id', async (req, res) => {
            const id = req.params.id;
            const query = { _id: ObjectId(id) };
            const remove = await productsCollection.deleteOne(query);
            res.json(remove);
        })

        // ------------------ratings section----------------------
        // post ratings from ui to db
        app.post('/reviews', async (req, res) => {
            const data = req.body;
            const ratings = await reviewsCollection.insertOne(data);
            res.json(ratings);
        })

        // get/load rating from db to ui
        app.get('/reviews', async (req, res) => {
            const data = reviewsCollection.find({});
            const ratings = await data.toArray();
            res.send(ratings);
        })

        // get single rating from db to ui
        app.get('/reviews/:id', async (req, res) => {
            const id = req.params.id;
            const query = { _id: ObjectId(id) };
            const rating = await reviewsCollection.findOne(query);
            res.json(rating);
        })

        // delete single rating from db and ui
        app.delete('/reviews/:id', async (req, res) => {
            const id = req.params.id;
            const query = { _id: ObjectId(id) };
            const remove = await reviewsCollection.deleteOne(query);
            res.send(remove);
        })

        // ------------ order section -------------
        // post order from ui to db
        app.post('/orders', async(req, res) => {
            const data = req.body;
            const order = await ordersCollection.insertOne(data);
            res.json(order);
        })

        // get / load orders from db to ui
        app.get('/orders', async (req, res) => {
            const data = req.body;
            const orders = ordersCollection.find({});
            const result = await orders.toArray();
            res.json(result);
        })

        // get a single products from db
        app.get('/orders/:id', async (req, res) => {
            const id = req.params.id;
            const query = { _id: ObjectId(id) };
            const order = await ordersCollection.findOne(query);
            res.json(order);
        })

        // get order by email filter
        app.get('/orders/:email', async (req, res) => {
            const email = req.params.email;
            const cursor = ordersCollection.find({});
            const orders = await cursor.toArray();
            const customerOrder = orders.filter(order => order.email === email);
            res.json(customerOrder);
        })

        // update booking status
        app.put('/orders/:id', async (req, res) => {
            const id = req.params.id;
            const orderstatus = req.body.status;
            const filter = { _id: ObjectId(id) };
            const updateOrder = { $set: { status: orderstatus } };
            const options = { upsert: true };
            const result = await ordersCollection.updateOne(filter, updateOrder, options);
            res.json(result);
        });


        // delete single product from ui and db
        app.delete('/orders/:id', async (req, res) => {
            const id = req.params.id;
            const query = { _id: ObjectId(id) };
            const remove = await ordersCollection.deleteOne(query);
            res.json(remove);
        })

        // ---------------user section ----------
        // post user from ui to db
        app.post('/users', async (req, res) => {
            const user = req.body;
            const result = await usersCollection.insertOne(user);
            res.json(result);
        })

        // upsert user
        app.put('/users', async (req, res) => {
            const user = req.body;
            const filter = { email: user.email };
            const option = { upsert: true };
            const updateUser = { $set: user };
            const result = await usersCollection.updateOne(filter, updateUser, option);
            res.json(result);
        })

        // make admin
        app.put('/users/admin', async (req, res) => {
            const user = req.body;
            const filter = { email: user.email };
            const makeAdmin = { $set: { role: 'admin' } };
            const result = await usersCollection.updateOne(filter, makeAdmin);
            res.json(result);
        })
// -------------------
        // get oll users
        app.get('/users', async (req, res) => {
            const users = usersCollection.find({});
            const result = await users.toArray();
            res.json(result);
        })

        // admin filter from db to ui
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

    }
    finally {
        // await client.close();
    }
}
run().catch(console.dir)

app.get('/', (req, res) => {
    res.send('ClockFox Server is running.');
})
app.listen(port, () => {
    console.log('Server running at:', port);
})
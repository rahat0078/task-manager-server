require('dotenv').config()
const express = require('express');
const app = express();
const cors = require("cors");
const port = process.env.PORT || 5000;
const { MongoClient, ServerApiVersion, ObjectId } = require('mongodb');


// middleware
app.use(cors())
app.use(express.json())





const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASSWORD}@cluster0.2trpp.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0`;

// Create a MongoClient with a MongoClientOptions object to set the Stable API version
const client = new MongoClient(uri, {
    serverApi: {
        version: ServerApiVersion.v1,
        strict: true,
        deprecationErrors: true,
    }
});

async function run() {
    try {
        // Connect the client to the server	(optional starting in v4.7)
        await client.connect();

        // database collection 
        const userCollection = client.db("Task_Manager").collection("users");
        const taskCollection = client.db("Task_Manager").collection("tasks");

        // users api
        app.post('/user', async (req, res) => {
            const user = req.body;
            const query = { email: user.email }
            const existUser = await userCollection.findOne(query);
            if (existUser) {
                return res.send({ message: 'User already exist in db' })
            } else {
                const result = await userCollection.insertOne(user);
                res.send(result)
            }
        })


        // tasks apis 
        app.post("/tasks", async (req, res) => {
            const newData = req.body;
            const result = await taskCollection.insertOne(newData)
            res.send({ message: "success", data: result })
        })

        app.get("/task/:email", async (req, res) => {
            const email = req.params.email;
            const filter = { email: email };
            const result = await taskCollection.find(filter).toArray();
            res.send(result)
        })

        app.delete("/task/:id", async(req, res) => {
            const id = req.params.id ;
            const filter = {_id: new ObjectId(id)};
            const result= await taskCollection.deleteOne(filter);
            res.send(result)
        })


        app.patch('/task/category/:id', async(req, res) => {
            const id = req.params.id;
            const {droppableId} = req.body
            const filter = {_id: new ObjectId(id)}
            const updateDoc = {
                $set: {
                  category: droppableId
                },
              };
            const result = await taskCollection.updateOne(filter, updateDoc) 
        })


        // Send a ping to confirm a successful connection
        await client.db("admin").command({ ping: 1 });
        console.log("Pinged your deployment. You successfully connected to MongoDB!");
    } finally {
        // Ensures that the client will close when you finish/error
        // await client.close();
    }
}
run().catch(console.dir);





app.get('/', (req, res) => {
    res.send('task-manager data is running')
})

app.listen(port, () => {
    console.log(`task-manager is running on port  ${port}`);
})
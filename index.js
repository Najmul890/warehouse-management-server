const express = require('express');
const cors = require('cors');
const { MongoClient, ServerApiVersion, ObjectId } = require('mongodb');
require('dotenv').config();
const port= process.env.PORT || 5000;

const app= express();
 
//middleware
app.use(cors());
app.use(express.json());




const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASSWORD}@cluster0.pukwa.mongodb.net/myFirstDatabase?retryWrites=true&w=majority`;
const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true, serverApi: ServerApiVersion.v1 });


async function run() {
    try {
      await client.connect();
      const productCollection = client.db('iceStorage').collection('products');

      //get all products
      app.get('/products', async(req,res)=>{
          const query={};
          const cursor= productCollection.find(query);
          const products= await cursor.toArray();
          res.send(products)
      })

      //get a single product by id
      app.get('/product/:id', async(req, res) =>{
        const id = req.params.id;
        const query={_id: ObjectId(id)};
        const service = await serviceCollection.findOne(query);
        res.send(service);
    });
      
    } finally {}
      
  }
  run().catch(console.dir);


app.get('/', (req,res)=>{
    res.send('ice storage management server is running')
})

app.listen(port, ()=>{
    console.log('Listening to port', port);
})
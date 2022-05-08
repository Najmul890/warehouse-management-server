const express = require('express');
const cors = require('cors');
const jwt = require('jsonwebtoken');
const { MongoClient, ServerApiVersion, ObjectId } = require('mongodb');
require('dotenv').config();
const port = process.env.PORT || 5000;

const app = express();

//middleware
app.use(cors());
app.use(express.json());


//verify token
const verifyJWT=(req,res,next)=>{
    const authHeader=req.headers.authorization;
    if(!authHeader){
        return res.status(401).send({message: 'Unauthorized Access'})
    }
    const token = authHeader.split(' ')[1];
    jwt.verify(token, process.env.ACCESS_TOKEN_SECRET, (err, decoded)=>{
        if(err){
            return res.status(403).send({message: 'Forbidden Access'});
        }
        req.decoded = decoded;
        next();
    })
    
}


const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASSWORD}@cluster0.pukwa.mongodb.net/myFirstDatabase?retryWrites=true&w=majority`;
const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true, serverApi: ServerApiVersion.v1 });


async function run() {
    try {
        await client.connect();
        const productCollection = client.db('iceStorage').collection('products');


        //authentication post api
        app.post('/login', async(req,res)=>{
            const user=req.body;
            const accessToken= jwt.sign(user, process.env.ACCESS_TOKEN_SECRET, {
               expiresIn: '1d' 
            });
            res.send({accessToken});
        })


        //get all products
        app.get('/products', async (req, res) => {
            const query = {};
            const cursor = productCollection.find(query);
            const products = await cursor.toArray();
            res.send(products)
        })

        //get products for a specific user via user email
        app.get('/myProducts',verifyJWT, async (req, res) => {
            const decodedEmail= req.decoded.email;
            const email=req.query.email;
            
            if(email===decodedEmail){
                const query = {userEmail:email};
                const cursor = productCollection.find(query);
                const products = await cursor.toArray();
                res.send(products);
            }else{
                res.status(403).send({message: 'Forbidden Access'});
            }
        })

        //get a single product by id
        app.get('/product/:id', async (req, res) => {
            const id = req.params.id;
            const query = { _id: ObjectId(id) };
            const product = await productCollection.findOne(query);
            res.send(product);
        });

        // create a new product via post method
        app.post('/product', async (req, res) => {
            const newProduct = req.body;
            const result = await productCollection.insertOne(newProduct);
            res.send(result)
        });

        // update quantity for a product
        app.put('/product/:id', async (req, res) => {
            const id = req.params.id;
            const updatedProduct = req.body;
            
            const filter = { _id: ObjectId(id) };
            const options = { upsert: true };
            const updatedDoc = {
                $set: {
                    quantity: updatedProduct.quantity,
                    sold: updatedProduct.sold
                }
            };
            const result = await productCollection.updateOne(filter, updatedDoc, options);
            res.send(result);
        })

        // delete a product via id
        app.delete('/product/:id', async(req, res) =>{
            const id = req.params.id;
            const query = {_id: ObjectId(id)};
            const result = await productCollection.deleteOne(query);
            res.send(result);
        })

    } finally { }

}
run().catch(console.dir);


app.get('/', (req, res) => {
    res.send('ice storage management server is running')
})

app.listen(port, () => {
    console.log('Listening to port', port);
})
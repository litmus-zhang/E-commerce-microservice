const express = require('express')
const app = express()
const PORT = process.env.PORT_ONE || 8080
const mongoose = require('mongoose')
const jwt = require('jsonwebtoken')
const amqp = require('amqplib');
const Product = require('./Product')
const isAuthenticated = require('../isAuthenticated')
app.use(express.json());
var order

var channel,connection;


mongoose.connect('mongodb://localhost/product-service', {
    useNewUrlParser: true,
    useUnifiedTopology: true
}, (err) =>
{  if (err) { console.log(err) }
    console.log(`Product-Service DB is connected`);
 });
async function connect()
{
    const amqpServer = 'amqp://localhost:5672';
    connection = await amqp.connect(amqpServer);
    channel = await connection.createChannel();
    await channel.assertQueue('PRODUCT');
}

connect();

//Create a new product
app.post('/product/create',isAuthenticated, async (req, res) =>
{
    const { name, description, price } = req.body;
    const newProduct = new Product({ name, description, price });
    newProduct.save()   
    return res.json(newProduct)
})


//Buy a Product or list of product
app.post('/product/buy',isAuthenticated,  async (req, res) =>
{
    const { ids } = req.body;
    const products = await Product.find({ _id: { $in: ids } });
    channel.sendToQueue('ORDER', Buffer.from(JSON.stringify({
        products,
        userEmail: req.user.email,
    })));
    channel.consume("PRODUCT", data => 
    { console.log("Consuming Product queue", data.content)
        order = JSON.parse(data.content)
        channel.ack(data)
    })
    return res.json(order)
})


app.listen(PORT, () =>
{
    console.log(`Product-Service listening on port ${PORT}`);
}
)

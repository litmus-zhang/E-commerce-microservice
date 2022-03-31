const express = require('express')
const app = express()
const PORT = process.env.PORT_ONE || 9090
const mongoose = require('mongoose')
const jwt = require('jsonwebtoken')
const amqp = require('amqplib');
const Order = require('./Order')
const isAuthenticated = require('../isAuthenticated')
const { json } = require('express')
app.use(express.json());

var channel,connection;


mongoose.connect('mongodb://localhost/order-service', {
    useNewUrlParser: true,
    useUnifiedTopology: true
}, (err) =>
{  if (err) { console.log(err) }
    console.log(`Order-Service DB is connected`);
 });
async function connect()
{
    const amqpServer = 'amqp://localhost:5672';
    connection = await amqp.connect(amqpServer);
    channel = await connection.createChannel();
    await channel.assertQueue('ORDER');
}

function createOrder(products, userEmail)
{
    let total = 0;
    for (let i = 0; i < products.length; i++)
    {
        total += products[i].price;
    }
    const newOrder = new Order({ products, user: userEmail, totalPrice: total });
    newOrder.save()
    return newOrder
}
connect().then(() =>
{
    channel.consume('ORDER', data =>
    { 
        const { products, userEmail } = JSON.parse(data.content)
        const newOrder = createOrder(products, userEmail)
        console.log("Consuming Order", products, userEmail)
        console.log(`Received order from ${userEmail} to buy ${products.length} products`)
        channel.ack(data)
      channel.sendToQueue('PRODUCT', Buffer.from(JSON.stringify(newOrder)))
    });
})

app.listen(PORT, () =>
{
    console.log(`Order-Service listening on port ${PORT}`);
}
)

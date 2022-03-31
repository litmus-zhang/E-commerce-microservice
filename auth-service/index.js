const express = require('express')
const app = express()
const PORT = process.env.PORT_ONE || 7070
const mongoose = require('mongoose')
const jwt = require('jsonwebtoken')
const User = require('./User')
app.use(express.json());




mongoose.connect('mongodb://localhost/auth-service', {
    useNewUrlParser: true,
    useUnifiedTopology: true
}, (err) =>
{  if (err) { console.log(err) }
    console.log(`Auth-Service DB is connected`);
 });

//Register
app.post('/auth/register', async (req, res) =>
{
    try
    {
        const { name, email, password } = req.body;
        const userExist = await User.findOne({ email });
        if (userExist)
        {
            return res.json({message: 'User already exist'});
        } else
        {
            const newUser = new User({ name, email, password });
            newUser.save();
           return res.json(newUser);
        }
        
    }
    catch (e)
    { 
        res.status(400).send(e)
    }   
})

//Login
app.post('/auth/login',   async (req, res) =>
{
    const { email, password } = req.body
    const user = await User.findOne({ email })
    if (!user)
    {
        return res.status(400).json({ message: 'User does not exist'})
    } else
    {//check if password is correct
        if (user.password !== password)
        {
            return res.json({ message: 'Invalid password' })
        }
        const payload = {
            email,
            name: user.name
        };
        jwt.sign(payload, 'secretkey', (err, token) =>
        {
            if (err) console.log(err);
            else
            { return res.json({ token: token }) }
        })
    }
})




app.listen(PORT, () =>
{
    console.log(`Auth-Service listening on port ${PORT}`);
}
)  

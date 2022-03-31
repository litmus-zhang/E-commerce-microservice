const jwt = require('jsonwebtoken');
module.exports  = async function isAuthenticated(req, res, next) {
    try { //Bearer <token>
        const token = req.headers['authorization'].split(" ")[1];
        jwt.verify(token, 'secretkey', (err, user) =>
        { 
            if(err)
            {
                return res.json({ message: err})
            } else
            {
                req.user = user;
                next();
            }

        });
    } catch (error) {
        res.status(401).json({ message: 'Auth failed' });
    }
}

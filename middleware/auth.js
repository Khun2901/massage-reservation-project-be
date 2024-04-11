const jwt = require('jsonwebtoken');
const User = require('../models/User');

exports.protect = async (req, res, next) => {
    // Define variable for token
    let token;

    // Check if the token exists
    if (req.headers.authorization || req.headers.authorization.startsWith('Bearer')) {
        token = req.headers.authorization.split(' ')[1];
    }
    if (!token || token == 'null') {
        return res.status(401).send({ success: false, message: 'Not authorize to access this route' });
    }

    try {
        // Verify Token
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        req.user = await User.findById(decoded.id);
        next();
    } catch (err) {
        console.log(err.stack);
        return res.status(401).send({ success: false, message: 'Not authorize to access this route' });
    }
};

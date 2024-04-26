const User = require('../models/User');

// Get Token response, create cookies, and send response
const sendTokenResponse = (user, statusCode, res) => {
    // Create Token
    const token = user.getSignedJwtToken();

    const options = {
        expires: new Date(Date.now() + process.env.JWT_COOKIE_EXPIRE * 24 * 60 * 60 * 1000),
        httpOnly: true,
    };

    if (process.env.NODE_ENV == 'production') {
        options.secure = true;
    }

    res.status(statusCode).cookie('token', token, options).json({
        success: true,
        token: token,
    });
};

//@desc     Register user
//@route    POST /api/v1/auth/register
//@access   Public
exports.register = async (req, res, next) => {
    try {
        var { name, email, password, tel, role } = req.body;
        tel = tel.replace(/(\d{3})(\d{3})(\d{4})/, '$1-$2-$3');
        console.log(tel);
        const user = await User.create({ name, email, password, tel, role });
        sendTokenResponse(user, 201, res);
    } catch (err) {
        res.status(400).json({ success: false });
        console.log(err.stack);
    }
};

//@desc     Login user
//@route    POST /api/v1/auth/login
//@access   Public
exports.login = async (req, res, next) => {
    try {
        // Retrieve request body
        const { email, password } = req.body;

        // Check email and password
        if (!email || !password) {
            return res.status(400).send({
                success: false,
                message: 'Please provide an email and password',
            });
        }

        // Match User
        const user = await User.findOne({ email }).select('+password');
        if (!user) {
            return res.status(401).send({
                success: false,
                message: 'Invalid Credentials',
            });
        }

        // Check password matching
        const isMatch = user.matchPassword(password);
        if (!isMatch) {
            return res.status(401).send({
                success: false,
                message: 'Invalid Credentials',
            });
        }

        // Check if the user is banned
        if (user.isBanned) {
            if (user.finalDateBanned < Date.now()) {
                user.isBanned = false;
                await user.save({ isBanned: false });
            } else {
                return res.status(401).send({
                    success: false,
                    message: 'User is banned',
                });
            }
        }

        // User Existed: Return status 200
        sendTokenResponse(user, 200, res);
    } catch (err) {
        return res.status(401).send({
            success: false,
            message: 'Cannot convert email or password to string',
        });
    }
};

//@desc     Get Current logged in user
//@route    GET /api/v1/auth/me
//@access   Private
exports.getMe = async (req, res, next) => {
    console.log(req.user.id);
    const user = await User.findById(req.user.id);
    res.status(200).json({ success: true, data: user });
};

//@desc     Log user out / clear cookie
//@route    GET /api/v1/auth/logout
//@access   Private
exports.logout = async (req, res, next) => {
    res.cookie('token', 'none', {
        expires: new Date(Date.now() + 10 * 1000),
        httpOnly: true,
    });
    res.status(200).send({ success: true, message: 'Successfully Logged out', data: {} });
};

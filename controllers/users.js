const User = require('../models/User');

//@desc     Ban the specified user for the specified duration
//@route    POST /users/:id/ban
//@access   Private
exports.banUser = async (req, res, next) => {
    try {
        const user = await User.findById(req.params.id);

        // Check if no user
        if (!user) {
            return res.status(404).json({ success: false, message: `User with the id of ${req.params.id} not found` });
        }

        // Admin can't ban another admin
        if (user.role === 'admin') {
            return res.status(400).json({ success: false, message: 'Admin cannot be banned' });
        }

        user.set({ isBanned: true, finalDateBanned: req.body.finalDateBanned });
        await user.updateOne(user);

        // Force banned user to log out
        res.clearCookie('token');

        res.status(200).json({ success: true, data: user });
    } catch (err) {
        console.log(err.stack);
        res.status(400).json({ success: false, message: 'Cannot ban User' });
    }
};

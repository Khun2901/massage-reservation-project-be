const Appointment = require('../models/Appointment');
const Massage = require('../models/Massage');

//@desc     Get all appointments
//@route    GET /api/v1/appointments
//@access   Private
exports.getAllAppointments = async (req, res, next) => {
    let query;
    // General users can see only their appointments
    if (req.user.role !== 'admin') {
        query = Appointment.find({ user: req.user.id }).populate({
            path: 'massage',
            select: 'name province tel',
        });
    }
    // Admin can see all appointments
    else {
        if (req.params.massageId) {
            query = Appointment.find({ massage: req.params.massageId }).populate({
                path: 'massage',
                select: 'name province tel',
            });
        } else {
            query = Appointment.find().populate({
                path: 'massage',
                select: 'name province tel',
            });
        }
    }

    try {
        const appointments = await query;
        res.status(200).json({ success: true, count: appointments.length, data: appointments });
    } catch (err) {
        console.log(err.stack);
        res.status(500).json({ success: false, message: 'Cannot find Appointment' });
    }
};

//@desc     Get single appointment
//@route    GET /api/v1/appointments/:id
//@access   Public
exports.getAppointment = async (req, res, next) => {
    try {
        const appointment = await Appointment.findById(req.params.id).populate({
            path: 'massage',
            select: 'name province tel',
        });
        if (!appointment) {
            return res.status(404).json({
                success: false,
                message: `Appointment with the id of ${req.params.id} not found`,
            });
        }
        res.status(200).json({ success: true, data: appointment });
    } catch (err) {
        console.log(err.stack);
        res.status(500).json({ success: false, message: 'Cannot find Appointment' });
    }
};

//@desc     Create new appointment
//@route    POST /api/v1/appointments
//@access   Private
exports.createAppointment = async (req, res, next) => {
    // Add massage to req body
    const massage = await Massage.findById(req.body.massage);
    if (!massage) {
        return res.status(404).json({
            success: false,
            message: `Massage with the id of ${req.params.massageId} not found`,
        });
    }

    // Add user to req body
    req.body.user = req.user.id;
    // Check for existing appointment
    const existingAppt = await Appointment.find({
        user: req.user.id,
    });
    // If the user isn't admin then they can only add 3 appointment
    if (req.user.role !== 'admin' && existingAppt.length >= 3) {
        return res.status(400).json({
            success: false,
            message: 'User can only have 3 appointments',
        });
    }

    try {
        const appointment = await Appointment.create(req.body);
        res.status(201).json({ success: true, data: appointment });
    } catch (err) {
        console.log(err);
        res.status(400).json({ success: false, message: 'Cannot create Appointment' });
    }
};

//@desc     Update appointment
//@route    PUT /api/v1/appointments/:id
//@access   Private
exports.updateAppointment = async (req, res, next) => {
    try {
        let appointment = await Appointment.findById(req.params.id);
        if (!appointment) {
            return res.status(404).json({
                success: false,
                message: `Appointment with the id of ${req.params.id} not found`,
            });
        }

        // Make sure user is the owner of the appointment
        if (appointment.user.toString() !== req.user.id && req.user.role !== 'admin') {
            return res.status(401).json({
                success: false,
                message: `User with the id of ${req.user.id} is not authorized to update this appointment`,
            });
        }

        appointment = await Appointment.findByIdAndUpdate(req.params.id, req.body, {
            new: true,
            runValidators: true,
        });

        res.status(200).json({ success: true, data: appointment });
    } catch (err) {
        console.log(err.stack);
        res.status(400).json({ success: false, message: 'Cannot update Appointment' });
    }
};

//@desc     Delete appointment
//@route    DELETE /api/v1/appointments/:id
//@access   Private
exports.deleteAppointment = async (req, res, next) => {
    try {
        const appointment = await Appointment.findById(req.params.id);
        if (!appointment) {
            return res.status(404).json({
                success: false,
                message: `Appointment with the id of ${req.params.id} not found`,
            });
        }

        // Make sure user is the owner of the appointment
        if (appointment.user.toString() !== req.user.id && req.user.role !== 'admin') {
            return res.status(401).json({
                success: false,
                message: `User with the id of ${req.user.id} is not authorized to delete this appointment`,
            });
        }

        await appointment.deleteOne();
        res.status(200).json({ success: true, data: {} });
    } catch (err) {
        console.log(err.stack);
        res.status(500).json({ success: false, message: 'Cannot delete Appointment' });
    }
};

const Massage = require('../models/Massage');

//@desc     Get all massage parlors
//@route    GET /api/v1/massages
//@access   Public
exports.getMassages = async (req, res) => {
    let query;

    // Copy req.query
    const reqQuery = { ...req.query };

    // Field to exclude
    const removeFields = ['select', 'sort', 'page', 'limit'];

    // Loop over removeFields and delete them from reqQuery
    removeFields.forEach((param) => {
        delete reqQuery[param];
    });

    // Create query string
    let queryStr = JSON.stringify(reqQuery);
    queryStr = queryStr.replace(/\b(gt|gte|lt|lte|in)\b/g, (match) => `$${match}`);

    query = Massage.find(JSON.parse(queryStr)).populate('appointments');

    // Select Fields
    if (req.query.select) {
        const fields = req.query.select.split(',').join(' ');
        query = query.select(fields);
    }

    // Sort
    if (req.query.sort) {
        const sortBy = req.query.sort.split(',').join(' ');
        query = query.sort(sortBy);
    } else {
        query = query.sort('-createdAt');
    }

    // Pagination
    const page = parseInt(req.query.page, 10) || 1;
    const limit = parseInt(req.query.limit, 10) || 25;
    const startIndex = (page - 1) * limit;
    const endIndex = page * limit;

    try {
        const total = await Massage.countDocuments();
        query = query.skip(startIndex).limit(limit);

        // Executing query
        const massages = await query;

        // Pagination result
        const pagination = {};
        if (endIndex < total) {
            pagination.next = {
                page: page + 1,
                limit,
            };
        }
        if (startIndex > 0) {
            pagination.prev = {
                page: page - 1,
                limit,
            };
        }

        res.status(200).json({ success: true, count: massages.length, data: massages });
    } catch (err) {
        res.status(400).json({ success: false });
    }
};

//@desc     Get single massage parlor
//@route    GET /api/v1/massages/:id
//@access   Public

exports.getMassage = async (req, res, next) => {
    try {
        const massage = await Massage.findById(req.params.id);
        if (!massage) {
            return res.status(400).json({ success: false });
        }
        res.status(200).json({ success: true, data: massage });
    } catch (err) {
        res.status(400).json({ success: false });
    }
};

//@desc     Create new massage parlor
//@route    POST /api/v1/massages
//@access   Private
exports.createMassage = async (req, res, next) => {
    const massage = await Massage.create(req.body);
    res.status(201).json({ success: true, data: massage });
};

//@desc     Update massage parlor
//@route    PUT /api/v1/massages/:id
//@access   Private
exports.updateMassage = async (req, res, next) => {
    try {
        const massage = await Massage.findByIdAndUpdate(req.params.id, req.body, {
            new: true,
            runValidators: true,
        });
        if (!massage) {
            return res.status(400).json({ success: false });
        }
        res.status(200).json({ success: true, data: massage });
    } catch (err) {
        res.status(400).json({ success: false });
    }
};

//@desc     Delete massage parlor
//@route    DELETE /api/v1/massages/:id
//@access   Private
exports.deleteMassage = async (req, res, next) => {
    try {
        const massage = await Massage.findById(req.params.id);
        if (!massage) {
            return res.status(404).json({ success: false, message: 'Massage parlor not found' });
        }

        await massage.deleteOne();
        res.status(200).json({ success: true, data: {} });
    } catch (err) {
        res.status(400).json({ success: false });
    }
};

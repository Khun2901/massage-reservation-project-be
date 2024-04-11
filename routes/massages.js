const express = require('express');
const { createMassage, deleteMassage, getMassage, getMassages, updateMassage } = require('../controllers/massages');

// Include other resource routers
// const appointmentRouter = require('./appointments');

const router = express.Router();

// const { protect, authorize } = require('../middleware/auth');

// Re-route into other resource routers
// router.use('/:massageId/appointments/', appointmentRouter);

router.route('/').get(getMassages).post(/*protect, authorize('admin'),*/ createMassage);

router
    .route('/:id')
    .get(getMassage)
    .put(/*protect, authorize('admin'),*/ updateMassage)
    .delete(/*protect, authorize('admin'),*/ deleteMassage);

module.exports = router;

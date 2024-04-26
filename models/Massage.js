const mongoose = require('mongoose');

const MassageSchema = new mongoose.Schema(
    {
        name: {
            type: String,
            required: [true, 'Please add a name'],
            unique: true,
            trim: true,
            maxlength: [50, 'Name can not be more than 50 characters'],
        },
        address: {
            type: String,
            required: [true, 'Please add an address'],
        },
        district: {
            type: String,
            required: [true, 'Please add a district'],
        },
        province: {
            type: String,
            required: [true, 'Please add a province'],
        },
        postalcode: {
            type: String,
            required: [true, 'Please add a postal code'],
            maxlength: [5, 'Postal code can not be more than 5 digits'],
        },
        openclose: {
            type: String,
            required: [true, 'Please add open-close time'],
            // Parse and check
            validate: {
                validator: function (v) {
                    return /^([01]?[0-9]|2[0-3]):[0-5][0-9]-([01]?[0-9]|2[0-3]):[0-5][0-9]$/.test(v);
                },
                message: (props) => `${props.value} is not a valid open-close time!`,
            },
        },
        tel: {
            type: String,
        },
        region: {
            type: String,
            required: [true, 'Please add a region'],
        },
    },
    {
        toJSON: { virtuals: true },
        toObject: { virtuals: true },
    },
);

// Cascade delete appointments when a massage is deleted
MassageSchema.pre('deleteOne', { document: true, query: false }, async function (next) {
    console.log(`Appointments being removed from massage ${this._id}`);
    await this.model('Appointment').deleteMany({ massage: this._id });
    next();
});

// Reverse populate with virtuals
MassageSchema.virtual('appointments', {
    ref: 'Appointment',
    localField: '_id',
    foreignField: 'massage',
    justOne: false,
});

module.exports = mongoose.model('Massage', MassageSchema);

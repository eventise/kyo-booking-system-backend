import { Schema, model } from 'mongoose'

const reservationSchema = new Schema({
    customer_name: {
        type: String,
        required: true,
    },
    customer_email: {
        type: String,
        required: true,
    },
    customer_contact: {
        type: String,
        required: true,
    },
    booking_date: {
        type: Date,
        required: true,
    },
    party_size: {
        type: Number,
        required: true,
    },
    minimum_spend: {
        type: Number,
        required: true,
    },
    notes: {
        type: String,
    },
    table: {
        type: Schema.Types.ObjectId,
        ref: 'Table',
        required: true,
    },
    status: {
        type: String,
        enum: ['Pending', 'Confirmed', 'Cancelled'],
        required: true,
        default: 'Pending',
    },
})

const reservationModel = model('Reservation', reservationSchema)

export default reservationModel

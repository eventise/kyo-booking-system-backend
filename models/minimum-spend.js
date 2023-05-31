import { Schema, model } from 'mongoose'

const minimumSpendSchema = new Schema({
    table: {
        type: Schema.Types.ObjectId,
        ref: 'Table',
        required: true,
    },
    date: {
        type: Date,
        required: true,
    },
    minimum_spend: {
        type: Number,
        required: true,
    },
})

const minimumSpendModel = model('MinimumSpend', minimumSpendSchema)

export default minimumSpendModel

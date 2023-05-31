import { Schema, model } from 'mongoose'

const tableSchema = new Schema({
    name: {
        type: String,
        required: true,
    },
    minimum_spend: {
        type: Number,
        required: true,
    },
    maximum_party_size: {
        type: Number,
        required: true,
    },
    section: {
        type: Schema.Types.ObjectId,
        ref: 'Section',
        required: true,
    },
})

const tableModel = model('Table', tableSchema)

export default tableModel

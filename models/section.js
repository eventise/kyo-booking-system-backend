import { Schema, model } from 'mongoose'

const sectionSchema = new Schema({
    name: {
        type: String,
        required: true,
    },
    shared_minimum_spend: {
        type: Number,
    },
    tables: [
        {
            type: Schema.Types.ObjectId,
            ref: 'Table',
        },
    ],
})

const sectionModel = model('Section', sectionSchema)

export default sectionModel

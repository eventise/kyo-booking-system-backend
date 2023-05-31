import { Schema, model } from 'mongoose'

const userSchema = new Schema({
    email: {
        type: String,
        required: true,
    },
    password: {
        type: String,
        required: true,
    },
    name: {
        type: String,
    },
    contact: {
        type: String,
    },
    role: {
        type: String,
        enum: ['user', 'admin'],
        default: 'user',
    },
    reset_password_token: {
        type: String,
    },
    reset_password_expires: {
        type: Number,
    },
})

const userModel = model('User', userSchema)

export default userModel

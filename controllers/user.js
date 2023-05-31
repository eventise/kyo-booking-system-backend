import { Router } from 'express'
import User from '../models/user.js'

const users = Router()

// Get User
users.get('/', async (req, res) => {
    try {
        const { email } = req.query

        const user = await User.findOne({ email })
        if (!user) {
            return res.status(404).json({ error: 'User not found' })
        }

        res.json({ user })
    } catch (error) {
        console.log(error)
        res.status(500).json({ message: 'Server error' })
    }
})

export default users

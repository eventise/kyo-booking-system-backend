import { Router } from 'express'
import User from '../models/user.js'
import jwt from 'jsonwebtoken'
import bcrypt from 'bcrypt'

const auth = Router()

auth.post('/login', async (req, res) => {
    const { email, password } = req.body

    try {
        const user = await User.findOne({ email })
        if (!user) {
            return res.status(400).json({ error: 'Email not found' })
        }

        const result = await bcrypt.compare(password, user.password)
        if (!result) {
            return res.status(401).json({ error: 'Invalid password ' })
        }

        const token = jwt.sign({ name: user.name, contact: user.contact, email: user.email, role: user.role }, 'kyobookingsystem')

        res.json({ token })
    } catch (error) {
        console.error(error)
        res.status(500).json({ message: 'Server Error' })
    }
})

auth.post('/register', async (req, res) => {
    const { email, password, role } = req.body

    try {
        const existingUser = await User.findOne({ email })
        if (existingUser) {
            return res.status(400).json({ error: 'Email address is already registered' })
        }

        const hash = await bcrypt.hash(password, 10)

        const user = new User({
            email,
            password: hash,
            role: role || 'user',
        })

        await user.save()

        return res.json({ message: 'Registration successful' })
    } catch (error) {
        console.error(error)
        res.status(500).json({ message: 'Server Error' })
    }
})

export default auth

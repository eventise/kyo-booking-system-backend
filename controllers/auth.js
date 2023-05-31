import { Router } from 'express'
import User from '../models/user.js'
import jwt from 'jsonwebtoken'
import bcrypt from 'bcrypt'
import crypto from 'crypto'
import axios from 'axios'

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

auth.post('/sign-up', async (req, res) => {
    const { email, password, role } = req.body

    try {
        const existingUser = await User.findOne({ email })
        if (existingUser) {
            return res.status(400).json({ error: 'Email address is already signed up.' })
        }

        const hash = await bcrypt.hash(password, 10)

        const user = new User({
            email,
            password: hash,
            role: role || 'user',
        })

        await user.save()

        const token = jwt.sign({ name: user.name, contact: user.contact, email: user.email, role: user.role }, 'kyobookingsystem')

        return res.json({ token })
    } catch (error) {
        console.error(error)
        res.status(500).json({ message: 'Server Error' })
    }
})

auth.post('/forgot-password', async (req, res) => {
    const { email } = req.body

    try {
        const user = await User.findOne({ email })
        if (!user) {
            return res.status(404).json({ error: 'User not found' })
        }

        // Generate password reset token
        const token = crypto.randomBytes(20).toString('hex')
        user.reset_password_token = token
        user.reset_password_expires = Date.now() + 3600000 // Expires in 1 hour

        await user.save()

        res.status(200).json({ message: 'Password reset link sent to your email.' })
    } catch (error) {
        console.error(error)
        res.status(500).json({ message: 'Server Error' })
    }
})

export default auth

import 'dotenv/config'
import express from 'express'
import cors from 'cors'
import mongoose from 'mongoose'
import reservationController from './controllers/reservation.js'
import sectionController from './controllers/section.js'
import tableController from './controllers/table.js'
import authController from './controllers/auth.js'

const app = express()
const PORT = 8080
const DATABASE_URL = process.env.DATABASE_URL

mongoose.connect(DATABASE_URL)
const db = mongoose.connection

db.on('error', (error) => {
    console.log(error)
})

db.once('connected', () => {
    console.log('Database connected')
})

app.use(express.json())
app.use(cors())
app.use('/api/reservations', reservationController)
app.use('/api/sections', sectionController)
app.use('/api/tables', tableController)
app.use('/api', authController)

app.listen(PORT, () => {
    console.log(`🚀 Server running on port ${PORT}!`)
})

export default app

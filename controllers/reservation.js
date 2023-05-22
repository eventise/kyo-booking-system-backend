import { Router } from 'express'
import Reservation from '../models/reservation.js'
import Table from '../models/table.js'

const reservations = Router()

// Get Reservations by Date
reservations.get('/', async (req, res) => {
    const { date } = req.body

    try {
        const reservations = await Reservation.find({ booking_date: date, status: { $ne: 'Cancelled' } }).populate({
            path: 'table',
            populate: {
                path: 'section',
                select: 'name',
            },
        })

        res.json({ reservations })
    } catch (err) {
        console.error(err)
        res.status(500).json({ message: 'Server Error' })
    }
})

// Create a Reservation
reservations.post('/', async (req, res) => {
    try {
        const { customerName, customerEmail, customerContact, bookingDate, partySize, tableName } = req.body

        const table = await Table.findOne({ name: tableName })
        if (!table) {
            return res.status(404).json({ error: 'Table not found' })
        }

        if (partySize > table.maximum_party_size) {
            return res.status(400).json({ error: `Only ${table.maximum_party_size} guests are allowed.` })
        }

        const existingReservations = await Reservation.findOne({ table: table._id, booking_date: bookingDate, status: { $in: ['Pending', 'Confirmed'] } })
        if (existingReservations) {
            return res.status(409).json({ error: 'Table already booked for this date ' })
        }

        const reservation = new Reservation({
            customer_name: customerName,
            customer_email: customerEmail,
            customer_contact: customerContact,
            booking_date: bookingDate,
            party_size: partySize,
            table: table._id,
        })

        await reservation.save()

        return res.status(201).json({ message: 'Reservation created', reservation })
    } catch (error) {
        console.error(error)
        res.status(500).json({
            error: 'Server error',
        })
    }
})

// Update Reservation details
reservations.patch('/:id', async (req, res) => {
    try {
        const reservationID = req.params.id
        const { customerName, customerEmail, bookingDate, partySize, tableName } = req.body

        const table = await Table.findOne({ name: tableName })
        if (!table) {
            return res.status(404).json({ error: 'Table not found' })
        }

        const reservation = await Reservation.findOneAndUpdate(
            { _id: reservationID, status: { $ne: 'Cancelled' } },
            {
                customer_name: customerName,
                customer_email: customerEmail,
                booking_date: bookingDate,
                party_size: partySize,
                table: table._id,
            },
            { new: true }
        ).populate('table')

        if (!reservation) {
            return res.status(404).json({ error: 'Reservation not found' })
        }

        await reservation.save()

        res.status(200).json({ message: 'Reservation details updated', reservation })
    } catch (err) {
        console.error(err)
        res.status(500).json({ error: 'Server error' })
    }
})

// Update Reservation status
reservations.patch('/:id/status', async (req, res) => {
    try {
        const reservationID = req.params.id
        const { status } = req.body

        const reservation = await Reservation.findOneAndUpdate(
            { _id: reservationID, status: { $ne: 'Cancelled' } },
            {
                status,
            },
            { new: true }
        )

        if (!reservation) {
            return res.status(404).json({ error: 'Reservation not found' })
        }

        await reservation.save()

        res.status(200).json({ message: 'Reservation status updated', reservation })
    } catch (err) {
        console.error(err)
        res.status(500).json({ error: 'Server error' })
    }
})

export default reservations

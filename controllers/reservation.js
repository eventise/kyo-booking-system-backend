import { Router } from 'express'
import Reservation from '../models/reservation.js'
import Table from '../models/table.js'

const reservations = Router()

// Get Reservations by Date
reservations.get('/', async (req, res) => {
    try {
        const { date } = req.query

        let query = { status: { $ne: 'Cancelled' } }
        if (date) {
            query.booking_date = date
        }

        const reservations = await Reservation.find(query).populate({
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
        const { customerName, customerEmail, customerContact, bookingDate, minimumSpend, partySize, tableName, notes } = req.body

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
            minimum_spend: minimumSpend,
            party_size: partySize,
            table: table._id,
            notes: notes,
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

reservations.delete('/', async (req, res) => {
    try {
        const result = await Reservation.deleteMany({})

        if (result.deletedCount > 0) {
            res.status(200).json({ message: 'All reservations deleted successfully' })
        } else {
            res.status(404).json({ error: 'No reservations found' })
        }
    } catch (err) {
        console.error(err)
        res.status(500).json({ error: 'Server error' })
    }
})

export default reservations

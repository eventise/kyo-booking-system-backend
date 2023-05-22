import { Router } from 'express'
import Table from '../models/table.js'
import Section from '../models/section.js'
import Reservation from '../models/reservation.js'

const tables = Router()

// Get table by name
tables.get('/', async (req, res) => {
    try {
        const { name } = req.body
        const table = await Table.find({ name }).populate({ path: 'section', select: 'name' })

        res.json({ table })
    } catch (error) {
        console.log(error)
        res.status(500).json({ message: 'Server error' })
    }
})

// Get available tables on a specific date
tables.get('/available', async (req, res) => {
    const { date } = req.query

    try {
        const reservations = await Reservation.find({ booking_date: date, status: { $ne: 'Cancelled' } }).populate({
            path: 'table',
            populate: {
                path: 'section',
                select: 'name',
            },
        })

        const reservedTables = reservations.map((r) => r.table.name)

        const availableTables = await Table.find({ name: { $nin: reservedTables } })

        res.status(200).json({ availableTables })
    } catch (error) {
        console.log(error)
        res.status(500).json({ message: 'Server error' })
    }
})

// Create a table
tables.post('/', async (req, res) => {
    try {
        const { name, standardMinimumSpend, maximumPartySize, sectionName } = req.body

        const section = await Section.findOne({ name: sectionName })
        if (!section) {
            return res.status(404).json({ error: 'Section not found' })
        }

        const table = new Table({
            name,
            standard_minimum_spend: standardMinimumSpend,
            maximum_party_size: maximumPartySize,
            section: section._id,
        })

        await table.save()

        section.tables.push(table._id)
        await section.save()

        return res.status(201).json({ message: 'Table created', table })
    } catch (error) {
        console.log(error)
        res.status(500).json({ message: 'Server error' })
    }
})

// Update a table

export default tables

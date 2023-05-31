import { Router } from 'express'
import Table from '../models/table.js'
import Section from '../models/section.js'
import Reservation from '../models/reservation.js'
import MinimumSpend from '../models/minimum-spend.js'

const tables = Router()

// Get Tables
tables.get('/', async (req, res) => {
    try {
        const { name } = req.query

        let query = {}
        if (name) {
            query.name = { $regex: name, $options: 'i' }
        }

        const tables = await Table.find(query).populate({ path: 'section', select: 'name' })

        res.json({ tables })
    } catch (error) {
        console.log(error)
        res.status(500).json({ message: 'Server error' })
    }
})

// Get Available Tables (by Date)
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

        const availableTables = await Table.find({ name: { $nin: reservedTables } }).lean()

        const minimumSpends = await MinimumSpend.find({ date }).lean()

        const tables = availableTables.map((table) => ({ ...table, minimum_spend: minimumSpends.map((spend) => spend.table.toString()).includes(table._id.toString()) ? minimumSpends.find((spend) => spend.table.toString() === table._id.toString()).minimum_spend : table.minimum_spend }))

        res.status(200).json({ availableTables: tables })
    } catch (error) {
        console.log(error)
        res.status(500).json({ message: 'Server error' })
    }
})

// Create a table
tables.post('/', async (req, res) => {
    try {
        const { name, minimumSpend, maximumPartySize, sectionName } = req.body

        const section = await Section.findOne({ name: sectionName })
        if (!section) {
            return res.status(404).json({ error: 'Section not found' })
        }

        const table = new Table({
            name,
            minimum_spend: minimumSpend,
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

// Create Custom Minimum Spend
tables.post('/minimum-spend', async (req, res) => {
    try {
        const { name, date, minimumSpend } = req.body

        const table = await Table.findOne({ name })
        if (!table) {
            return res.status(404).json({ error: 'Table not found' })
        }

        const customMinimumSpend = new MinimumSpend({
            table: table._id,
            minimum_spend: minimumSpend,
            date,
        })

        await customMinimumSpend.save()

        return res.status(201).json({ message: 'Custom minimum spend created', customMinimumSpend })
    } catch (error) {
        console.log(error)
        res.status(500).json({ message: 'Server error' })
    }
})

// Update a table

export default tables

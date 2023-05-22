import { Router } from 'express'
import Section from '../models/section.js'

const sections = Router()

// Get all sections
sections.get('/', async (req, res) => {
    try {
        const sections = await Section.find().populate({ path: 'tables', select: 'name minimum_spend maximum_party_size' })

        res.status(200).json({ sections })
    } catch (error) {
        console.log(error)
        res.status(500).json({ message: 'Server error' })
    }
})

// Get a section
sections.get('/:name', async (req, res) => {
    try {
        const sectionName = req.params.name
        const section = await Section.find({ name: sectionName }).populate({ path: 'tables', select: 'name minimum_spend maximum_party_size' })

        res.status(200).json({ section })
    } catch (error) {
        console.log(error)
        res.status(500).json({ message: 'Server error' })
    }
})

// Create a section
sections.post('/', async (req, res) => {
    try {
        const { name, tables, sharedMinimumSpend } = req.body

        const section = new Section({
            name,
            tables,
            shared_minimum_spend: sharedMinimumSpend,
        })

        await section.save()

        return res.status(201).json({ message: 'Section created', section })
    } catch (error) {
        console.log(error)
        res.status(500).json({ message: 'Server error' })
    }
})

// Update section details

// Update section table list

export default sections

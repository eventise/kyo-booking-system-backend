import { Router } from 'express'
import Section from '../models/section.js'

const sections = Router()

// Get Sections
sections.get('/', async (req, res) => {
    try {
        const { name } = req.query

        let query = {}
        if (name) {
            query.name = name
        }

        const sections = await Section.find(query).populate({ path: 'tables', select: 'name minimum_spend maximum_party_size' })

        res.status(200).json({ sections })
    } catch (error) {
        console.log(error)
        res.status(500).json({ message: 'Server error' })
    }
})

// Create a section
sections.post('/', async (req, res) => {
    try {
        const { name, tables } = req.body

        const section = new Section({
            name,
            tables,
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

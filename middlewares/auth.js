import jwt from 'jsonwebtoken'

export const verifyToken = (req, res, next) => {
    const token = req.headers.authorization

    if (!token) {
        return res.status(401).json({ error: 'Missing authorization header' })
    }

    try {
        const payload = jwt.verify(token, secret)

        req.userID = payload.userID
        req.isAdmin = payload.role === 'admin'

        next()
    } catch (error) {
        return res.status(401).json({ error: 'Invalid or expired token' })
    }
}

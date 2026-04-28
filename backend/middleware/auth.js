const jwt = require('jsonwebtoken');
const JWT_SECRET = process.env.JWT_SECRET || 'sevasetu-super-secret-key-2026';

const auth = (role = 'admin') => {
    return (req, res, next) => {
        const token = req.header('Authorization')?.replace('Bearer ', '');
        if (!token) return res.status(401).json({ error: 'No token, authorization denied' });

        try {
            const decoded = jwt.verify(token, JWT_SECRET);
            if (role && decoded.role !== role) {
                return res.status(403).json({ error: 'Access denied: insufficient permissions' });
            }
            req.admin = decoded; // Contains id and role
            next();
        } catch (err) {
            res.status(401).json({ error: 'Token is not valid' });
        }
    };
};

module.exports = auth;

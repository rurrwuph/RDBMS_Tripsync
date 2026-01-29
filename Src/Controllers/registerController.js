const db = require('../config/db');

const register = async (req, res) => {

    const { type, email, password, name, phone, companyName, licenseNumber } = req.body;

    if (!type || !['customer', 'operator'].includes(type)) {
        return res.status(400).json({ error: 'Invalid registration type. Must be customer or operator.' });
    }

    try {
      
            return res.status(201).json({ message: 'Operator registered successfully via procedure' });
        }catch (err) {
        console.error('Registration Error:', err);

        if (err.code === '23505') {
            return res.status(400).json({ error: 'Email or License Number already exists' });
        }

        return res.status(500).json({ error: 'Internal server error during registration' });
    }
};

module.exports = { register };



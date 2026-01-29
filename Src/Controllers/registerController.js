const db = require('../config/db');
const bcrypt = require('bcrypt');

const register = async (req, res) => {

    const { type, email, password, name, phone, companyName, licenseNumber } = req.body;

    if (!type || !['customer', 'operator'].includes(type)) {
        return res.status(400).json({ error: 'Invalid registration type. Must be customer or operator.' });
    }

    try {
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);

        if (type === 'customer') {
            await db.query(
                'CALL register_customer($1, $2, $3, $4)',
                [name, email, hashedPassword, phone]
            );
            return res.status(201).json({ message: 'Customer registered successfully via procedure' });
        }
        else if (type === 'operator') {
            await db.query(
                'CALL register_operator($1, $2, $3, $4)',
                [companyName, email, hashedPassword, licenseNumber]
            );
            return res.status(201).json({ message: 'Operator registered successfully via procedure' });
        }


    } catch (err) {
        console.error('Registration Error:', err);

        if (err.code === '23505') {
            return res.status(400).json({ error: 'Email or License Number already exists' });
        }

        return res.status(500).json({ error: 'Internal server error during registration' });
    }
};

module.exports = { register };



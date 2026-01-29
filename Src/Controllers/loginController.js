const db = require('../config/db');
const bcrypt = require('bcrypt');

const login = async (req, res) => {

    const { email, password, type } = req.body;

    if (!type || !['customer', 'operator'].includes(type)) {
        return res.status(400).json({ error: 'Please specify a valid login type (customer or operator)' });
    }

    try {
        let sqlQuery;
        let userDataQuery;

        if (type === 'customer') {
            sqlQuery = 'SELECT verify_customer_login($1, $2) AS hash';
            userDataQuery = 'SELECT CustomerID, FullName FROM CUSTOMER WHERE Email = $1';
        }

        else {
            sqlQuery = 'SELECT verify_operator_login($1, $2) AS hash';
            userDataQuery = 'SELECT OperatorID, CompanyName FROM OPERATOR WHERE AdminEmail = $1';
        }

        const result = await db.query(sqlQuery, [email, 'check']);
        const storedHash = result.rows[0].hash;

        if (!storedHash) {
            return res.status(401).json({ error: 'Invalid credentials' });
        }

        //compare pass with the hash
        const isMatch = await bcrypt.compare(password, storedHash);
        if (!isMatch) {
            return res.status(401).json({ error: 'Invalid credentials' });
        }

        //fetch id & role of cust/operator data for JWT
        const userResult = await db.query(userDataQuery, [email]);
        const userRow = userResult.rows[0];

        const userId = type === 'customer' ? userRow.customerid : userRow.operatorid;
        const displayName = type === 'customer' ? userRow.fullname : userRow.companyname;


        res.status(200).json({
            message: 'Login successful',
            token,
            user: {
                id: userId,
                name: displayName,
                email: email,
                role: type
            }
        });

    } catch (err) {
        console.error('Login Error:', err);
        res.status(500).json({ error: 'Internal server error' });
    }
};

module.exports = { login };
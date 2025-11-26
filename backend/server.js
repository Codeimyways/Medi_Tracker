const express = require('express');
const mysql = require('mysql2');
const cors = require('cors');
const bodyParser = require('body-parser');

const app = express();
app.use(cors());
app.use(bodyParser.json());

// DATABASE CONNECTION
// REPLACE 'root' and 'password' with your actual MySQL credentials
const db = mysql.createConnection({
    host: 'localhost',
    user: 'root',      
    password: 'admin@123', 
    database: 'med_tracker'
});

db.connect((err) => {
    if (err) {
        console.error('Error connecting to MySQL:', err);
    } else {
        console.log('Connected to MySQL Database');
    }
});

// --- ROUTES ---

// 1. Get all medications (Core Feature)
app.get('/api/meds', (req, res) => {
    const sql = 'SELECT * FROM medications';
    db.query(sql, (err, results) => {
        if (err) return res.status(500).send(err);
        res.json(results);
    });
});

// 2. Add a new medication (Core Feature)
app.post('/api/meds', (req, res) => {
    const { name, dosage, frequency, total_stock } = req.body;
    const sql = 'INSERT INTO medications (name, dosage, frequency, total_stock) VALUES (?, ?, ?, ?)';
    db.query(sql, [name, dosage, frequency, total_stock], (err, result) => {
        if (err) return res.status(500).send(err);
        res.json({ id: result.insertId, message: 'Medication added' });
    });
});

// 3. Take a dose (Core Feature + Logic)
// This decrements stock and logs the action
app.post('/api/meds/:id/take', (req, res) => {
    const medId = req.params.id;

    // Transaction to ensure both stock update and log happen
    db.beginTransaction(err => {
        if (err) return res.status(500).send(err);

        // Step 1: Decrement Stock
        const updateSql = 'UPDATE medications SET total_stock = total_stock - 1 WHERE id = ? AND total_stock > 0';
        db.query(updateSql, [medId], (err, result) => {
            if (err) {
                return db.rollback(() => res.status(500).send(err));
            }
            if (result.affectedRows === 0) {
                return db.rollback(() => res.status(400).send({ message: 'Stock is empty!' }));
            }

            // Step 2: Create Log Entry
            const logSql = 'INSERT INTO logs (med_id, action_type) VALUES (?, "TAKEN")';
            db.query(logSql, [medId], (err) => {
                if (err) {
                    return db.rollback(() => res.status(500).send(err));
                }

                // Commit transaction
                db.commit(err => {
                    if (err) return db.rollback(() => res.status(500).send(err));
                    res.json({ message: 'Dose taken successfully' });
                });
            });
        });
    });
});

// 4. Refill Logic (Advanced/Extra)
app.post('/api/meds/:id/refill', (req, res) => {
    const medId = req.params.id;
    const { amount } = req.body; // How many pills added
    const sql = 'UPDATE medications SET total_stock = total_stock + ? WHERE id = ?';
    
    db.query(sql, [amount, medId], (err, result) => {
        if (err) return res.status(500).send(err);
        res.json({ message: 'Refill successful' });
    });
});

// Start Server
const PORT = 5000;
app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});
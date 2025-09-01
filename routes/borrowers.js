const express = require('express');
const router = express.Router();
const db = require('../db');
const { body, validationResult } = require('express-validator');

//add a borrower
router.post(
  '/',
  [
    body('name').isString().trim().notEmpty(),
    body('email').isEmail().normalizeEmail()
  ],
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    try {
      const { name, email } = req.body;
      const [result] = await db.query(
        'INSERT INTO borrowers (name, email) VALUES (?, ?)',
        [name, email]
      );
      res.status(201).json({ message: 'Borrower added successfully', borrowerId: result.insertId });
    } catch (err) {
      if (err.code === 'ER_DUP_ENTRY') {
        res.status(400).json({ error: 'A borrower with this email already exists' });
      } else {
        console.error(err);
        res.status(500).json({ error: 'Internal server error' });
      }
    }
  }
);

// select * borrowers
router.get('/', async (req, res) => {
  try {
    const [rows] = await db.query('SELECT * FROM borrowers');
    res.json(rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Internal server error' });
  }
});

//Get borrower by ID
router.get('/:id', async (req, res) => {
  try {
    const [rows] = await db.query('SELECT * FROM borrowers WHERE id = ?', [req.params.id]);
    if (rows.length === 0) return res.status(404).json({ error: 'Borrower not found' });
    res.json(rows[0]);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Internal server error' });
  }
});

//Update borrower
router.put(
  '/:id',
  [
    body('name').optional().isString().trim(),
    body('email').optional().isEmail().normalizeEmail()
  ],
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    try {
      const updates = req.body;
      const fields = Object.keys(updates).map(f => `${f} = ?`).join(', ');
      const values = Object.values(updates);

      if (!fields) return res.status(400).json({ error: 'No fields to update' });

      const [result] = await db.query(
        `UPDATE borrowers SET ${fields} WHERE id = ?`,
        [...values, req.params.id]
      );

      if (result.affectedRows === 0) return res.status(404).json({ error: 'Borrower not found' });
      res.json({ message: 'Borrower updated successfully' });
    } catch (err) {
      if (err.code === 'ER_DUP_ENTRY') {
        res.status(400).json({ error: 'A borrower with this email already exists' });
      } else {
        console.error(err);
        res.status(500).json({ error: 'Internal server error' });
      }
    }
  }
);

//Delete borrower
router.delete('/:id', async (req, res) => {
  try {
    const [result] = await db.query('DELETE FROM borrowers WHERE id = ?', [req.params.id]);
    if (result.affectedRows === 0) return res.status(404).json({ error: 'Borrower not found' });
    res.json({ message: 'Borrower deleted successfully' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Internal server error' });
  }
});

module.exports = router;

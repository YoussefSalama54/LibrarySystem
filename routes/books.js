const express = require('express');
const router = express.Router();
const db = require('../db');
const { body, validationResult } = require('express-validator');

// add new bk
router.post(
  '/',
  [
    body('title').isString().trim().notEmpty(),
    body('author').isString().trim().notEmpty(),
    body('isbn').isString().trim().notEmpty(),
    body('quantity').isInt({ min: 0 }),
    body('shelf_location').optional().isString().trim()
  ],
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      // validation failed
      return res.status(400).json({ errors: errors.array() });
    }

    try {
      const { title, author, isbn, quantity, shelf_location } = req.body;
      const [result] = await db.query(
        'INSERT INTO books (title, author, isbn, quantity, shelf_location) VALUES (?, ?, ?, ?, ?)',
        [title, author, isbn, quantity, shelf_location]
      );
      res.status(201).json({ message: 'Book added successfully', bookId: result.insertId });
    } catch (err) {
      if (err.code === 'ER_DUP_ENTRY') {
        res.status(400).json({ error: 'A book with this ISBN already exists' });
      } else {
        console.error('Error adding book:', err);
        res.status(500).json({ error: 'Internal server error' });
      }
    }
  }
);

// select * books
router.get('/', async (req, res) => {
  try {
    const { title, author, isbn } = req.query;
    let query = 'SELECT * FROM books WHERE 1=1';
    const params = [];

    if (title) {
      query += ' AND title LIKE ?';
      params.push(`%${title}%`);
    }
    if (author) {
      query += ' AND author LIKE ?';
      params.push(`%${author}%`);
    }
    if (isbn) {
      query += ' AND isbn = ?';
      params.push(isbn);
    }

    const [rows] = await db.query(query, params);
    res.json(rows);
  } catch (err) {
    console.error('Error fetching books:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Get bk by id
router.get('/:id', async (req, res) => {
  try {
    const [rows] = await db.query('SELECT * FROM books WHERE id = ?', [req.params.id]);
    if (!rows.length) return res.status(404).json({ error: 'Book not found' });
    res.json(rows[0]);
  } catch (err) {
    console.error('Error fetching book:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Update bk
router.put(
  '/:id',
  [
    body('title').optional().isString().trim(),
    body('author').optional().isString().trim(),
    body('isbn').optional().isString().trim(),
    body('quantity').optional().isInt({ min: 0 }),
    body('shelf_location').optional().isString().trim()
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

      if (!fields) {
        return res.status(400).json({ error: 'No fields to update' });
      }

      const [result] = await db.query(
        `UPDATE books SET ${fields} WHERE id = ?`,
        [...values, req.params.id]
      );

      if (!result.affectedRows) return res.status(404).json({ error: 'Book not found' });
      res.json({ message: 'Book updated successfully' });
    } catch (err) {
      if (err.code === 'ER_DUP_ENTRY') {
        res.status(400).json({ error: 'Duplicate ISBN, cannot update' });
      } else {
        console.error('Error updating book:', err);
        res.status(500).json({ error: 'Internal server error' });
      }
    }
  }
);

// Delete a bk
router.delete('/:id', async (req, res) => {
  try {
    const [result] = await db.query('DELETE FROM books WHERE id = ?', [req.params.id]);
    if (!result.affectedRows) return res.status(404).json({ error: 'Book not found' });
    res.json({ message: 'Book deleted successfully' });
  } catch (err) {
    console.error('Error deleting book:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
});

module.exports = router;

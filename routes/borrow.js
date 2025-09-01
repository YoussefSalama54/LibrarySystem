const express = require('express');
const router = express.Router();
const db = require('../db');
const { body, validationResult } = require('express-validator');

//borrow a book
router.post(
  '/',
  [
    body('borrower_id').isInt({ min: 1 }),
    body('book_id').isInt({ min: 1 }),
    body('due_date').isDate()
  ],
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { borrower_id, book_id, due_date } = req.body;

    try {
      const [books] = await db.query('SELECT * FROM books WHERE id = ?', [book_id]);
      if (books.length === 0) return res.status(404).json({ error: 'Book not found' });
      if (books[0].quantity <= 0) return res.status(400).json({ error: 'Book not available' });
      await db.query(
        'INSERT INTO borrowed_books (borrower_id, book_id, due_date) VALUES (?, ?, ?)',
        [borrower_id, book_id, due_date]
      );      await db.query('UPDATE books SET quantity = quantity - 1 WHERE id = ?', [book_id]);

      res.status(201).json({ message: 'Book borrowed successfully' });
    } catch (err) {
      console.error(err);
      res.status(500).json({ error: 'Internal server error' });
    }
  }
);

//Return a book
router.post(
  '/return',
  [
    body('borrower_id').isInt({ min: 1 }),
    body('book_id').isInt({ min: 1 })
  ],
  async (req, res) => {
    const errors = validationResult(req);
  if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { borrower_id, book_id } = req.body;

    try {
      const [result] = await db.query(
        'UPDATE borrowed_books SET returned_date = CURRENT_DATE WHERE borrower_id = ? AND book_id = ? AND returned_date IS NULL',
        [borrower_id, book_id]
      );

      if (result.affectedRows === 0) {
      return res.status(404).json({ error: 'No active borrow record found for this borrower and book' });
      }

      // Increase available quantity
    await db.query('UPDATE books SET quantity = quantity + 1 WHERE id = ?', [book_id]);

      res.json({ message: 'Book returned successfully' });
    } catch (err) {
      console.error(err);
      res.status(500).json({ error: 'Internal server error' });
    }
  }
);

// get borrowed books
router.get('/', async (req, res) => {
  try {
    const [rows] = await db.query(
      `SELECT bb.id, b.title, br.name AS borrower, bb.borrowed_date, bb.due_date, bb.returned_date
       FROM borrowed_books bb
       JOIN books b ON bb.book_id = b.id
       JOIN borrowers br ON bb.borrower_id = br.id`
    );
    res.json(rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Internal server error' });
  }
});

module.exports = router;

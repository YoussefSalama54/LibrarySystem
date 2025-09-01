const request = require('supertest');
const express = require('express');
const booksRoutes = require('../routes/books');

const app = express();
app.use(express.json());
app.use('/books', booksRoutes);

// Mock Basic Auth middleware
app.use((req, res, next) => next());

describe('Books API', () => {

  test('GET /books should return 200 and an array', async () => {
    const res = await request(app)
      .get('/books');

    expect(res.statusCode).toBe(200);
    expect(Array.isArray(res.body)).toBe(true);
  });

});

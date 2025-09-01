CREATE DATABASE IF NOT EXISTS library;
USE library;

CREATE TABLE IF NOT EXISTS books (
  id INT AUTO_INCREMENT PRIMARY KEY,
  title VARCHAR(255) NOT NULL,
  author VARCHAR(255) NOT NULL,
  isbn VARCHAR(50) UNIQUE NOT NULL,
  quantity INT NOT NULL,
  shelf_location VARCHAR(100)
);

CREATE TABLE IF NOT EXISTS borrowers (
  id INT AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(100) NOT NULL,
  email VARCHAR(100) UNIQUE NOT NULL,
  registered_date DATE DEFAULT CURRENT_DATE
);

CREATE TABLE IF NOT EXISTS borrowed_books (
  id INT AUTO_INCREMENT PRIMARY KEY,
  borrower_id INT,
  book_id INT,
  borrowed_date DATE DEFAULT CURRENT_DATE,
  due_date DATE,
  returned_date DATE,
  FOREIGN KEY (borrower_id) REFERENCES borrowers(id),
  FOREIGN KEY (book_id) REFERENCES books(id)
);
INSERT INTO books (title, author, isbn, quantity, shelf_location) VALUES
('The Pragmatic Programmer', 'Andrew Hunt', '9780135957059', 5, 'A3'),
('Clean Code', 'Robert C. Martin', '9780132350884', 3, 'B1'),
('JavaScript: The Good Parts', 'Douglas Crockford', '9780596517748', 4, 'C2'),
('Eloquent JavaScript', 'Marijn Haverbeke', '9781593279509', 2, 'D4'),
('You Don''t Know JS', 'Kyle Simpson', '9781491904244', 6, 'E1');

INSERT INTO borrowers (name, email, registered_date) VALUES
('Alice Johnson', 'alice@example.com', '2025-08-01'),
('Bob Smith', 'bob@example.com', '2025-08-05'),
('Charlie Brown', 'charlie@example.com', '2025-08-10'),
('David Lee', 'david@example.com', '2025-07-20');


INSERT INTO borrowed_books (borrower_id, book_id, borrowed_date, due_date, returned_date) VALUES
(1, 1, '2025-08-15', '2025-08-22', NULL),          -- still borrowed
(2, 2, '2025-08-10', '2025-08-17', '2025-08-16'), -- returned on time
(3, 3, '2025-07-20', '2025-07-27', NULL),          -- overdue
(1, 2, '2025-07-25', '2025-08-01', '2025-07-31'), -- returned early
(4, 4, '2025-08-01', '2025-08-08', NULL),          -- still borrowed
(2, 5, '2025-07-15', '2025-07-22', NULL);          -- overdue

# Library Management System

A simple Node.js + Express + MySQL application to manage books, borrowers, and borrowing processes. Includes features like CSV/Excel report generation, rate limiting, and basic authentication.

---

## **Table of Contents**
1. [Features](#features)
2. [Requirements](#requirements)
3. [Setup](#setup)
4. [Environment Variables](#environment-variables)
5. [Running the Application](#running-the-application)
6. [API Endpoints](#api-endpoints)
7. [Database Schema](#database-schema)
8. [Notes](#notes)

---

## **Features**
- Add, update, delete, and list books.
- Register, update, delete, and list borrowers.
- Borrow and return books.
- Track due dates and overdue books.
- Export borrowing reports to CSV/Excel.
- Basic authentication for API endpoints.
- Rate limiting applied to sensitive endpoints.

---

## **Requirements**
- Node.js v22+
- MySQL 8.0+
- npm
- Optional: Docker & Docker Compose for containerized setup.

---

## **Setup**

1. Clone the repository:

```bash
git clone https://github.com/YoussefSalama54/LibrarySystem.git
cd LibrarySystem

2. Install dependencies
npm install

3. Configure environment variables

Copy .env.example to .env:

DB_HOST=localhost
DB_USER=library_user
DB_PASSWORD=VioleGrace54
DB_NAME=library
DB_PORT=3306
API_USER=admin
API_PASSWORD=admin123
PORT=3000

4. Database setup

Option 1: Using Docker

docker-compose up --build


MySQL container will initialize with init.sql.

Option 2: Local MySQL

mysql -u root -p < docker/mysql-init/init.sql


Make sure the library database is created and tables are populated.

Running the Application
node index.js


API will run at http://localhost:3000.

API Endpoints
Books
Method	Endpoint	Body / Params	Description
POST	/books	{ title, author, isbn, quantity, shelf_location? }	Add a book
GET	/books	?title=&author=&isbn=	List/search books
GET	/books/:id	-	Get a book by ID
PUT	/books/:id	{ title?, author?, isbn?, quantity?, shelf_location? }	Update a book
DELETE	/books/:id	-	Delete a book

Borrowers
Method	Endpoint	Body / Params	    Description
POST	/borrowers	{ name, email }	    Add a borrower
GET	/borrowers	        -	            List all borrowers
GET	/borrowers/:id	    -	            Get borrower by ID
PUT	/borrowers/:id	{ name?, email? }	Update a borrower
DELETE	/borrowers/:id	-	            Delete a borrower


Borrowing
Method	Endpoint	        Body / Params	                    Description
POST	/borrow	            { borrower_id, book_id, due_date }	Borrow a book
POST	/return	            { borrower_id, book_id }	        Return a book
GET	/borrow/:borrower_id	-	                                List books currently borrowed by a user

Reports / Export
Method	Endpoint	                                    Description
GET	/reports/borrowed?start=YYYY-MM-DD&end=YYYY-MM-DD	Export borrowing report for a period
GET	/reports/overdue	                                Export overdue borrows of last month

Authentication: Use basic auth (username/password from .env).

Database Schema

3 tables: books, borrowers, borrowed_books

Relationships:

borrowed_books.borrower_id → borrowers.id

borrowed_books.book_id → books.id

Example DBML for dbdiagram.io
:

Table books {
  id int [pk, increment]
  title varchar
  author varchar
  isbn varchar [unique]
  quantity int
  shelf_location varchar
}

Table borrowers {
  id int [pk, increment]
  name varchar
  email varchar [unique]
  registered_date date
}

Table borrowed_books {
  id int [pk, increment]
  borrower_id int [ref: > borrowers.id]
  book_id int [ref: > books.id]
  borrowed_date date
  due_date date
  returned_date date
}
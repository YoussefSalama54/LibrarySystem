const express = require("express");
const router = express.Router();
const pool = require("../db");
const fs = require("fs");
const fastcsv = require("fast-csv");
const xlsx = require("xlsx");

// Export overdue borrows of the last month in CSV
router.get("/overdue", async (req, res) => {
  try {
    const [rows] = await pool.query(
      `SELECT bb.id, b.title, br.name, bb.borrowed_date, bb.due_date
       FROM borrowed_books bb
       JOIN books b ON bb.book_id = b.id
       JOIN borrowers br ON bb.borrower_id = br.id
       WHERE bb.returned_date IS NULL 
       AND bb.due_date < CURDATE() 
       AND MONTH(bb.due_date) = MONTH(CURDATE() - INTERVAL 1 MONTH)`
    );

    if (!rows.length) {
      return res.status(404).json({ message: "No overdue records found for last month." });
    }

    const ws = fs.createWriteStream("./exports/overdue.csv");
    fastcsv.write(rows, { headers: true }).pipe(ws);

    res.json({ message: "Overdue report exported", file: "exports/overdue.csv" });
  } catch (err) {
    console.error("Overdue report error:", err);
    res.status(500).json({ error: "Error exporting CSV", details: err.message });
  }
});

// Export all borrowing processes of the last month in XLSX
router.get("/lastmonth", async (req, res) => {
  try {
    const [rows] = await pool.query(
      `SELECT bb.id, b.title, br.name, bb.borrowed_date, bb.due_date, bb.returned_date
       FROM borrowed_books bb
       JOIN books b ON bb.book_id = b.id
       JOIN borrowers br ON bb.borrower_id = br.id
       WHERE MONTH(bb.borrowed_date) = MONTH(CURDATE() - INTERVAL 1 MONTH)`
    );

    if (!rows.length) {
      return res.status(404).json({ message: "No borrowing records found for last month." });
    }

    const ws = xlsx.utils.json_to_sheet(rows);
    const wb = xlsx.utils.book_new();
    xlsx.utils.book_append_sheet(wb, ws, "Borrowings");
    xlsx.writeFile(wb, "./exports/lastmonth.xlsx");

    res.json({ message: "Borrowing report exported", file: "exports/lastmonth.xlsx" });
  } catch (err) {
    console.error("Last month report error:", err);
    res.status(500).json({ error: "Error exporting XLSX", details: err.message });
  }
});

module.exports = router;

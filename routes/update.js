const express = require('express');
const router = express.Router(); // Use express.Router() to create a router

const bodyParser = require('body-parser');
const sql = require('mssql');
const dbConfig = {
  server: 'food-managment-system.database.windows.net',
  database: 'FoodManagmentSystemDB',
  user: 'Lukabrlek',
  password: 'Ptica123',
  options: {
    encrypt: true,
  },
};

router.use(bodyParser.json()); // Use router.use() for middleware on this router

router.post('/', async (req, res) => {
  try {
    const { newValue } = req.body;

    let pool = await sql.connect(dbConfig);
    await pool.request()
      .query(`UPDATE [dbo].[Hrana] SET Kolicina = Kolicina + ${newValue}`);

    res.status(200).send({ message: 'Update successful' });
  } catch (error) {
    console.error('Error updating database:', error);
    res.status(500).send({ error: 'Internal Server Error' });
  }
});

module.exports = router; // Export the router, not the entire app

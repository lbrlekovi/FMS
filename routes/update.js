const express = require('express');
const router = express.Router();
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

router.use(bodyParser.json());

router.post('/', async (req, res) => {
  try {
    const { foodIndex, newValue } = req.body; // Extracting foodIndex from the request body

    // Define food items and their corresponding column names in the database
    const foodItems = ['Jabuka', 'Orah']; // Add more food items as needed
    const columnName = 'Kolicina'; // Assuming the column name for quantity is the same for all food items

    let pool = await sql.connect(dbConfig);
    let result = await pool.request().query(`SELECT ${columnName} FROM [dbo].[Hrana] WHERE Ime = '${foodItems[foodIndex]}'`);
    let currentKolicina = result.recordset[0][columnName];

    if (currentKolicina + newValue < 0) {
      return res.status(400).send({ error: 'Update would result in Kolicina being less than 0' });
    }

    await pool.request().query(`UPDATE [dbo].[Hrana] SET ${columnName} = ${columnName} + ${newValue} WHERE Ime = '${foodItems[foodIndex]}'`);
    if (currentKolicina + newValue <= 10) {
      res.status(201).send({ message: 'Update successful - Low resource warning' });
    } else {
      res.status(200).send({ message: 'Update successful' });
    }
  } catch (error) {
    console.error('Error updating database:', error);
    res.status(500).send({ error: 'Internal Server Error' });
  }
});

module.exports = router;

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
    const { newValue } = req.body;

    let pool = await sql.connect(dbConfig);
    let result = await pool.request().query('SELECT Kolicina FROM [dbo].[Hrana]');
    let currentKolicina = result.recordset[0].Kolicina;
    
    if (currentKolicina + newValue < 0) {
      return res.status(400).send({ error: 'Update would result in Kolicina being less than 0' });
    }

    await pool.request().query(`UPDATE [dbo].[Hrana] SET Kolicina = Kolicina + ${newValue}`);
    res.status(200).send({ message: 'Update successful' });
  } catch (error) {
    console.error('Error updating database:', error);
    res.status(500).send({ error: 'Internal Server Error' });
  }
});

module.exports = router;

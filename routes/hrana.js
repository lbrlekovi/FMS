const express = require('express');
const router = express.Router();
const sql = require('mssql');
const dbConfig = require('../config');

// Your database query function
const getAllData = async () => {
  let pool = await sql.connect(dbConfig);
  let result = await pool.request().query('SELECT * FROM [dbo].[Hrana]');
  return result;
};

/**
 * @swagger
 * /hrana:
 *   get:
 *     description: Get all food storage data
 *     responses:
 *       200:
 *         description: Successful response
 */
router.get('/', async (req, res) => {
  try {
    const data = await getAllData();
    const resp = {
      result: data.recordsets[0]
    };
    res.send(resp);
  } catch (error) {
    console.error('Error fetching data:', error);
    res.status(500).send({ error: 'Internal Server Error' });
  }
});

module.exports = router;

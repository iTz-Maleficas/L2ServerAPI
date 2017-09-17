const router = require('express').Router();
const mysql = require('mysql');

const mc = mysql.createConnection({
  host: 'localhost',
  user: 'root',
  password: '',
  database: 'nodejs',
});

const list = {
  characters(req, res) {
    // Retrieve all characters
    mc.query('SELECT * FROM characters', (error, results, fields) => {
      if (error) throw error;
      return res.send({ error: false, data: results, message: 'Characters list.' });
    });
  },
  accounts(req, res) {
    // Retrieve all accounts
    mc.query('SELECT * FROM accounts', (error, results, fields) => {
      if (error) throw error;
      return res.send({ error: false, data: results, message: 'Accounts list.' });
    });
  },
};

router.get('/characters', list.characters);
router.get('/accounts', list.accounts);


module.exports = router;

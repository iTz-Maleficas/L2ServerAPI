const router = require('express').Router();
const mysql = require('mysql');

const mc = mysql.createConnection({
  host: 'localhost',
  user: 'root',
  password: '',
  database: 'nodejs',
});

const account = {
  register(req, res) {
    const login = req.body.login;
    const password = req.body.password;
    const email = req.body.email;
    const accessLevel = -1; // Enable (-1) / Disable (0) confirmation email system.
    const verificationCode = account.makeid();

    if (!login || !password || !email) {
      return res.status(400).send({ error: true, message: 'Please fill all fields.' });
    }
    mc.query('INSERT INTO accounts SET ? ', {
      login, password, email, accessLevel,
    }, (error, results, fields) => {
      if (error) throw error;
    });
    if (accessLevel === -1) {
      mc.query('INSERT INTO pending_accounts SET ? ', {
        login, verification_code: verificationCode,
      }, (error, results, fields) => {
        if (error) throw error;
      });
    }
    return res.send({ error: false, message: 'New account was created.' });
  },
  verification(req, res) {
    const login = req.body.login;
    const verificationCode = req.body.verificationCode;

    mc.query('SELECT * FROM pending_accounts WHERE login = ? AND verification_code = ?', [login, verificationCode], (error, results, fields) => {
      if (error) throw error;
      if (results.length === 0) {
        return res.send({ error: false, message: 'No results found.' });
      }
      mc.query('UPDATE accounts SET accessLevel = 0 WHERE login = ?', [login], (error, results, fields) => {
        if (error) throw error;
        mc.query('DELETE FROM pending_accounts WHERE login = ?', [login], (error, results, fields) => {
          if (error) throw error;
          return res.send({ error: false, message: 'Account has been verified successfully.' });
        });
      });
    });
  },
  makeid() {
    let text = '';
    const possible = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    for (let i = 0; i < 15; i += 1) {
      text += possible.charAt(Math.floor(Math.random() * possible.length));
    }
    return text;
  },
  information(req, res) {
    const login = req.params.login;
    const generalInfo = {
      account: null,
      characters: null,
    };
    // Retrive account info.
    mc.query('SELECT * FROM accounts WHERE login = ?', [login], (error, results, fields) => {
      if (error) throw error;
      if (results.length === 0) {
        return res.send({ error: false, message: 'Account dont exist.' });
      }
      generalInfo.account = results;
      // All character info.
      mc.query('SELECT * FROM characters WHERE account_name = ?', [login], (error, results, fields) => {
        if (error) throw error;
        generalInfo.characters = results;
        return res.send({ error: false, data: generalInfo, message: 'Account full info.' });
      });
    });
  },
};

router.post('/register', account.register);
router.put('/verification', account.verification);
router.get('/info/:login', account.information);

module.exports = router;

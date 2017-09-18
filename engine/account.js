const router = require('express').Router();
const mysql = require('mysql');
const nodemailer = require('nodemailer');
const crypto = require('crypto');

const mc = mysql.createConnection({
  host: 'localhost',
  user: 'root',
  password: '',
  database: 'nodejs',
});

// create transporter for emails
const transporter = nodemailer.createTransport({
  host: 'smtp.gmail.com',
  port: 465,
  secure: true,
  auth: {
    user: 'mobblegend@gmail.com',
    pass: 'a560gL6w2',
  },
});

const account = {
  makeid() {
    let text = '';
    const possible = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    for (let i = 0; i < 15; i += 1) {
      text += possible.charAt(Math.floor(Math.random() * possible.length));
    }
    return text;
  },
  encryptPassword(passwordDecrypt) {
    const createHash = crypto.createHash('sha1');
    createHash.update(passwordDecrypt);
    const password = createHash.digest('base64');
    return password;
  },
  register(req, res) {
    const login = req.body.login;
    const password = account.encryptPassword(req.body.password);
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
    // setup email data with unicode symbols
    const mailOptions = {
      from: '"Brave Arena Support" <mobblegend@gmail.com>',
      to: `${email}`,
      subject: 'Account created, verify your mail.',
      html: `Hello  ${login}, please copy this code <b>"${verificationCode}"</b> in your user panel to verify your account.<br>
      Visit the user panel <a href="http://localhost:3000">here</a>`,
    };
    transporter.sendMail(mailOptions, (error, info) => {
      if (error) {
        return console.log(error);
      }
      console.log('Account activation link sent: ', login);
    });
    return res.send({ error: false, message: 'New account was created.' });
  },
  verification(req, res) {
    const login = req.body.login;
    const email = req.body.email;
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
          // setup email data with unicode symbols
          const mailOptions = {
            from: '"Brave Arena Support" <mobblegend@gmail.com>',
            to: `${email}`,
            subject: 'Account verified.',
            html: `${login}, your account was verified successfuly, have fun!`,
          };
          transporter.sendMail(mailOptions, (error, info) => {
            if (error) {
              return console.log(error);
            }
            console.log('Account verified: ', login);
          });
          return res.send({ error: false, message: 'Account has been verified successfully.' });
        });
      });
    });
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

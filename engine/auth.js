const express = require('express');
const _ = require('lodash');
const jwt = require('jsonwebtoken');
const router = require('express').Router();
const mysql = require('mysql');

const mc = mysql.createConnection({
  host: 'localhost',
  user: 'root',
  password: '',
  database: 'nodejs',
});

const secret = 'never give up';

const auth = {
  getUserFromBase() {

  },
  createToken(user) {
    return jwt.sign(_.omit(user, 'password'), secret, { expiresIn: 60 * 60 * 5 });
  },
  login(req, res) {
    const login = req.body.username;
    const password = req.body.password;
    const user = {
      username: 'gero',
      password: 'gero',
      email: 'gero@gmail.com',
    };
    if (!login || !password) {
      return res.send({ error: true, message: 'You must send the username and the password.' });
    }
    res.send({
      idToken: auth.createToken(user), // nodemon
    });
  },
};

router.post('/login', auth.login);

module.exports = router;

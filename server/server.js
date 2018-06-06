const express = require('express');
const bodyParser = require('body-parser');
const dataSave = require('../Database/mongoose');
const http = require('http');
const path = require('path');
const socketIO = require('socket.io');
const bcrypt = require('bcrypt');

const app = express();
const server = http.Server(app);
const io = socketIO(server);

app.use(express.static(path.join(__dirname, '/../database')));
app.use(express.static(path.join(__dirname, '/../dist')));

app.get('/', (req, res) => {
  res.sendStatus(201);
});

app.use(bodyParser.json());

// get request for login
app.get('/users', (req, res) => {
  const request = req.query;
  console.log(request, 'this is the request');
  dataSave.getUser(request, (response) => {
    if (response !== 'Match') {
      res.status(404).send(response);
    } else {
      res.status(200).send(response);
    }
  });
});

// post request to database for sign up
app.post('/users', (req, res) => {
  const data = req.body;
  console.log(data);
  bcrypt.hash(data.password, 10, (err, hash) => {
    if (err) {
      console.log(err);
    }
    dataSave.save(data, hash, (response) => {
      if (typeof response === 'string') {
        res.send(response);
      } else {
        const info = { username: response.username, save_tokens: response.save_tokens, death_tokens: response.death_tokens };
        res.send(info);
      }
    });
  });
});


io.on('connection', (socket) => {
  console.log('a user connected');
});

server.listen(3000, () => {
  console.log('listening on port 3000');
});

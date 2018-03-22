const express = require('express');
const bodyParser= require('body-parser');
const app = express();

const serverIp = '127.0.0.1';
const serverPort = 1337;

app.listen(serverPort, serverIp, function() {
    console.log(`Server running at 'http://${serverIp}:${serverPort}/'`);
});

app.get('/', (req, res) => {
    res.sendFile(__dirname + '/index.html');
})

app.post('/quotes', (req, res) => {
    console.log(req.body);
})
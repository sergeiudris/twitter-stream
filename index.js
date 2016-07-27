const Twit = require('twit')
const readline = require('readline');
const net = require('net');
const WebSocketServer = require('ws').Server
var r = null;
const connected = [];
// const server = new WebSocketServer({ port: 2000 });
// server.on('connection', function (socket) {
//     connected.push(socket);
//     socket.on('message', function (message) {
//         console.log(message);
//     });
//     socket.send(JSON.stringify({ hello: "hello" }));
//     console.log('->connected')
// });
// server.on('disconnect', function (socket) {
//     connected.splice(connected.indexOf(socket),1);
//     console.log("->disconnected");
// });


// var express = require('express');
// var port = 2000;
// var app = express();

// var http = require('http').Server(app);
// var path = require('path');
// var io = require('socket.io')(http);
// var options = {
//   key: fs.readFileSync('./file.pem'),
//   cert: fs.readFileSync('./file.crt')
// };
// var serverPort = 443;


const pem = require('pem');
var fs = require('fs');
//var app = require('express')();
var io;
const PORT = 2443;
var T;
var stream;
pem.createCertificate({ days: 1, selfSigned: true }, function (err, keys) {
    //console.log(Object.keys(keys));
    //fs.writeFile('certs.json', JSON.stringify(keys));
    //keys = fs.readFileSync('certs.json');
    var server = require('https').createServer({ host:'localhost', key: keys.serviceKey, cert: keys.certificate });
    io = require('socket.io')(server);
    io.on('connection', function (socket) {
        console.log("a user connected");

        socket.on('disconnect', function (e) {
            console.log("disconnect");
        });
        socket.on('chat message', function (o) {
            socket.broadcast.emit("chat message", o);
        });
    });
    server.listen(PORT, function () {
        console.log('>app is running on port ' + PORT + '\n>type   http://127.0.0.1:' + PORT + '   in your browser to use the application\n>to stop the server: press  ctrl + c');
    })
    // T = new Twit({
    //     consumer_key: 'PDvvNuj9QpgrwuMmXj5BzcD6D',
    //     consumer_secret: 'ioU0pUy9apMMs80Wb2NXw793POAsf3XkOZ9C5OaEjBdvEnwpOe',
    //     access_token: '757606965895987201-GiPClOgfqmnpFji4TnJfDAyb5CSSuSG',
    //     access_token_secret: 'gb5lJfcb13bRU2KvXX0XZUwi9x8CUQmru0ED0l8nsCale',
    //     //  app_only_auth: true
    // })
    // stream = T.stream('statuses/filter', { track: ["nba"], language: 'en' })
    // stream.on('message', function (msg) {
    // })

    // stream.on('connect', function (request) {
    //     console.log("attempt to connect");
    //     io.emit('msg', "stream connecting")
    // })

    // stream.on('tweet', function (tweet) {
    //     console.log('tweet');
    //     if (tweet.user && tweet.user.followers_count > 10000) {
    //         io.emit('msg', tweet);
    //     }
    // })

    // stream.on('disconnect', function (disconnectMessage) {
    //     say("disconnect")
    // })
});

function say(...args) {
    console.log(args);
}

// var https = require('https'),
//     pem = require('pem'),
//     express = require('express');

// pem.createCertificate({days:1, selfSigned:true}, function(err, keys){
//   var app = express();

//   app.get('/',   function(req, res){
//     res.send('o hai!');
//   });

//   https.createServer({key: keys.serviceKey, cert: keys.certificate}, app).listen(443);
// });

// var T = new Twit({
//     consumer_key: '...',
//     consumer_secret: '...',
//     access_token: '...',
//     access_token_secret: '...',
//     timeout_ms: 60 * 1000,  // optional HTTP request timeout to apply to all requests.
// })



// T.post('statuses/update', { status: 'test' }, function(err, data, response) {
//   console.log(data)
// })

//var stream = T.stream('statuses/filter', { locations: sanFrancisco })
//var stream = T.stream('statuses/filter', { track: '#apple', language: 'en' })
//var stream = T.stream('statuses/filter', { track: ['bananas', 'oranges', 'strawberries'] })

// var sanFrancisco = [ '-122.75', '36.8', '-121.75', '37.8' ]

// var stream = T.stream('statuses/filter', { locations: sanFrancisco })

//var stream = T.stream('statuses/sample')





// const server = net.createServer((socket) => {
//     connected.push(socket);
//     socket.write("hi there");
//     console.log(`-> new socket: ${socket.remoteAddress}`);
// }).on('error', (err) => {
//     console.log(err);
// });


// server.listen({
//     host: 'localhost',
//     port: 2000,
//     exclusive:true
// },() => {
//     address = server.address();
//     console.log('opened server on %j', address);
// })


//roomManager.create(3,4);




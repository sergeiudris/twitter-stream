const http = require('http'),
  https = require('http'),
  fs = require('fs'),
  path = require('path'),
  contentTypes = require('./utils/content-types'),
  sysInfo = require('./utils/sys-info'),
  env = process.env;


//const Twit = require('twit')
// var sserver = require('https').createServer({},);
// var io = require('socket.io')(sserver);
// const PORT = process.env.OPENSHIFT_NODEJS_PORT || 8443;
// io.on('connection', function (socket) {
//     console.log("a user connected");

//     socket.on('disconnect', function (e) {
//         console.log("disconnect");
//     });
//     socket.on('chat message', function (o) {
//         socket.broadcast.emit("chat message", o);
//     });
// });
// sserver.listen(PORT, function () {
//     console.log('>app is running on port ' + PORT);
// }) 

let server = http.createServer(function (req, res) {
  
  //res.writeHead(200);
  //res.setHeader('Access-Control-Allow-Origin', '*');
  //res.end();
  let url = req.url;
  if (url == '/') {
    url += 'index.html';
  }

  // IMPORTANT: Your application HAS to respond to GET /health with status 200
  //            for OpenShift health monitoring
  res.setHeader('Access-Control-Allow-Origin', '*');
  if (url == '/health') {
    res.writeHead(200);
    res.end();
  } else if (url == '/info/gen' || url == '/info/poll') {
    res.setHeader('Content-Type', 'application/json');
    res.setHeader('Cache-Control', 'no-cache, no-store');
    res.end(JSON.stringify(sysInfo[url.slice(6)]()));
  } else {
    fs.readFile('./static' + url, function (err, data) {
      if (err) {
        res.writeHead(404);
        res.end('Not found');
      } else {
        let ext = path.extname(url).slice(1);
        res.setHeader('Content-Type', contentTypes[ext]);
        if (ext === 'html') {
          res.setHeader('Cache-Control', 'no-cache, no-store');
        }
        res.end(data);
      }
    });
  }
});
var io = require('socket.io')(server);
io.on('connection', function (socket) {
  console.log(`${socket.id} connected`);

  socket.on('disconnect', function (e) {
    console.log(`${socket.id} disconnected`);
  });
  socket.on('m', function (o) {
    io.emit("m", { id: "server", msg: o });
  });
  io.emit("m", { id: "server", msg: `new user connected ${socket.id}` });
});



const PORT = process.env.OPENSHIFT_NODEJS_PORT || 3000;

console.log(`port: ${PORT}`);
console.log(`ip: ${env.OPENSHIFT_NODEJS_IP || 'localhost'}`);

server.listen(PORT, env.OPENSHIFT_NODEJS_IP || 'localhost', function () {
  console.log(`Application worker ${process.pid} started...`);
});

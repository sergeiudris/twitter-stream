const http = require('http'),
  https = require('http'),
  fs = require('fs'),
  path = require('path'),
  contentTypes = require('./utils/content-types'),
  sysInfo = require('./utils/sys-info'),
  env = process.env,
  Twit = require('twit')
  ;
let timeoutId = 0;

const THEMES = {
  "nba": ["nba"],
  "football": ["la liga", "premierleague", "bundesliga", "mourinho", "wenger", "guardiola"],
  "nhl": ["nhl"],
  "nfl": ["nfl"],
  "olympics": ["olympic"],
  "tennis": ["federer", "nadal", "djokovic", "atp", "us open"]
}

var tweets = {};

function storeTweet(tweet) {
  const promises = [];
  var text = tweet.text;
  //in case we decide to break or return
  for (var p in THEMES) {
    promises.push(new Promise((y, f) => {
      let quote = tweet.quoted_status ? tweet.quoted_status.text : "";
      let hashtags = tweet.entities.hashtags.reduce((p, c, i, a) => { return [p, c.text].join(" #") }, "")
      if (new RegExp(THEMES[p].join('|'), 'gi').test([text, hashtags, quote].join(''))) {
        y(p);
      }
      y(false)
    }))
  }
  return Promise.all(promises).then((vs) => {
    return [tweet, vs.filter((v) => { return v ? true : false; })];
  }).then(([tweet, values]) => {
    values.forEach((value, i, a) => {
      if (value) {
        tweets[value] = tweets[value] || [];
        tweets[value].push(tweet);
        tweets[value].splice(0, tweets[value].length - 50);
      }
    })
    return values;
  });
}


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

var T = new Twit({
  consumer_key: 'PDvvNuj9QpgrwuMmXj5BzcD6D',
  consumer_secret: 'ioU0pUy9apMMs80Wb2NXw793POAsf3XkOZ9C5OaEjBdvEnwpOe',
  access_token: '757606965895987201-GiPClOgfqmnpFji4TnJfDAyb5CSSuSG',
  access_token_secret: 'gb5lJfcb13bRU2KvXX0XZUwi9x8CUQmru0ED0l8nsCale',
  //app_only_auth: true
})
// T = new Twit({
//     consumer_key: 'YS2BntFcYVkTdf2kju0sVWIFy',
//     consumer_secret: '9gw8ACgOGKO5NMEaqi7zp3QV0ATG7Hnx8aVYaGkAVLPwiTELLR',
//     access_token: '	757606965895987201-dxD7Y2pDfLryYTD2zRzBP6qVx2l3xn2',
//     access_token_secret: 'N38Bzi6csid84B9EBJLGMFl0E1sPNKhmG1nZBKhG9GFO2',
//     //  app_only_auth: true
// })

//match({ text: "here is nba nFL" }).then((vs) => { console.log(tweets);console.log(vs) });

var stream = T.stream('statuses/filter', { track: Object.keys(THEMES).map((e) => THEMES[e].join(',')).join(','), language: 'en' })
stream.isStopped = false;
io.on('connection', function (socket) {
  console.log(`${socket.id} connected`);

  clearTimeout(timeoutId);
  if (stream.isStopped) {
    console.log("stream has been restarted");
    stream.start();
  }

  socket.on('disconnect', function (e) {
    console.log(`${socket.id} disconnected`);

    if (!Object.keys(io.sockets.connected).length) {
      timeoutId = setTimeout(() => {
        stream.stop();
        stream.isStopped = true;
        Object.keys(tweets).forEach(function (e) {
          tweets[e].splice(0);
        })
        console.log("stream has been stopped");
      }, 3600 * 1000);
    }

  });
  socket.on('message', function (o) {
    io.emit("message", { id: socket.id, data: o });
  });
  //io.emit("message", { id: "server", msg: `new user connected ${socket.id}` });
  socket.on('themes', function (themes, cb) {
    // io.sockets.connected[socket.id].rooms.forEach((e,i,a)=>{
    //   socket.leave(e);
    // })
    //console.log(io.sockets.connected[socket.id]);
    console.log(socket);
    themes.forEach((e, i, a) => {
      socket.join(e.toLowerCase());
    })
    cb(themes.reduce((p, c, i, a) => {
      if (!p[c]) {
        p[c] = tweets[c] ? tweets[c].slice(-10) : [];
      }
      return p;
    }, {}));
  });
});



stream.on('message', function (msg) {
})

stream.on('connect', function (request) {

  console.log("stream 'connect' event");
})
stream.on('reconnect', function (request, response, connectInterval) {

  console.log("reconnect attempt");

})

stream.on('tweet', function (tweet) {
  if (tweet.user && tweet.user.followers_count > 5000) {
    let p = storeTweet(tweet).then((matches) => {
      // fs.appendFile("tweets.json", JSON.stringify(matches));
      // fs.appendFile("tweets.json", JSON.stringify(tweet));
      // console.log(tweet.text);
      // console.log(matches);
      // Object.keys(tweets).forEach((e, i, a) => {
      //   console.log(`${e}: ${tweets[e].length}`);
      // })
      matches.forEach((e, i, a) => {
        io.to(e).emit('tweet', tweet);
      })
    })

  }
})

stream.on('disconnect', function (disconnectMessage) {
  console.log("twitter stream disconnected")
  stream.isStopped = true;
})

stream.on('error', function (err) {
  console.log("twitter stream error:")
  console.log(err);
  stream.isStopped = true;
})

const PORT = process.env.OPENSHIFT_NODEJS_PORT || 2000;

console.log(`port: ${PORT}`);
console.log(`ip: ${env.OPENSHIFT_NODEJS_IP || 'localhost'}`);

server.listen(PORT, env.OPENSHIFT_NODEJS_IP || 'localhost', function () {
  console.log(`Application worker ${process.pid} started...`);
});


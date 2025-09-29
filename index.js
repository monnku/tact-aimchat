import express from 'express';
import http from 'http';
import { Server as SocketIOServer } from 'socket.io'; // socket.ioをインポートする際の推奨形式
import path from 'path';
import fs from 'fs';
import { createRequire } from 'module'; 
const require = createRequire(import.meta.url);
const app = express();
const server = http.createServer(app);
const io = new SocketIOServer(server); 
let chatdata = [];
app.set('trust proxy', true);
app.use(express.static('public'));
let ip = '';
let ips = []
let data = '';
let user = '';
let banned = false;
let users = [];
let now_users = [];
let administer = [];
function removetags(html) {
    html = html.replace(/<[^>]*>/g, "");
    html = html.replace(/!img\[(.+?)\]/g, '<img src="$1"></img>');
    html = html.replace(/!color\[(.+?)\]/g, '<font color="$1">');
    html = html.replace(/!size\[(.+?)\]/g, '<font size="$1">');
    html = html.replace(/!url\[(.+?)\]/g, '<a href="$1">');
    html = html.replace(/!del\[(.+?)\]/g, '<del>$1</del>');
    html = html.replace(/!button\[(.+?)\]/g, '<button onclick="$1">');
    console.log(html);
    return html
}
app.get('/', (req, res) => {
  console.log(req.ip);
  ip = req.ip;
  banned = ips.includes(ip);
  res.sendFile(__dirname + '/index.html');
});
app.get('/rule', (req, res) => {
  res.sendFile(__dirname + '/rule.html');
});
setInterval(() => {
  now_users = [];
  administer = [];
  io.emit('checking');
  setTimeout(() => {
    io.emit('users', now_users);
  }, 6000)
}, 30000)
let forwarded = '';
io.on('connection', (socket) => {
  forwarded = socket.request.headers['x-forwarded-for'] || socket.request.connection.remoteAddress;
  console.log('connect');
  socket.on('send', (json) => {
    json.username = removetags(json.username);
    json.data = removetags(json.data);
    console.log(users);
    if (users.indexOf(forwarded) == -1){
      if (true){
        chatdata.push(json);
        if (chatdata.length > 200){
          chatdata.shift();
        }
        io.emit('message', json);
        users[users.length] = forwarded;
        setTimeout(() => {users.shift();}, 1000);
      }
    }
  });
  socket.on('ip', (username) => {
    io.emit('chat', {'chatdata':chatdata, 'username':username});
  });
  socket.on('rel', (json) => {
    io.emit('reload', json);
  });
  socket.on('socket', (json) => {
    io.emit('socket', json);
  });
  socket.on('ban', (json) => {
    io.emit('ban', json);
  })
  socket.on('checking', () => {
    io.emit('checking');
  })
  socket.on('check', (user, key) => {
    now_users[now_users.length] = user;
    console.log(now_users);
  });
});

server.listen(8080, () => {
  console.log('Server is running on port 3000');
});

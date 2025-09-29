var val = 'default'
console.log('検証見るなぼけが(# ﾟДﾟ)')
localStorage.setItem('time', 'false');
if (localStorage.getItem('banned') !== null){
  while (true){}
}
if (localStorage.getItem('stime') === null){
  localStorage.setItem('stime', '0');
}
setTimeout(function(){localStorage.setItem('stime', '0')}, 30000);
if (localStorage.getItem('id') === null){
  localStorage.setItem('id', String(Math.floor( Math.random() * 1000001)));
}
let socket = null;
let username = null;
var kari = '';
var id = localStorage.getItem("id");
var com = true;
const music = new Audio('https://cdn.glitch.global/2d18f0d6-61c9-4f7c-9d14-e4ee97040600/%E3%82%AB%E3%83%BC%E3%82%BD%E3%83%AB%E7%A7%BB%E5%8B%951.mp3?v=1695554769918');
let mute = false
const text = document.getElementsByClassName('text')[0];
const chatscroll = document.getElementsByClassName('chatscroll')[0];
const user = document.getElementById('users');
var editopen = false;
var time = '';
var month = 0;
var date = 0;
var hour = 0;
var min = 0;
var c = 0;
var a = 0;
var to = 'all';
var blist = [];
function img_resize(){
  const myFunc = function(src){
    return new Promise(function(resolve, reject){
      const image = new Image();
      image.src = src;
      image.onload = function(){
        resolve(image);
      }
      image.onerror = function(error){
        reject(error);
      }
    });
  }
  const imgs = document.getElementsByTagName('img');
  for (const img of imgs) {
    const src = img.getAttribute('src');
    myFunc(src)
    .then(function(res){
      if (res.width > 300){
        res.height = Math.floor(res.height*300/res.width);
        res.width = 300;
      }
      if (res.height > 300){
        res.width = Math.floor(res.width*400/res.height);
        res.height = 300;
      }
      img.setAttribute('width', res.width);
      img.setAttribute('height', res.height);
    })
    .catch(function(error){
        console.log(error);
    });
  }
}
document.addEventListener('load', function(){if (id == '393505' || id == '920754'){
  window.location.reload();
}});
const editnamelist = ['ヽ(ﾟ∀｡)ﾉｳｪ🍡', '全部消す', 'リンク', 'スクラッチキャット', 'デフォルトユザネ変更', 'ユザネ変更', 'プラベチャット', '画像', 'ブラックリストに追加', 'ブラックリストからなくす', 'ミュート/ミュート解除'];
const editscroll = document.createElement('div');
editscroll.className = 'editscroll';
editscroll.setAttribute('tabindex','-1');
for(let i = 0;i < editnamelist.length; i++) {
    const editelement = document.createElement('p');
    editelement.textContent = editnamelist[i];
    editscroll.appendChild(editelement);
}
function addchat (usernamevalue, messagevalue) {
  const date = new Date();
  if (blist.indexOf(usernamevalue) == -1){
    let autoscroll = chatscroll.scrollTop + chatscroll.clientHeight >= chatscroll.scrollHeight - 64;
    //const now = '<p class="tm">'+String(date.getMonth())+'/'+String(date.getDate())+' '+String(date.getHours())+':'+String(date.getMinutes())+'</p>'
    const del_html= (usernamevalue+messagevalue).replace(/<[^>]*>/g, '');
    let newelement = document.createElement('div');
    newelement.innerHTML = `${usernamevalue}：${messagevalue}`;
    chatscroll.appendChild(newelement);
    if(autoscroll){
        chatscroll.scrollTop = chatscroll.clientHeight + chatscroll.scrollHeight;
    }
    img_resize();
  }
}

function add() {
  if (window.navigator.userAgent.indexOf('Chrome') !== -1) {
    console.log('chrome');
    text.addEventListener("paste", function(e) {
      if (!e.clipboardData || !e.clipboardData.items) {
        console.log('はじいた');
        return;
      }
      const items = e.clipboardData.items;
      for (let i = 0; i < items.length; i++) {
        const item = items[i];
        if (item.kind === "file" && item.type.startsWith("image/")) {
          const imageFile = item.getAsFile();
          if (imageFile instanceof Blob) {
            const fr = new FileReader();
            fr.onload = function(e) {
              const base64 = e.target.result;
              text.value += `!img[${base64}]`;
            };
            fr.readAsDataURL(imageFile);
          } else {
            text.placeholder = 'pc使え';
            setTimeout(() => {text.placeholder='コメントを入力'}, 2000)
          }
          break;
        }
      }
    });
  } else {
    text.placeholder = 'chrome使え';
    setTimeout(() => {text.placeholder='コメントを入力'}, 2000)
  }
}
add();

function connect(){
    socket = io();
    socket.on('connect',function() {
      if (localStorage.saveKey !== undefined){
        val = localStorage.saveKey;
      }
      if (val == 'default'){
        localStorage.saveKey = 'default';
      }
      username = val;
      socket.emit('ip', username);
    });
    socket.on('chat', (datas) => {
      if (username == datas.username){
        const data_ = datas.chatdata;
        for(let i = 0;i < data_.length; i++) {
          if (data_[i].to == 'all'){
            addchat(data_[i].username, data_[i].data);
          } else if (data_[i].to == username) {
            addchat('<font color="red">(プラベ)</font>' + data_[i].username, data_[i].data);
          }
        }
        document.getElementById("loading").style.display = "none";
      }
    });
    socket.on('users',function(users) {
      user.innerHTML = '';
      for (let i = 0; i < users.length; i ++){
        let newelement = document.createElement('div');
        newelement.innerHTML = '<nobr>' + escape_html(users[i]);
        user.appendChild(newelement);
      }
    });
    socket.on('message',function(e) {
      //if(e.id !== id){
        if(e.to == 'all'){
          addchat(e.username, e.data);
          if (!mute){
            music.play().catch(error => console.log("再生に失敗しました:", error));
          }
        } else if(e.to == username || e.id == id){
          addchat('<font color="red" size="2">(プラベ)</font>' + e.username, e.data);
          if (!mute){
            music.play().catch(error => console.log("再生に失敗しました:", error));
          }
        }
      //} 
    });
    socket.on('checking', () => {
      setTimeout(() => {
        socket.emit('check', username);
      }, Math.random() * 2000);
    });
    socket.on('ban',function(e) {
      if (username == e.username){
        localStorage.setItem('banned', 'true')
      }
    });
    socket.on('reload',function(e) {
        if (username == e.username){
            window.location.reload();
        } else if (e.username == 'all'){
            window.location.reload();
        }
    });
}
connect();
function send(){
  if(text.value !== '') {
    if (localStorage.getItem('time') == 'false'){
      localStorage.setItem('time', 'true');
      setTimeout(function(){localStorage.setItem('time', 'false')}, 1000);
      socket.emit('send', { 'data': text.value, 'username': username, 'id': id, 'to':to});
      text.value = '';
    } else {
      alert('コメントの間隔が早すぎるっぽいよ');
    }
  }
}
document.getElementsByClassName('send')[0].addEventListener('click', function(){
    send();
});
text.addEventListener('keydown', function(event) {
    if (event.key === 'Enter') {
        send();
    }
});
function escape_html (string) {
  if(typeof string !== 'string') {
    return string;
  }
  return string.replace(/[&'`"<>]/g, function(match) {
    return {
      '&': '&amp;',
      "'": '&#x27;',
      '`': '&#x60;',
      '"': '&quot;',
      '<': '&lt;',
      '>': '&gt;',
    }[match]
  });
}
document.addEventListener('click', function(e) {
    if (editopen === true) {
        if (e.target.parentElement.className === 'editscroll') {
            const editname = editnamelist.indexOf(e.target.textContent);
            let a = 0;
            let we = () => {
              a ++;
              return editname === a - 1;
            };
            if (we()) {
                text.value += 'ー!color[#FFC0CB]ヽ(ﾟ∀｡)ﾉ!color[#000000]ヽ(ﾟ∀｡)ﾉ!color[#a2ffa2]ヽ(ﾟ∀｡)ﾉ!color[#000000]ーーー';
                text.focus();
            }
            if (we()) {
                if (confirm('本当にやるんだな？')) {
                    chatscroll.innerHTML = '';
                }
            }
            if (we()) {
                const inputurl = prompt('urlを入力');
                text.value += `!url[${inputurl}]${inputurl}`;
                text.focus();
            }
            if (we()) {
                text.value += '!img[https://cdn.glitch.global/2d18f0d6-61c9-4f7c-9d14-e4ee97040600/cat.svg?v=1695555591061]';
                text.focus();
            }
            if (we()) {
                username = prompt('新しいデフォルトのユーザー名')
                localStorage.saveKey = username;
            }
            if (we()) {
                username = prompt('ユザネ')
            }
            if (we()){
                to = prompt('対象のユザネ(全員:all) 戻すときはこれにallと入れてください。');
            }
            if (we()){
              const fileInput = document.createElement('input');
              fileInput.type = 'file';
              fileInput.accept = 'image/*';
              
              fileInput.addEventListener('change', function(event) {
                const file = event.target.files[0];
                if (file) {
                  const reader = new FileReader();
            
                  reader.onload = function(e) {
                    const base64String = e.target.result;console.log(base64String);
                    text.value += `!img[${base64String}]`;
                    text.focus();
                  };
            
                  reader.readAsDataURL(file);
                }
              });
    
              fileInput.click();
            }
            if (we()){
              if (confirm('自分だけその人のチャットが来なくなるよ　それでもいいんだな')){
                blist += prompt('こなくしたいユザネ');
              }
            }
            if (we()){
              var u = prompt('来るようにするユザネ(ブラックリスト:'+blist+')');
              var ind = blist.indexOf(u);
              if (ind !== -1){
                blist.splice(ind, ind);
              } else {
                alert('そのユザネの人はリストに入っていません');
              }
            }
            if (we()){
              mute = !mute
            }
        }
        editscroll.remove();
        editopen = false;
    }else if (e.target === document.getElementsByClassName('edit')[0]){
        document.getElementsByClassName('main')[0].appendChild(editscroll);
        editopen = true;
    }
});
document.addEventListener('keydown', function(event) {
  if (event.key === 'Enter') {
    text.focus();     
  } 
});

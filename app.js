const WebSocket = require('ws');
const mongoose = require('mongoose');
require('./models');
const Game = mongoose.model('Game');

let length = 0;
let index = 0;

const wsArr = {};

const wss = new WebSocket.Server({ port: 8080 }, (err) => {
    if (err)console.log(err); 
    else console.log('listen on 8080')
});

function noop() {}
function heartbeat() {
    this.isAlive = true;
}


wss.on('connection', function connection(ws) {
    ws.isAlive = true;
    ws.on('pong', heartbeat);
    ws.on('message', function incoming(message) {
        try {
            let obj = JSON.parse(message);
            if (obj.key == 'name') {
                ws.nameKey = obj.userInfo.nickName;
                ws.status = true;
                wsArr[obj.userInfo.nickName] = ws;
            } else if (obj.key == 'input') {
                ws.status = false;
            } else if (obj.key == 'output') {
                ws.status = true;
            }
        } catch (error) {
            console.log(error);
        }
        console.log('received: %s', message);
    });
});

setInterval(function ping() {
    for (let key in wsArr) {
        if(wsArr[key].isAlive == false){
            wsArr[key].terminate();
            delete wsArr[wsArr[key].nameKey]
        } else {
            wsArr[key].isAlive = false;
            wsArr[key].ping(noop);
        }
    }
  }, 1000);

setInterval(function(){
    console.log('insert');
    if (length == 0) {
        let promise = new Promise((resolve,reject) => {
            Game.count().exec((err,value) => {
                if(err) reject(err);
                resolve(value);
            })
        })
        promise.then((data) => {
            console.log(data);
            length = data;
        }).catch(err => {
            console.log('get Length error', err);
        })
    } else {
        console.log(length, index);
        if (index ==  length) {
            index = 0;
        }
        Game.find().skip(index).limit(1).exec((err,data)=> {
            if (err) console.log(err);

            console.log(data);
            for(let key in wsArr){
                try {   
                    if (wsArr[key].isAlive == true && wsArr[key].status){
                        wsArr[key].send(JSON.stringify({key: 'event', data: data[0]}))
                    }
                } catch (error) {
                    console.log(key, 'err:', error);
                    delete wsArr[key];
                }
            }
            index++;
        })
    }
},1000*5)
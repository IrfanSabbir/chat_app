const path = require('path');
const http = require('http');
const socketio = require('socket.io');
const express = require('express');
const Filter= require('bad-words');

const { generateMessage, generateLocation } = require('./util/message');

const app = express();
const server= http.createServer(app);
const io= socketio(server);
const publicDir = path.join(__dirname,'../public');
const port = process.env.PORT || 3000;
const { addUser, removeUser, getUser, getUsersInRoom } = require('./util/user');

const message='Welcome';


app.use(express.static(publicDir));

io.on('connection', (socket)=>{
   console.log('Socket is also runnng');
   
//option = username, room
   socket.on('join',(options, callback)=>{
    const { error, user }  = addUser({id:socket.id, ...options }) 
    if(error){
        return callback(error);
    }
   
     socket.join(user.room);
     
     socket.emit('getMessage',generateMessage('admin',message));
     console.log(user.username);
     socket.broadcast.to(user.room).emit('getMessage',generateMessage('admin',`${user.username} has connected ${user.room}`));
     io.to(user.room).emit('roomData',{
         room: user.room,
         users:getUsersInRoom(user.room)
     })
     callback();
   });

   socket.on('updateMessage',(message,callback)=>{
       const user = getUser(socket.id);
       const filter= new Filter();
       if(filter.isProfane(message)){
          return callback('profanity is not allowed');
       }
       io.to(user.room).emit('getMessage',generateMessage(user.username,message));
       callback();
   })

   
   socket.on('send_location',(coords, callback)=>{
    const user = getUser(socket.id);
       io.to(user.room).emit('myLocation',generateLocation(user.username,coords));
       callback();
   }) 
   socket.on('disconnect',()=>{
    
    
    const user = removeUser(socket.id);
 
    if(user){
     io.to(user.room).emit('getMessage',generateMessage('admin',`${user.username} hase left!`));
     io.to(user.room).emit('roomData',{
        room: user.room,
        users:getUsersInRoom(user.room)
    })
    }

    
})
})



server.listen(port, ()=>{
    console.log(`app is running on port ${port}`);
})
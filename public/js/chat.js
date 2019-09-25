

const socket = io();

const $messageForm = document.querySelector('#message-form');
const $messageFormInput= $messageForm.querySelector('input');
const $messageFormButton = $messageForm.querySelector('button');
const $sendMessageLocation = document.querySelector('#send-location');
const $message = document.querySelector('#messages');

const messageTemplete = document.querySelector('#message-template').innerHTML;
const LocationMessageTemplete = document.querySelector('#location-message-template').innerHTML;
const sidebarTemplete = document.querySelector('#sidebar-template').innerHTML

const { username, room } = Qs.parse(location.search, {ignoreQueryPrefix:true});
console.log(username);

const autoScrool =()=>{
   // New message element
   const $newMessage = $message.lastElementChild

   // Height of the new message
   const newMessageStyles = getComputedStyle($newMessage)
   const newMessageMargin = parseInt(newMessageStyles.marginBottom)
   const newMessageHeight = $newMessage.offsetHeight + newMessageMargin

   // Visible height
   const visibleHeight = $message.offsetHeight

   // Height of messages container
   const containerHeight = $message.scrollHeight

   // How far have I scrolled?
   const scrollOffset = $message.scrollTop + visibleHeight

    if (containerHeight - newMessageHeight <= scrollOffset) {
        $message.scrollTop = $message.scrollHeight
    }

}

socket.on('getMessage',(message)=>{
    console.log(message);
    const html= Mustache.render(messageTemplete,{
        username:message.username,
        message:message.text,
        createdAt:moment(message.ceratedAt).format('h:mm a')
    });
    $message.insertAdjacentHTML('beforeend',html);
    autoScrool()
})

socket.on('myLocation', (message)=>{
    console.log(message);
    const html = Mustache.render(LocationMessageTemplete,{
        username:message.username,
        url:message.url,
        createdAt:moment(message.ceratedAt).format('h:mm a')
    });

    $message.insertAdjacentHTML('beforeend',html);
     autoScrool()
});

$messageForm.addEventListener('submit',(e)=>{
    e.preventDefault();

   $messageFormButton.setAttribute('disabled','disabled');

    const message = e.target.elements.message.value;
    socket.emit('updateMessage',message,(error)=>{
        $messageFormButton.removeAttribute('disabled');
        $messageFormInput.value ='';
        $messageFormInput.focus();
        if(error){
            return console.log(error);
        }

        console.log('Delivered!');
   });
})
socket.on('roomData',({ room, users })=>{
   const html = Mustache.render(sidebarTemplete,{
       room,
       users
   })
   document.querySelector('#sidebar').innerHTML = html;
})
$sendMessageLocation.addEventListener('click',()=>{
    if(!navigator.geolocation){
        return alart('You browser doesnnot support Location sender');
    }
    $sendMessageLocation.setAttribute('disabled','disabled');
    navigator.geolocation.getCurrentPosition((position)=>{
        //console.log(position);
        $sendMessageLocation.removeAttribute('disabled');
        socket.emit('send_location',{
            latitude: position.coords.latitude,
            longitude: position.coords.longitude
        },()=>{
            console.log('Location shared');
        })
    })

})

socket.emit('join',{ username, room}, (error)=>{
    if(error){
        alert(error);
        location.href = '/';
    }
});
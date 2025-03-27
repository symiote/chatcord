const chatform = document.getElementById('chat-form')
const chatMessage = document.querySelector(".chat-messages")
const roomName = document.getElementById("room-name") 
const userList = document.getElementById("users")
//get username and room form url
const { username , room }= Qs.parse(location.search,{
    ignoreQueryPrefix:true, // to ignore the url uncessary symbols 
})

const socket=io();

//join chatroom
socket.emit("joinRoom",{username,room});

//get all room users
socket.on('roomUsers',({room,users})=>{
    outputRoomName(room);
    outputUsers(users);
});
 
//msg from server 
//listen the message event 
socket.on("message",(message)=>{
    console.log(message);
    outputMessage(message);

    //scrol down when recive msg
    chatMessage.scrollTop = chatMessage.scrollHeight;
})

// msg submit 
chatform.addEventListener('submit',(e)=>{
        e.preventDefault();

        //get msg that a person send 
        const msg = e.target.elements.msg.value;

        // emit msg to server
        socket.emit("chatMessage",msg )
        console.log(msg);

        //cleanup the msg input field afetr send msg
        e.target.elements.msg.value ='';
        e.target.elements.msg.focus();
})

function outputMessage(message){
    const div = document.createElement('div');
    div.classList.add("message");
    div.innerHTML = `<p class="meta">${message.username} | <span>${message.time}</span></p>
						<p class="text">
							 ${message.text}
						</p>`;

    document.querySelector(".chat-messages").appendChild(div);
}

//add room to dom - mean display current room at chat page
function outputRoomName(room){
  roomName.innerText =room;
}
//add userslist to dom - mean display users in particular room at chat page
function outputUsers(users){
    userList.innerHTML = `
        ${users.map(item => `<li>${item.username}</li>`).join('')}
    `; 
}
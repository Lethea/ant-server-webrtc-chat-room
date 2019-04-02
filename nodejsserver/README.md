# Node-ChatRoom
The goal of this project is to create a collaborative online chat room for multiple users, by learning new technologies like <b>node.js</b> (using packages like <b>socket.io</b> for managing websockets and <b>express</b> for deploying the server) and basic <b>HTML</b> and <b>javascript</b> (using <b>jQuery</b> library) for the client side.
<br/>I'm currently using my <b>Raspberry Pi 3</b> to deploy and host the chat-room, and using it in my local area network to communicate with other people around the house. It works pretty well!
<br/>
<br/>

## How to deploy the server
For deploying the server, you will need to install both <b>node.js</b> and <b>npm</b> (node package manager). You can do this very easly by opening a linux terminal and using apt-get:
```
sudo apt-get install nodejs
sudo apt-get install npm
```
Then, after the installs are complete, download all the required packages with npm and deploy the server using node! You can do that by running the following commands:
```
npm install
node chatRoom.js
```
You're good to go now! The next step is to invite some friends and have fun! :)
<br/>
<br/>

## APIs
Here are the used APIs documentation which I followed for this project:
<br/><b>socket.io</b> client API: https://socket.io/docs/client-api/
<br/><b>socket.io</b> server API: https://socket.io/docs/server-api/
<br/><b>express</b> API: http://expressjs.com/en/api.html
<br/><b>jQuery</b> API: https://api.jquery.com/
<br/>
<br/>

## Disclaimer
This is my first time doing anything that looks like web development, so I hold no responsabilities for bad usage or bad practises learnt by reading the code in this repository. That being said, you are 100% free to use it for whatever you need, and I encourage you to learn node.js as it is a growing technology, easy to learn and very powerful.

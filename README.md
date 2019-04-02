# ant-server-webrtc-chat-room
This is n to n video chat room for ant media server. 

It is a simple webrtc group chat application that using Ant Media Server as SFU

![Room Page](https://image.prntscr.com/image/v41IqySTTsiAFggs17OP4Q.png)


Ant Media server installation
---------------------------------
Download the ant media server from [ANT MEDIA SERVER]

You can find installation guide on github [ANT GITHUB REPO]


INSTALLATION
---------------------------------
```
git clone git@github.com:Lethea/ant-server-webrtc-chat-room.git
```

 There is two project 
1. Nodejs Client : This includes index.html + ant websocket connect api ( antapi.js )
   * Ant server websocket api send publish / play request to the ant server 
   * Listen ant server websocket response 
   * Connect Nodejs server for chat room operation such as login / disconnect 
   
2. Nodejs Server : This provide login to chat room, listen events, messaging
   * This is for chatroom application
   * Allows user to login to the given room
   * Allows user to public chat
   * Listen login / disconnect event

On Nodejs Server Run Following Command
```

npm install --save express

npm install --save socket.io

```

CONFIGURATION
----------------------------------
As you know, webrtc isn't allowed when the page is not safe ( https )

Please install ssl to your ant server or proxy pass the request to the ant websocket 

Change the ant media websocket url in _**nodeclientjs/assets/js/antapi.js**_ with your own

```
var wsURL = "wss://my_ant_server_ip/WebRTCAppEE/websocket";
```

Change the nodejs websocket url in _**nodejsclient/index.html**_

```
var socketIoConnectionUrl = "https://10.6.1.136";
```
*By default, the nodejs application run on port 3000, 
define ssl to nodejs or proxy pass the 443 with socket.io path to 3000*

CONNECT TO CHAT ROOM
-----------------------------

```
cd nodejsserver

node videochat.js
```

Open your nodejsclient with https

````
https://your_web_server_ip/nodejsclient/index.html
````

Login Page

![Login Page](https://image.prntscr.com/image/6WweoH9eRKe7t1UOe_uMhw.png)

* Enter your nickname  (English Characters & Numbers without space required)
* Enter your Room Name (English Characters & Numbers without space required)

![Room Page](https://image.prntscr.com/image/v41IqySTTsiAFggs17OP4Q.png)


Note
-------------
For proxy pass you can use nginx as well

Features
-------------
- [x] Login 
- [x] Dynamic Chat Room
- [x] Text Chat
- [x] Play / Publish Implementation
- [x] PeerConnection / Icecandidate etc webrtc stuff implemented
- [x] Text Chat
- [ ] Selecting Camera / Microphone
- [ ] Publish Stream Button ( Now starting automatically )
- [ ] Ant Api Implementation for local user must be changed
- [ ] Token Play / Publish
- [ ] External Player Link For Hls Playback
- [ ] Typo Control
- [ ] Test
- [ ] Maybe Angular 2+ implementation will be good at client side


Contact
------------
````
Mail : emre.karatasoglu@hotmail.com
Phone / Whatsapp / Telegram : +90 532 346 67 79
Donate :   1HxYXXDNQen9kDHjdjPrHkj1xS64fkENes ( BTC )
           Ld8BNcvP69146jgT5hVbTzSsnL7q6WoUSg ( LTC ) 
           0x77935c829b0f12b05151ec7bce31d58a97f735e8 ( ETH ) 
````






[ANT GITHUB REPO]:https://github.com/ant-media/Ant-Media-Server
[ANT MEDIA SERVER]:https://antmedia.io/

# Pong
Simple pong game with js and html5. Based in https://www.youtube.com/watch?v=nl0KXCa5pJk tutorial. Physics fix for some buggy things, levels and sound added.
## Getting Started
1. Just open the html with the browser
2. Enable auto play sound in the browser. In firefox is Configuración>Privacidad y seguridad>Autoreproducción (do not forget to deactivate after playing, it may cause security issues). In chrome Configuración>Privacidad y Seguridad>Avanzada>Configuracion del sitio>Sonido
## Using nodejs to run a server and autoupdate:
1. run this command:
"npm install". 
This will install lite-server (defined in package.json), a static server that loads index.html in your default browser and auto refreshes it when application files change.
2. Start the local web server! run this command:
"npm start". 
Wait a second and index.html is loaded and displayed in your default browser served by your local web server!
### Prerequisites
Node.js, npm
## How to play
mouse controls the position of the player. Press P for pause, M for muting/unmuting sound. Moving the mouse from left to right rapidly just before hitting the ball will increase its speed, moving it from right to left will decrease it. Holding shift immobilizes the player to get stability, in order to perform the movements previously described. Press Q to teleport to backward/forward postition. Pres S to slow time.

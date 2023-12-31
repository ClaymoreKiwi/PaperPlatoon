DB PW: C9d11P5Bdc
link: https://claymorekiwiserver.claymorekiwi.repl.co - replit version 
github link : https://github.com/ClaymoreKiwi/PaperPlatoon
Youtube Link: https://www.youtube.com/watch?v=-uaPfkczMyM

Paper Platoon
This game is a simple survival game where the player gains points for surviving for longer and longer periods of time.
--------------------------------------------------------------------------------------------------------------------------
## PLAYER CONTROLS
the player can move and rotate:

# Keys:
W = forward movement
A = rotate left
S = backwards movement
D = rotate right
Left Shift = Sprint / speed up
space = shooting enemies

Enemies follow the player and, Players will die when they get caught by the enemies and the score will be saved as thier high score.
the player will then have the option to restart for a new high score

blue spheres are present in the level and are randomly placed every round to make spotting enemies and ammunition more challenging, as well as enemies spawning in random places faster and faster each spawn 
---------------------------------------------------------------------------------------------------------------------------
SERVER SET UP
## Note that Node.js needs to be installed as well as npm for this settup to work
## MP135 Computers
1. open nodejs CMD terminal
2. navigate to the root directory containing "index.js"
3. run npm i to install relevant modules
4. run node index.js
5. open browser and connect to localhost:3000

## Personal computers
1. open index.js in VS code
2. navigate to location of folder using - cd "location" - in the terminal
3. run npm i to install all modules
4. run node index.js
5. enter LocalHost:3000 in your URL in browser

the game is now playable locally
---------------------------------------------------------------------------------------------------------------------------
## file structure is as follows:

#ROOT
node_modules-
Public-
    -Animations
   		-gltf animation files go here
    
    -CSS
 		-external stylesheet comes here
    
    -Enemy
 		-enemy model/animation goes here

    -Fonts
		-otf fonts come here
    
    -HTML
		-HTML pages come here
    
    -Models
    	-player models and ammunition come here

    -Images
 		-images used for textures come here
 	   
    -js
		-models
 	   		-user Schema
		-req
			-HTML server request js files
 	-game js file
 
    -Models
		-player models and ammunition come here
    
    -Sounds
 		-all background music and SFX go here
    
-index.html
-.gitIgnore
-app.js
-package.json
-package-lock.json
-README

---------------------------------------------------------------------------------------------------------------------------
## Achievements
# prototype
* Game websites design (client-side only): has Introduction page, Login page, New user register page, 404 page, game loading page and game pages.
* Game assets: for example, character, landscape/environment and enemy design (if applicable).
* Game material design: light, texture, material for the game assets
* Game animation: animation of game assets
* Game interaction: user interaction with the game object
* Game UI: UI overlay on the web game for scores and life state etc.
* Game mechanism: Fully functioning user interface displaying player statistics (i.e. lives or health), scores and rewards / penalties.
* Responsive design: the web page and game are rendered according to the window size.
* Responsive design: the game page is rendered according to the window size.

# Final Key Points
* Game has a server side and correctly deployed using Node.js. 404 page is deployed correctly.
* Game websites are fully working with correct login, register web interface.
* Game websites are responsive to different screen sizes. All webpage code will need to be made with responsive implementation standards. Please check web page below for more information https://www.w3schools.com/html/html_responsive.asp 
* Data storage implementation - user login data is structured and saved on the server side.
* Data storage implementation - game score is structured and saved on the server side. 
* Game score for the players’ login data can be reloaded correctly. 
* Game data storage is secured and not able to be access without authentication. 
* Complicated landscape and visual effect display and with a good loading speed: For example, particles and use of instance. 
* Game level design: game level or difficulty increase as the user score increases. 
* Game audio: audio (music and sound) is working and can be used in the game. 
* Game is working on the latest Google Chrome web browser for both PC and mobile devices (including game UI interaction). 
* Has “Readme” documentation (Can be formatted in .txt or .doc ), clearly describe: how to play the game, the game project folder structure (database design if any) and the key points you have achieved.

# Advanced features
* User data is encrypted and stored securely on the server side
* Has database design and implementation for game data.
* Has a systematic game messaging design. Passing the data using suitable client-server communication methods in a correct way.
<br/>
<br/>
Fully ES6 Compliant

---------------------------------------------------------------------------------------------------------------------------
## Refrences

Paper Model:
sketchfab.com. (2022). Paper Karateka - Download Free 3D model by jigenMal. [online] Available at: https://sketchfab.com/3d-models/paper-karateka-55f03f9ad1c14dea87db2a4e37355e52 [Accessed 10 Oct. 2023].

Loading:
www.w3schools.com. (n.d.). How To Make a Loader. [online] Available at: https://www.w3schools.com/howto/howto_css_loader.asp.

Character controls:
simon, simonDev (2020). Simple Character Controller (using Three.js/JavaScript). [online] www.youtube.com. Available at: https://www.youtube.com/watch?v=EkPfhzIbp2g [Accessed 23 Oct. 2023].

Character camera:
Simon, S. (2020). Simple Third Person Camera (using Three.js/JavaScript). [online] www.youtube.com. Available at: https://www.youtube.com/watch?v=UuNPHOJ_V5o [Accessed 19 Oct. 2023]..

CodeDamn (2020). Node.js Register and Login Tutorial | Work with MongoDB, JWT and Node. [online] www.youtube.com. Available at: https://www.youtube.com/watch?v=b91XgdyX-SM&t [Accessed 8 Nov. 2023].

codedamn (2020). MongoDB + Mongoose + Node.js Crash Course | CRUD and fundamentals of MongoDB. [online] www.youtube.com. Available at: https://www.youtube.com/watch?v=5QEwqX5U_2M&t [Accessed 20 Dec. 2023].

Pixabay (n.d.). Merx (Market Song). [online] pixabay. Available at: https://pixabay.com/sound-effects/merx-market-song-33936/.

Pixabay (n.d.). Whoosh. [online] Pixabay. Available at: https://pixabay.com/sound-effects/whoosh-6316/.

Pixabay (n.d.). Crumple-03. [online] Pixabay. Available at: https://pixabay.com/sound-effects/crumple-03-40747/.
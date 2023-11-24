DB PW: C9d11P5Bdc
link: https://mywebgame--claymorekiwi.repl.co/html/Game.html - continued progress
github link : https://github.com/ClaymoreKiwi/PaperPlatoon

Paper Platoon
This game is a simple survival game where the player gains points for surviving for longer and longer periods of time.
--------------------------------------------------------------------------------------------------------------------------
PLAYER CONTROLS
the player can move and rotate:

Keys:
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
open app.js in VS code
navigate to location of folder using cd "location" in teh terminal
run npm i to install all modules
run node app.js
server is running on local host 3000
in web broweser
enter LocalHost:3000 in your URL

the game is now playable locally
---------------------------------------------------------------------------------------------------------------------------
file structure is as follows:

#ROOT
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
 	-all javascrip files come here
 
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
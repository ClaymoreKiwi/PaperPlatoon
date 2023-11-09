Paper Platoon

This game is a simple survival game where the player gains points for surviving for longer and longer periods of time.
--------------------------------------------------------------------------------------------------------------------------
PLAYER CONTROLS

the player can move and rotate:
Keys:

W = Forward
S = Backward
A = rotate left
D = rotate right
Left Shift = Sprint / speed up
space = shooting enemies

Enemies follow the player and, Players will die when they get caught by the enemies and the score will be saved as thier high score.

the player will then have the option to restart for a new high score 
---------------------------------------------------------------------------------------------------------------------------

SERVER SET UP

open app.js in root
navigate to location of folder using cd "location"
run node app.js
server is running on local hoast 8080

in web broweser
enter LocalHoast:8080 in your URL

the game is now playable locally
---------------------------------------------------------------------------------------------------------------------------
file structure is as follows:
#ROOT
Public-
 	 -Animations
   	 -gltf animation files go here
    
 	 -CSS
 	   - external stylesheet comes here
    
 	 -Enemy
 	   - enemy model/animation goes here
    
 	 -Fonts
	    -otf fonts come here
    
	  -HTML
	    - HTML pages come here
    
	  -Images
 	   - images used for textures come here
 	   
 	 -js
 	   - all javascrip files come here
 	   
	  -Models
	    - player models and ammunition come here
    
	  -Sounds
 	   -all background music and SFX go here
    
	index
.gitIgnore
app
package.json
package-lock.json
README

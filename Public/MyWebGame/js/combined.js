import * as THREE from 'three';
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';

class CharacterController {
  constructor(params) {
    this.init(params);
  }

  init(params) {
    this.params = params;
    this.slowDown = new THREE.Vector3(-0.0005, -0.0001, -5.0);
    this.acceleration = new THREE.Vector3(1, 0.25, 50.0);
    this.velocity = new THREE.Vector3(0, 0, 0);
    this.position = new THREE.Vector3();
    this.animationsS = {};
    this.ammunition = 10;
    this.isFiring = false;
    this.score = 0;
    this.input = new CharacterControllerInput();

    this.LoadModels();
  }

  LoadModels() {
    const loader = new GLTFLoader();
    loader.load('../Models/character.gltf', (gltf) => {
      this.model = gltf.scene;

      this.model.scale.setScalar(1);
      this.model.traverse(c => {
        if (c.isMesh) {
          c.castShadow = true;
        }
      });

      this.target = this.model;
      this.params.scene.add(this.target);
    });
  }

  get Position() {
    return this.position;
  }

  get Rotation() {
    if (!this.target) {
      return new THREE.Quaternion();
    }
    return this.target.quaternion;
  }

  get Direction() {
    return this.velocity.clone().normalize();
  }


  shoot(){
      if (this.ammunition > 0 && !this.isFiring) {
        this.ammunition -= 1;
        this.isFiring = true;

        const bullet = new Bullet(this.params.scene, this.target);
        bullet.shoot();
        this.bullet = bullet;
        // Set a timeout to reset the firing state after a delay
        setTimeout(() => {
          this.isFiring = false;
        }, 400);
      }
  }

  update(timeInSeconds) {
    if (!this.target) {
      return;
    }

   // document.addEventListener('mousedown', function() { this.ammunition--; });
    const velocity = this.velocity;
    const frameDeceleration = new THREE.Vector3(
      velocity.x * this.slowDown.x,
      velocity.y * this.slowDown.y,
      velocity.z * this.slowDown.z
    );

    frameDeceleration.multiplyScalar(timeInSeconds);
    frameDeceleration.z = Math.sign(frameDeceleration.z) * Math.min(Math.abs(frameDeceleration.z), Math.abs(velocity.z));
    frameDeceleration.x = Math.sign(frameDeceleration.x) * Math.min(Math.abs(frameDeceleration.x), Math.abs(velocity.x));

    velocity.add(frameDeceleration);

    const controlObject = this.target;
    const Q = new THREE.Quaternion();
    const A = new THREE.Vector3();
    const R = controlObject.quaternion.clone();

    const acc = this.acceleration.clone();
    if (this.input.keys.shift) {
      acc.multiplyScalar(2.0);
    }
    if (this.input.keys.forward) {
      velocity.z += acc.z * 4 * timeInSeconds;
    }
    if (this.input.keys.backward) {
      velocity.z -= acc.z * 4 * timeInSeconds;
    }
    if (this.input.keys.left) {
      //velocity.x += acc.x * 6 * timeInSeconds;
      A.set(0, 1, 0);
      Q.setFromAxisAngle(A, 4.0 * Math.PI * timeInSeconds * this.acceleration.y);
      R.multiply(Q);
    }
    if (this.input.keys.right) {
      //velocity.x -= acc.x * 6 * timeInSeconds;
      A.set(0, 1, 0);
      Q.setFromAxisAngle(A, 4.0 * -Math.PI * timeInSeconds * this.acceleration.y);
      R.multiply(Q);
    }

    if (this.input.keys.space) {
      this.shoot();
    }
    if(this.bullet)
    {
      this.bullet.update(timeInSeconds);
    }
  
    //set the new position of the character after copying R
    controlObject.quaternion.copy(R);

    const oldPosition = new THREE.Vector3();
    oldPosition.copy(controlObject.position);

    //set the direction of the forward movement 
    const forward = new THREE.Vector3(0, 0, 1);
    //apply a rotation using quaternion so that the movement is aligned with the forward vector
    forward.applyQuaternion(controlObject.quaternion);
    forward.normalize();

    //set the sideways rotation
    const sideways = new THREE.Vector3(1, 0, 0);
    //apply a rotation using quaternion so that the movement is aligned with the sideways vector
    sideways.applyQuaternion(controlObject.quaternion);
    sideways.normalize();

    forward.multiplyScalar(velocity.z * timeInSeconds);
    sideways.multiplyScalar(velocity.x * timeInSeconds);

    controlObject.position.add(forward);
    controlObject.position.add(sideways);

    this.position.copy(controlObject.position);

    if (this.mixer) {
      this.mixer.update(timeInSeconds);
    }
  }
}

class Bullet {
  constructor(scene, player) {
    this.scene = scene;
    this.player = player;
    this.bullets = [];
  }

  shoot() {
    // Create a new bullet
    const geometry = new THREE.SphereGeometry(2, 32, 32);
    const material = new THREE.MeshStandardMaterial({ color: 0xAAAAAA });
    const bullet = new THREE.Mesh(geometry, material);

    // Set the initial position and direction
    bullet.position.copy(this.player.position).add(new THREE.Vector3(0,10,0));

    // Ensure the player has a valid rotation quaternion
    if (this.player.rotation) {
      const direction = new THREE.Vector3(0, 0, 1);
      direction.applyQuaternion(this.player.quaternion);

      //set the velocity
      bullet.velocity = direction.clone().multiplyScalar(20);
    } else {
      console.warn('Player rotation is not valid.');
      bullet.velocity = new THREE.Vector3(0, 0, 1);
    }

    // Add the bullet to the scene
    this.scene.add(bullet);

    // Store the bullet for later updates
    this.bullets.push(bullet);
  }

  update(timeInSeconds) {
    for (const bullet of this.bullets) {
      // Update the bullet's position
      bullet.position.add(bullet.velocity.clone().multiplyScalar(timeInSeconds));
    }
  }
}

//has all the flags for the directional movement
class CharacterControllerInput {
  constructor() {
    this.init();
  }
  //set up flags default to false and add in event listener for those keystates
  init() {
    this.keys = {
      forward: false,
      backward: false,
      left: false,
      right: false,
      shift: false,
      space: false
    };
    
    //console.log(this.ammunition);
    document.addEventListener('keydown', (event) => this.onKeyDown(event), false);
    document.addEventListener('keyup', (event) => this.onKeyUp(event), false);
    document.addEventListener('touchstart',(event) => this.TouchEvent(event), false);
    document.addEventListener('touchend',(event) => this.TouchEvent(event), false);

  }
  //set flaggs based on the keystate down
  onKeyDown(event) {
    switch (event.keyCode) {
      case 87: //w
        this.keys.forward = true;
        break;
      case 83: //s
        this.keys.backward = true;
        break;
      case 65: //a
        this.keys.left = true;
        break;
      case 68: //d
        this.keys.right = true;
        break;
      case 16: //shift
        this.keys.shift = true;
        break;
        case 32: //shift
        this.keys.space = true;
        break;
    }
  }
  //set flags back to false once the keystate is up
  onKeyUp(event) {
    switch (event.keyCode) {
      case 87: //w
        this.keys.forward = false;
        break;
      case 83: //s
        this.keys.backward = false;
        break;
      case 65: //a
        this.keys.left = false;
        break;
      case 68: //d
        this.keys.right = false;
        break;
      case 16: //shift
        this.keys.shift = false;
        break;
        case 32: //shift
        this.keys.space = false;
        break;
    }
  }
    // Handle touchstart events for virtual buttons
    TouchEvent() {
        moveForwardButton.addEventListener('touchstart', () => {
          // Handle touch start for moving forward
          this.keys.forward = true;
        });

        moveForwardButton.addEventListener('touchend', () => {
          // Handle touch end for moving forward
            this.keys.forward = false;
        });

        moveBackwardButton.addEventListener('touchstart', () => {
          // Handle touch start for moving backward
            this.keys.backward = true;
        });

        moveBackwardButton.addEventListener('touchend', () => {
          // Handle touch end for moving backward
            this.keys.backward = false;
        });
        turnLeft.addEventListener('touchstart', () => {
          // Handle touch start for Turning Left
            this.keys.left = true;
        });
  
        turnLeft.addEventListener('touchend', () => {
          // Handle touch end for turning left
            this.keys.left = false;
        });
        turnRight.addEventListener('touchstart', () => {
          // Handle touch start for Turning right
            this.keys.right = true;
        });
  
        turnRight.addEventListener('touchend', () => {
          // Handle touch end for Turning right
            this.keys.right = false;
        });
        
        sprintButton.addEventListener('touchstart', () => {
          // Handle touch start for sprinting
            this.keys.shift = true;
        });
  
        sprintButton.addEventListener('touchend', () => {
          // Handle touch end for sprinting
          this.keys.shift = false;
        });
        shootButton.addEventListener('touchstart', () => {
          // Handle touch start for shooting
            this.keys.space = true;
        });
  
          shootButton.addEventListener('touchend', () => {
          // Handle touch end for shooting
            this.keys.space = false;
        });
    }
  }

//camera positioning to the player
class ThirdPersonCamera {
  constructor(params) {
    this.params = params;
    this.camera = params.camera;

    this.currentPosition = new THREE.Vector3();
    this.currentLookat = new THREE.Vector3();
  }

  CalculateIdealOffset() {
    const idealOffset = new THREE.Vector3(-15, 20, -30);
    idealOffset.applyQuaternion(this.params.target.Rotation);
    idealOffset.add(this.params.target.Position);
    return idealOffset;
  }

  CalculateIdealLookat() {
    const idealLookat = new THREE.Vector3(0, 10, 50);
    idealLookat.applyQuaternion(this.params.target.Rotation);
    idealLookat.add(this.params.target.Position);
    return idealLookat;
  }

  update(timeElapsed) {
    const idealOffset = this.CalculateIdealOffset();
    const idealLookat = this.CalculateIdealLookat();

    const l = 1.0 - Math.pow(0.001, timeElapsed);

    this.currentPosition.lerp(idealOffset, l);
    this.currentLookat.lerp(idealLookat, l);

    this.camera.position.copy(this.currentPosition);
    this.camera.lookAt(this.currentLookat)
  }
}

//add walls for the player
class WallManager {
  constructor(scene) {
    this.scene = scene;
    this.minHeight = 10;
    this.maxHeight = 30;
    this.walls = [];
    this.speeds = [];
    this.startTimes = [];
  }

  createWall(geometry, initialPosition, numberOfCubes, offset, orientation, speed) {

    //loop through the walls passed in in load Game
    for (let i = 0; i < numberOfCubes; i++) {
      const material = this.getRandomMaterial(); //texture assignment
      const wall = new THREE.Mesh(geometry, material); // create a new wall with that texture
      const randomHeight = Math.random() * (this.maxHeight - this.minHeight) + this.minHeight; // set a random height
      const position = initialPosition.clone().add(new THREE.Vector3( // set the wall position
        //dependong on the orientation add walls along the edge of the plane with a given offset
        orientation === 'x' ? i * offset : 0, // X-axis position
        randomHeight, // Half the cube height
        orientation === 'z' ? i * offset : 0  // Z-axis position
      ));

      //position the wall 
      wall.position.copy(position);
      //scale the wall
      wall.scale.setY(randomHeight / 10);
      //add wall to array
      this.walls.push(wall);
      //add the wall to teh scene
      this.scene.add(wall);
      //add the speed of the occilation to the speed array
      this.speeds.push(speed);
      this.startTimes.push(performance.now());
    }
  }

  update() {
    const currentTime = performance.now();
    //move the walls in the array
    this.walls.forEach((wall, index) => { // go through each all in the array
      const elapsedTime = currentTime - this.startTimes[index]; // get the elapsed time and subtract the start time
      const range = this.maxHeight - this.minHeight; // set the range by the max width and height
      const y = (Math.sin((elapsedTime / this.speeds[index]) + (index * 0.2)) * 0.5 + 0.5) * range + this.minHeight;
      wall.position.setY(y); // set position by the sin wave calculation
    });
  }

  //an array of materials for the wall
  getRandomMaterial() {
    const materials = [
      new THREE.TextureLoader().load('../images/paper_blue.png'),
      new THREE.TextureLoader().load('../images/paper_green.png'),
      new THREE.TextureLoader().load('../images/paper_red.png'),
      new THREE.TextureLoader().load('../images/paperborder.png'),
      new THREE.TextureLoader().load('../images/paper_yellow.png'),
    ];
    //assignment of random texture based off the array index
    const randomTexture = materials[Math.floor(Math.random() * materials.length)];
    //return that indexed item back to the material
    return new THREE.MeshStandardMaterial({ map: randomTexture });
  }
}

//raycast collisions for the walls and the player
class RaycastCollision {
  constructor(player, wallManager, enemies, sound) {
    this.player = player;
    this.wallManager = wallManager;
    this.raycaster = new THREE.Raycaster(undefined, undefined, 0, 10);
    this.direction = player.Direction;
    this.spawner = enemies;
    this.sound = sound;
  }

  checkCollision() {
    // Create a direction vector pointing along the local Z-axis
    const localDirection = new THREE.Vector3(0, 0, 1);

    // Set the ray's origin to the player's position
    this.raycaster.ray.origin.copy(this.player.Position);
    const playerQuaternion = this.player.Rotation; // player rotation returns Quaternion

    if (this.player.velocity.z > 0) {
      const worldDirection = localDirection.clone().applyQuaternion(playerQuaternion);
      this.raycaster.ray.direction.copy(worldDirection).normalize();
      //console.log(worldDirection);
    }

    if (this.player.velocity.z < 0) {
      //creating another quaternion to rotate the ray in the opposite direction
      const flipRotation = new THREE.Quaternion();
      flipRotation.setFromAxisAngle(new THREE.Vector3(0, 1, 0), Math.PI); // Rotate 180 degrees around the Y axis
      const playerQuaternionRotated = playerQuaternion.clone().multiply(flipRotation); // Apply the 180-degree rotation
      const worldDirection = localDirection.clone().applyQuaternion(playerQuaternionRotated);
      this.raycaster.ray.direction.copy(worldDirection).normalize();
      //console.log(worldDirection);
    }
    // Check for intersections with objects in the scene
    const wallIntersections = this.raycaster.intersectObjects(this.wallManager.walls, true);
    //the models are loaded asynchronosly so we catch the error while the model is still loading
    try{ 
    this.enemyIntersections = this.raycaster.intersectObjects(this.spawner.enemies.map(enemy => enemy.model), true);
    }
    catch{/*console.log("waiting for model layer to load");*/}

    if (wallIntersections.length > 0) {
      //console.log("Raycast Hit");
      if (this.player.velocity.z > 0) {
        //take away velocity when the player approaches the wall in a forward manner
        this.player.velocity.z -= 25;
      }
      if (this.player.velocity.z < 0) {
        //add velocity when player is moving in a backward manner
        this.player.velocity.z += 15;
      }
    }
    if (this.enemyIntersections.length > 0) {
      this.sound.play();
      location.reload(); // place holder for death of the player
    }
  }
}

//particle system
class partilceSystem{
  constructor(){
    
  }
  init(){
  const radius = 7;
  const widthSegments = 12;
  const heightSegments = 8;
  const geom = new THREE.SphereGeometry(radius, widthSegments, heightSegments);
  const mats = new THREE.PointsMaterial({color: 'red', size: 0.5});

  const points = new THREE.Points(geom, mats);
  this.scene.add(points);
  }
}

//enemy logic
class Enemy {
  constructor(scene, position, scale = 1, player) {
    this.scene = scene;
    this.position = position;
    this.scale = scale;
    this.model = null;
    this.player = player;
    this.forwardDirection = new THREE.Vector3(0, 0, 1);

    this.loadModel();
  }

  loadModel() {
      const loader = new GLTFLoader();
      //passing the animated model into the loader
      loader.load('../enemy/enemy-running.gltf', (gltf) => {
        this.model = gltf.scene; // setting the model to the gltf argument
        this.model.scale.setScalar(this.scale); //setting the scale of the model (from spawner)
        this.model.position.copy(this.position); //setting the position of the model (from spawner)
        this.scene.add(this.model); // finally adding to the scene

        if (gltf.animations && gltf.animations.length > 0) { //check the frames of the file are greater than 0
          this.mixer = new THREE.AnimationMixer(this.model); // create a new mixer
          gltf.animations.forEach((clip) => { 
            this.mixer.clipAction(clip).play();// go through each clip in sequence to animate 
          });
        }
    });
  }
  followPlayer()
  {
    if (!this.model || !this.player) {
      return;
    }
    const speed = Math.random() * (0.8 - 0.2) + 0.2;
    // Calculate the direction vector from the enemy to the player
    const direction = new THREE.Vector3();
    direction.subVectors(this.player.Position, this.model.position).normalize();

    // Calculate the Y-axis rotation angle
    const angle = Math.atan2(direction.x, direction.z);

    // Update the enemy's rotation
    this.model.rotation.y = angle;

    // Calculate the forward direction vector based on the updated rotation
    this.forwardDirection.set(0, 0, 1); // Reset to the initial forward direction
    this.forwardDirection.applyAxisAngle(new THREE.Vector3(0, 1, 0), angle); // calculate that direction based on its new rotation

    // Update the enemy's position to approach the player
    this.model.position.add(this.forwardDirection.clone().multiplyScalar(speed));
  }
  
  lookAtPlayer(){
    if(!this.model)
    {
      return;
    }
    // Calculate the direction vector from the enemy to the player
    const direction = new THREE.Vector3();
    direction.subVectors(this.player.Position, this.model.position).normalize();

    const angle = Math.atan2(direction.x, direction.z);

    this.model.rotation.y = angle;
  }
  
  update(deltaTime) {
    if (this.mixer) {
      //using time to update the animation frames
      this.mixer.update(deltaTime);
    }
    if(this.model)
    {
    this.lookAtPlayer();
    this.followPlayer();
    }
  }
}

//enemy spawner
class EnemySpawner {
  constructor(scene, player) {
    this.init(scene, player);
  }
  init(scene, player)
  {
    this.scene = scene;
    this.enemies = [];
    this.spawnTimer = 0;
    this.spawnInterval = 500;
    this.player = player;
    this.countdown = 1000;
  }

  spawn() {
    this.spawnTimer += 1;

    if (this.countdown > 0) {
      // Still in the countdown phase
      this.countdown -= 1;
    }
    else if (this.spawnTimer >= this.spawnInterval) {
      this.spawnTimer = 0;

      const enemy = new Enemy(this.scene, new THREE.Vector3(), 20, this.player);
      enemy.position.x = Math.random() * 500 - 250;
      enemy.position.z = Math.random() * 500 - 250;
      enemy.position = new THREE.Vector3(enemy.position.x, -8, enemy.position.z);

      this.enemies.push(enemy);
      console.log(this.spawnInterval);
      if (this.spawnInterval > 100) {
        // Gradually reduce the spawn interval
        this.spawnInterval *= 0.95;
      }
    }
  }

  update(deltaTime) {
    this.spawn();
    for (const enemy of this.enemies) {
      enemy.update(deltaTime);
    }
  }
}

// LoadGame class that calls the init function on construction
class LoadGame {
  constructor() {
    this.init();
  }

  init() {
    // Create a new scene
    this.scene = new THREE.Scene();
    
    // Create a new renderer for the world with specific parameters
    this.renderer = new THREE.WebGLRenderer({ antialias: true });
    this.renderer.setSize(window.innerWidth, window.innerHeight);
    this.renderer.setPixelRatio(window.devicePixelRatio);
    this.renderer.shadowMap.enabled = true;
    this.renderer.setClearColor(0x91fff8);

    // Add the renderer to the HTML body
    document.body.appendChild(this.renderer.domElement);

    // Add an event listener for window resize
    window.addEventListener('resize', () => { this.WindowResponse(); }, false);

    // Create a perspective camera with specific parameters
    this.camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 2000);
    this.camera.position.set(0, 100, 500);


    // Add directional light to the scene
    let light = new THREE.DirectionalLight(0xffffff, 1);
    light.position.set(20, 100, 10);
    light.target.position.set(0, 49, 0);
    light.castShadow = true;
    this.scene.add(light);

    // Add ambient light to the scene
    light = new THREE.AmbientLight(0xffffff, 1);
    this.scene.add(light);

    // Create a skydome with a texture
    const texture = new THREE.TextureLoader().load('../images/paper.jpg');
    const skyboxGeometry = new THREE.SphereGeometry(1000, 200, 50);
    const skyboxMaterial = new THREE.MeshBasicMaterial({ map: texture, side: THREE.DoubleSide });
    this.sky = new THREE.Mesh(skyboxGeometry, skyboxMaterial);
    this.sky.position.set(0, 50, 0);
    this.scene.add(this.sky);

    // Add a plane to the scene
    const paperb = new THREE.TextureLoader().load('../images/paperborder.png');
    const plane = new THREE.Mesh(
      new THREE.PlaneGeometry(500, 500, 1, 1),
      new THREE.MeshStandardMaterial({ map: paperb }));
    plane.castShadow = false;
    plane.receiveShadow = true;
    plane.rotation.x = -Math.PI / 2;
    plane.position.y = -8;
    this.scene.add(plane);

    // Create an instance of the WallBuilder class // collapsed in the braces
    this.wallBuilder = new WallManager(this.scene);

    //the orientations and sizes of the walls
    const wallGeometryZ = new THREE.BoxGeometry(30, 100, 10);
    const wallGeometryX = new THREE.BoxGeometry(10, 100, 30);

    //wall numbers to populate all the sides of the plane, offset so that they lign up directly next to eachother
    const numberOfwalls = 17;
    const offset = 30;

    //starting positions of the walls
    const initialPositionZ = new THREE.Vector3(-250, 42, 245);
    const initialPositionX = new THREE.Vector3(250, 42, -250);
    const initialPositionXL = new THREE.Vector3(-250, 42, -250);
    const initialPositionZL = new THREE.Vector3(-250, 42, -245);

    //create walls for each side with the correct proportions, and orientations - include a speed for the wall animations
    this.wallBuilder.createWall(wallGeometryZ, initialPositionZ, numberOfwalls, offset, 'x', 3000);
    this.wallBuilder.createWall(wallGeometryX, initialPositionX, numberOfwalls, offset, 'z', 2000);
    this.wallBuilder.createWall(wallGeometryX, initialPositionXL, numberOfwalls, offset, 'z', 4000);
    this.wallBuilder.createWall(wallGeometryZ, initialPositionZL, numberOfwalls, offset, 'x', 3000);
    
   this.previousAnim = null;
    // Load a 3D model
    this.loadAudio();
    this.loadAnimatedModel();
    //this.pointMats();
    this.animate();
  }

  loadAudio() {
    this.listener = new THREE.AudioListener();
    this.camera.add(this.listener);

    this.audioLoader = new THREE.AudioLoader();

    const backgroundSound = new THREE.Audio(this.listener);
    this.audioLoader.load('../sounds/Background_music_paper.mp3', (buffer) => {
      backgroundSound.setBuffer(buffer);
      backgroundSound.setLoop(true);
      backgroundSound.setVolume(0.1);
      backgroundSound.play();
    });

    this.deathSound = new THREE.Audio(this.listener);
    this.audioLoader.load('../sounds/death-sfx.mp3', (buffer) => {
    this.deathSound.setBuffer(buffer);
    this.deathSound.setLoop(false);
    this.deathSound.setVolume(1);
    });
  }

  loadAnimatedModel() {
    const params = {
      camera: this.camera,
      scene: this.scene,
      spawner: this.spawner,
    }
    //add player instance
    this.player = new CharacterController(params);
    
    //enemy spawner
    this.spawner = new EnemySpawner(this.scene, this.player);
    
    //third person camera instance
    this.thirdPersonCamera = new ThirdPersonCamera({ camera: this.camera, target: this.player });

    //check raycast for the player detection
    this.rayCast = new RaycastCollision(this.player, this.wallBuilder, this.spawner, this.deathSound);
  }

  // Update the camera and renderer size when the window is resized
  WindowResponse() {
    this.camera.aspect = window.innerWidth / window.innerHeight;
    this.camera.updateProjectionMatrix();
    this.renderer.setSize(window.innerWidth, window.innerHeight);
  }

  // Animate the scene
  animate() {
    requestAnimationFrame((t) => {
      if (this.previousAnim === null) {
        this.previousAnim = t;
      }
      if (this.player) {
        this.player.score++; 
        //update ammuniton and score
        document.getElementById('Score').textContent = `Score: ${Math.floor(this.player.score * 0.01)}`;
        document.getElementById('follow_player').textContent = `Paper: ${this.player.ammunition}`;
      }
      this.animate();
      this.renderer.render(this.scene, this.camera);
      this.wallBuilder.update();
      this.step(t - this.previousAnim);
      this.previousAnim = t;
      this.rayCast.checkCollision();
    });

  }

  // Step the animation
  step(timeElapsed) {
    const timeElapsedSec = timeElapsed * 0.001;

    if (this.player) {
      this.player.update(timeElapsedSec);
      this.spawner.update(timeElapsedSec);
    }
    this.thirdPersonCamera.update(timeElapsedSec);
  }
}

let APP = null
window.addEventListener('DOMContentLoaded', () => { APP = new LoadGame(); });


//Assetes Credits below


//Credit "paper_ball.gltf" - >>This work is based on "Paper Low" (https://sketchfab.com/3d-models/paper-low-bab9b0a4a3194165be4ac939c565d39f) by bargin_bill_bradly (https://sketchfab.com/bargin_bill_bradly) licensed under CC-BY-4.0 (http://creativecommons.org/licenses/by/4.0/)
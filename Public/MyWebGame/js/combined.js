import * as THREE from 'three';
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';
//import { OrbitControls } from 'three/addons/controls/OrbitControls.js';

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

      this.mixer = new THREE.AnimationMixer(this.target);

      this.manager = new THREE.LoadingManager();

      const onLoad = (animName, anim) => {
        const clip = anim.animations[0];
        const action = this.mixer.clipAction(clip);

        this.animationsS[animName] = {
          clip: clip,
          action: action,
        };
      };

      const loader = new GLTFLoader(this.manager);
      loader.load('../animations/jogging.gltf', (a) => { onLoad('walk', a); });
      loader.load('../animations/run.gltf', (a) => { onLoad('run', a); });
      loader.load('../animations/idle.gltf', (a) => { onLoad('idle', a); });
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

  shoot()
  {
    
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
      if (this.ammunition > 0 && !this.isFiring) {
        this.ammunition -= 1;
        this.isFiring = true;

        this.shoot();
        // Set a timeout to reset the firing state after a delay
        setTimeout(() => {
          this.isFiring = false;
        }, 400);
      }
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
};

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

    for (let i = 0; i < numberOfCubes; i++) {
      const material = this.getRandomMaterial();
      const wall = new THREE.Mesh(geometry, material);
      const randomHeight = Math.random() * (this.maxHeight - this.minHeight) + this.minHeight;
      const position = initialPosition.clone().add(new THREE.Vector3(
        orientation === 'x' ? i * offset : 0, // X-axis position
        randomHeight, // Half the cube height
        orientation === 'z' ? i * offset : 0  // Z-axis position
      ));

      wall.position.copy(position);
      wall.scale.setY(randomHeight / 10);
      this.walls.push(wall);
      this.scene.add(wall);
      this.speeds.push(speed);
      this.startTimes.push(performance.now());
    }
  }

  update() {
    const currentTime = performance.now();
    //move the walls in the array
    this.walls.forEach((wall, index) => {
      const elapsedTime = currentTime - this.startTimes[index];
      const range = this.maxHeight - this.minHeight;
      const y = (Math.sin((elapsedTime / this.speeds[index]) + (index * 0.2)) * 0.5 + 0.5) * range + this.minHeight;
      wall.position.setY(y);
    });
  }
  
  getRandomMaterial() {
    const materials = [
      new THREE.TextureLoader().load('../images/paper_blue.png'),
      new THREE.TextureLoader().load('../images/paper_green.png'),
      new THREE.TextureLoader().load('../images/paper_red.png'),
      new THREE.TextureLoader().load('../images/paperborder.png'),
      new THREE.TextureLoader().load('../images/paper_yellow.png'),
    ];
    const randomTexture = materials[Math.floor(Math.random() * materials.length)];
    return new THREE.MeshStandardMaterial({ map: randomTexture });
  }
}

//raycast collisions for the walls and the player
class RaycastCollision {
  constructor(player, wallManager) {
    this.player = player;
    this.wallManager = wallManager;
    this.raycaster = new THREE.Raycaster(undefined, undefined, 0, 10);
    this.direction = player.Direction;
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

    // Check for intersections with walls
    const intersections = this.raycaster.intersectObjects(this.wallManager.walls, true);

    if (intersections.length > 0) {
      // Collision occurred, handle it here
      //console.log("Raycast Hit");
      if (this.player.velocity.z > 0) {
        //take away velocity when the player approaches the wall in a forward manner
        this.player.velocity.z -= 25;
      }
      if (this.player.velocity.z < 0) {
        //add velocity when player is movin gin a backward manner
        this.player.velocity.z += 15;
      }
    }
  }

}

class Enemy {
  constructor(scene, position, scale = 1, player) {
    this.scene = scene;
    this.position = position;
    this.scale = scale;
    this.model = null;
    this.player = player;
    
    this.loadModel();
  }
  followPlayer() {
    // Calculate the direction from the enemy to the player
    const direction = new THREE.Vector3();
    direction.subVectors(this.player.position, this.position);
    direction.normalize();

    // Define a speed at which the enemy should follow the player
    const followSpeed = 5;
    //console.log(this.position.z);
    // Update the enemy's position to move towards the player
    this.position.add(direction.clone().multiplyScalar(followSpeed));
  }

  loadModel() {
    const loader = new GLTFLoader();

    loader.load('../enemy/enemy-running.gltf', (gltf) => {
      this.model = gltf.scene;

      // Set the scale of the model
      this.model.scale.setScalar(this.scale);

      // Set the position of the model
      this.model.position.copy(this.position);

      //console.log(this.model);
      // Add the model to the scene
      this.scene.add(this.model);

      // Check for animations in the loaded model
      if (gltf.animations && gltf.animations.length > 0) {
        this.mixer = new THREE.AnimationMixer(this.model);

        // Add all animations to the mixer
        gltf.animations.forEach((clip) => {
          this.mixer.clipAction(clip).play();
        });
      }
    });
  }
  update(deltaTime) {
    if (this.mixer) {
      //using time to update the animation frames
      this.mixer.update(deltaTime);
    }
  }
}

// LoadGame class that calls the init function on construction
class LoadGame {
  constructor() {
    this.init();
  }

  init() {
    this.textPosition = new THREE.Vector3();
    // Create a new renderer for the world with specific parameters
    this.renderer = new THREE.WebGLRenderer({ antialias: true });
    this.renderer.shadowMap.enabled = true;
    this.renderer.setPixelRatio(window.devicePixelRatio);
    this.renderer.setClearColor(0x91fff8);
    this.renderer.setSize(window.innerWidth, window.innerHeight);
    
    // Add the renderer to the HTML body
    document.body.appendChild(this.renderer.domElement);
    
    this.followtxt = document.getElementById('follow_player');
    document.getElementById('follow_player').textContent = `Paper: ${this.ammunition}`;
    document.getElementById('Score').textContent = `Score: ${this.score}`;
    this.canvas = document.querySelector('canvas');

    // Add an event listener for window resize
    window.addEventListener('resize', () => { this.WindowResponse(); }, false);

    // Create a perspective camera with specific parameters
    this.camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 2000);
    this.camera.position.set(0, 100, 500);

    // Create a new scene
    this.scene = new THREE.Scene();

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
    {
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
    }
    
   this.previousAnim = null;
    // Load a 3D model
    this.loadAnimatedModel();
    this.loadAudio();
    this.animate();
  }

  loadAudio() {
    this.listener = new THREE.AudioListener();
    this.camera.add(this.listener);

    this.audioLoader = new THREE.AudioLoader();

    const backgroundSound = new THREE.Audio(this.listener);

    this.audioLoader.load('../sounds/Background_music_paper.mp3', (buffer) => {
      backgroundSound.setBuffer(buffer); // Use 'backgroundSound' here
      backgroundSound.setLoop(true);
      backgroundSound.setVolume(0.2);
      //backgroundSound.play();
    });
  }

  loadAnimatedModel() {
    const params = {
      camera: this.camera,
      scene: this.scene,
    }
    
    this.controls = new CharacterController(params);
    
    //enemy model test
    const enemyPosition = new THREE.Vector3(50, -8, 0);
    this.model = new Enemy(this.scene, enemyPosition, 20, this.controls);
    
    //third person camera instance
    this.thirdPersonCamera = new ThirdPersonCamera({ camera: this.camera, target: this.controls });

    this.rayCast = new RaycastCollision(this.controls, this.wallBuilder);
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
      if (this.controls) {
        this.controls.score++;
        this.textPosition.copy(this.controls.Position);
        this.textPosition.project(this.camera);
        let widthHalf = this.canvas.width / 2;
        let heightHalf = this.canvas.height / 2;
        const rect = this.canvas.getBoundingClientRect();
        this.textPosition.x = rect.left + (this.textPosition.x * widthHalf) + widthHalf;
        this.textPosition.y = rect.top - (this.textPosition.y * heightHalf) + heightHalf;

        this.followtxt.style.top = `${this.textPosition.y}px`;
        this.followtxt.style.left = `${this.textPosition.x}px`; 
        document.getElementById('Score').textContent = `Score: ${Math.floor(this.controls.score * 0.01)}`;
         document.getElementById('follow_player').textContent = `Paper: ${this.controls.ammunition}`;
        
      }
      this.animate();
      this.model.followPlayer();
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

    if (this.controls) {
      this.controls.update(timeElapsedSec);
    }
    this.thirdPersonCamera.update(timeElapsedSec);
    this.model.update(timeElapsedSec);
  }
}

let APP = null
window.addEventListener('DOMContentLoaded', () => { APP = new LoadGame(); });

//Assetes Credits below


//Credit "paper_ball.gltf" - >>This work is based on "Paper Low" (https://sketchfab.com/3d-models/paper-low-bab9b0a4a3194165be4ac939c565d39f) by bargin_bill_bradly (https://sketchfab.com/bargin_bill_bradly) licensed under CC-BY-4.0 (http://creativecommons.org/licenses/by/4.0/)
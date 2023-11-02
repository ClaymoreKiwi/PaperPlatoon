//THREE.js lib imports 
import * as THREE from 'three';
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';

//external js files from project imports
import CharacterController from './characterController.js';
import ThirdPersonCamera from './thirdPersonCamera.js';

// LoadGame class that calls the init function on construction
class LoadGame {
  constructor() {
    // Call the init function when a LoadGame object is created
    this.init();
  }

  // Initialize the main scene of the game
  init() {
    // Create a new renderer for the world with specific parameters
    this.renderer = new THREE.WebGLRenderer({ antialias: true });
    this.renderer.shadowMap = true;
    this.renderer.setPixelRatio(window.devicePixelRatio);
    this.renderer.setClearColor(0x91fff8);
    this.renderer.setSize(window.innerWidth, window.innerHeight);

    // Add the renderer to the HTML body
    document.body.appendChild(this.renderer.domElement);

    // Add an event listener for window resize
    window.addEventListener('resize', () => { this.WindowResponse(); }, false);

    // Create a perspective camera with specific parameters
    this.camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 2000);
    this.camera.position.set(25, 10, 25);

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

    // Create OrbitControls
    const controls = new OrbitControls(this.camera, this.renderer.domElement);
    controls.target.set(0, 20, 0);
    controls.update();

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
      new THREE.PlaneGeometry(500, 500, 10, 10),
      new THREE.MeshStandardMaterial({ map: paperb }));
    plane.castShadow = false;
    plane.receiveShadow = true;
    plane.rotation.x = -Math.PI / 2;
    plane.position.y = -8;
    this.scene.add(plane);

    this.mixers = [];
    this.previousAnim = null;

    // Load a 3D model
    this.loadAnimatedModel();
    this.animate();
  }

  loadAnimatedModel()
  {
    const params = {
      camera: this.camera,
      scene: this.scene,
    }
    this.controls = new CharacterController(params);

    //third person camera instance
    this.thirdPersonCamera = new ThirdPersonCamera({camera: this.camera, target: this.controls});
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
      if(this.previousAnim === null){
        this.previousAnim = t;
      }
      this.animate();
      
      this.renderer.render(this.scene, this.camera);
      this.step(t = this.previousAnim);
      this.previousAnim = t;
    });

  }

  // Step the animation
  step(timeElapsed){
    const timeElapsedSec = timeElapsed * 0.001;
    if(this.mixers){
      this.mixers.map(m => m.update(timeElapsedSec));
    }
    if(this.controls){
      this.controls.update(timeElapsedSec);
    }

    this.thirdPersonCamera.update(timeElapsedSec);
  }
}

let APP = null
window.addEventListener('DOMContentLoaded', () => { APP = new LoadGame(); });

//Assetes Credits below


//Credit "paper_ball.gltf" - >>This work is based on "Paper Low" (https://sketchfab.com/3d-models/paper-low-bab9b0a4a3194165be4ac939c565d39f) by bargin_bill_bradly (https://sketchfab.com/bargin_bill_bradly) licensed under CC-BY-4.0 (http://creativecommons.org/licenses/by/4.0/)
import * as THREE from 'three';
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';

class CharacterControllerProxy {
  constructor(animations) {
    this._animations = animations;
  }

  get animations() {
    return this._animations;
  }
};

export default class CharacterController {
  constructor(params) {
    this.init(params);
  }

  init(params) {
    this.params = params;

    this.slowDown = new THREE.Vector3(-0.0005, -0.0001, -5.0);
    this.acceleration = new THREE.Vector3(1, 0.25, 50.0);
    this.velocity = new THREE.Vector3(0, 0, 0);

    this.animations = {};
    this.input = new CharacterControllerInput();
    this.stateMachine = new CharacterStates(new CharacterControllerProxy(this.animations));

    this.LoadModels();
  }

  LoadModels() {
    const loader = new GLTFLoader();
    loader.load('../Models/character.gltf', (gltf) => {
      const model = gltf.scene;

      model.scale.setScalar(1);
      model.traverse(c => {
        if (c.isMesh) {
          c.castShadow = true;
        }
      });

      this.target = model;
      this.params.scene.add(this.target);

      this.mixer = new THREE.AnimationMixer(this.target);

      this.manager = new THREE.LoadingManager();
      this.manager.onLoad = () => {
        this.stateMachine.setState('idle');
      };

      const onLoad = (animName, anim) => {
        const clip = anim.animations[0];
        const action = this.mixer.clipAction(clip);

        this.animations[animName] = {
          clip: clip,
          action: action,
        };
      };

      const loader = new GLTFLoader(this._manager);
      loader.load('../animations/jogging.gltf', (a) => { onLoad('walk', a); });
      loader.load('../animations/run.gltf', (a) => { onLoad('run', a); });
      loader.load('../animations/idle.gltf', (a) => { onLoad('idle', a); });
    });
  }

  update(timeInSeconds) {
    if (!this.target) {
      return;
    }

    this.stateMachine.update(timeInSeconds, this.input);

    const velocity = this.velocity;
    const frameDeceleration = new THREE.Vector3(velocity.x * this.slowDown.x, velocity.y * this.slowDown.y, velocity.z * this.slowDown.z);
    frameDeceleration.multiplyScalar(timeInSeconds);
    frameDeceleration.z = Math.sign(frameDeceleration.z) * Math.min(Math.abs(frameDeceleration.z), Math.abs(this.acceleration.z));

    velocity.add(frameDeceleration);

    const controlObject = this.target;
    const Q = new THREE.Quaternion();
    const A = new THREE.Vector3();
    const R = controlObject.quaternion.clone();

    const acc = this.acceleration.clone();
    if (this.input.keys.forward) {
      velocity.z += acc.z * timeInSeconds;
    }
    if (this.input.keys.backward) {
      velocity.z -= acc.z * timeInSeconds;
    }
    if (this.input.keys.left) {
       velocity.x += acc.x * timeInSeconds;
      // A.set(0, 1, 0);
      // Q.setFromAxisAngle(A, 4.0 * Math.PI * timeInSeconds * this.acceleration.y);
      // R.multiply(Q);
      
    }
    if (this.input.keys.right) {
      velocity.x -= acc.x * timeInSeconds;
      // A.set(0, 1, 0);
      // Q.setFromAxisAngle(A, 4.0 * -Math.PI * timeInSeconds * this.acceleration.y);
      // R.multiply(Q);
    }
    //controlObject.quaternion.copy(R);

    const oldPosition = new THREE.Vector3();
    oldPosition.copy(controlObject.position);

    const forward = new THREE.Vector3(0, 0, 1);
    forward.applyQuaternion(controlObject.quaternion);
    forward.normalize();

    const sideways = new THREE.Vector3(1, 0, 0);
    sideways.applyQuaternion(controlObject.quaternion);
    sideways.normalize();

    sideways.multiplyScalar(velocity.x * timeInSeconds);
    forward.multiplyScalar(velocity.z * timeInSeconds);

    controlObject.position.add(forward);
    controlObject.position.add(sideways);

    oldPosition.copy(controlObject.position);

    if (this.mixer) {
      this.mixer.update(timeInSeconds);
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
      jump: false,
      shift: false,
    };

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
      case 32: //space
        this.keys.jump = true;
        break;
      case 16: //shift
        this.keys.shift = true;
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
      case 32: //space
        this.keys.jump = false;
        break;
      case 16: //shift
        this.keys.shift = false;
        break;
    }
  }
}

//statemachine to manage the states of the player
class StateMachine {
  constructor() {
    //innitialize the state machine and its states
    this.states = {};
    this.currentState = null;
  }
  //add a state to the state machine
  addState(name, type) {
    this.states[name] = type;
  }
  //set statemachine to a specific state
  setState(name) {
    const prevState = this.currentState;

    if (prevState) {
      if (prevState.name == name) {
        return;
      }
      prevState.exit();
    }

    const state = new this.states[name](this);

    this.currenState = state;
    state.enter(prevState);
  }
  update(timeElapsed, input) {
    if (this.currentState) {
      this.currentState.update(timeElapsed, input);
    }
  }
}

//state to manage the movement of the player
class CharacterStates extends StateMachine {
  constructor(proxy) {
    super();
    this.proxy = proxy;
    this.init();
  }

  init() {
    this.addState('run', RunState);
    this.addState('walk', WalkState);
    this.addState('idle', IdleState);
  }

}

//state super class for different states
class State {
  constuctor(parent) {
    this.parent = parent;
  }
  //some default methods to be overriden in the inherited classes
  enter() { }
  exit() { }
  update() { }
}

class WalkState extends State {
  constructor(parent) {
    super(parent);
  }

  get Name() {
    return 'walk';
  }

  enter(prevState) {
    const curAction = this.parent.proxy.animations['walk'].action;
    if (prevState) {
      const prevAction = this.parent.proxy.animations[prevState.Name].action;

      curAction.enabled = true;

      if (prevState.Name == 'run') {
        const ratio = curAction.getClip().duration / prevAction.getClip().duration;
        curAction.time = prevAction.time * ratio;
      } else {
        curAction.time = 0.0;
        curAction.setEffectiveTimeScale(1.0);
        curAction.setEffectiveWeight(1.0);
      }

      curAction.crossFadeFrom(prevAction, 0.5, true);
      curAction.play();
    } else {
      curAction.play();
    }
  }

  exit() {
  }

  update(timeElapsed, input) {
    if (input.keys.forward || input.keys.backward) {
      if (input.keys.shift) {
        this.parent.setState('run');
      }
      return;
    }

    this.parent.setState('idle');
  }
};

class RunState extends State {
  constructor(parent) {
    super(parent);
  }

  get Name() {
    return 'run';
  }

  Enter(prevState) {
    const curAction = this.parent.proxy.animations['run'].action;
    if (prevState) {
      const prevAction = this.parent.proxy.animations[prevState.Name].action;

      curAction.enabled = true;

      if (prevState.Name == 'walk') {
        const ratio = curAction.getClip().duration / prevAction.getClip().duration;
        curAction.time = prevAction.time * ratio;
      } else {
        curAction.time = 0.0;
        curAction.setEffectiveTimeScale(1.0);
        curAction.setEffectiveWeight(1.0);
      }

      curAction.crossFadeFrom(prevAction, 0.5, true);
      curAction.play();
    } else {
      curAction.play();
    }
  }

  Exit() {
  }

  Update(timeElapsed, input) {
    if (input.keys.forward || input.keys.backward) {
      if (!input.keys.shift) {
        this.parent.setState('walk');
      }
      return;
    }

    this.parent.setState('idle');
  }
};

class IdleState extends State {
  constructor(parent) {
    super(parent);
  }

  get Name() {
    return 'idle';
  }

  Enter(prevState) {
    const idleAction = this.parent.proxy.animations['idle'].action;
    if (prevState) {
      const prevAction = this.parent.proxy.animations[prevState.Name].action;
      idleAction.time = 0.0;
      idleAction.enabled = true;
      idleAction.setEffectiveTimeScale(1.0);
      idleAction.setEffectiveWeight(1.0);
      idleAction.crossFadeFrom(prevAction, 0.5, true);
      idleAction.play();
    } else {
      idleAction.play();
    }
  }

  Exit() {
  }

  Update(_, input) {
    if (input._keys.forward || input._keys.backward) {
      this.parent.setState('walk');
    }
  }
};
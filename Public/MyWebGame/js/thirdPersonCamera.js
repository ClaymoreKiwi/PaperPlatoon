import * as THREE from 'three';


export default class ThirdPersonCamera{
  constructor(params){
    this.params = params;
    this.camera = params.camera;

    this.currentPosition = new THREE.Vector3();
    this.currentLookat = new THREE.Vector3();
  }

  CalculateIdealOffset(){
    const idealOffset = new THREE.Vector3(-15,20,-30);
    idealOffset.applyQuaternion(this.params.target.Rotation);
    idealOffset.add(this.params.target.Position);
    return idealOffset;
  }

  CalculateIdealLookat(){
    const idealLookat = new THREE.Vector3(0,10, 50);
    idealLookat.applyQuaternion(this.params.target.Rotation);
    idealLookat.add(this.params.target.Position);
    return idealLookat;
  }

  update(timeElapsed){
    const idealOffest = this.CalculateIdealOffset();
    const idealLookat = this.CalculateIdealLookat();

    const l = 1.0 - Math.pow(0.001, timeElapsed);

    this.currenPosition.lerp(idealOffset, l);
    this.currentLookat.lerp(idealLookat, l);

    this.camera.position.copy(this.currentPosition);
    this.camera.lookAt(this.currentLookat)
  }
}
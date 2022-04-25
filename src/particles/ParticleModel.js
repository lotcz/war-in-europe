import * as THREE from "three";

export default class ParticleModel {

	constructor(position, scale, movement, lifetime, material) {
		this.lifetime = lifetime;
		this.movement = movement; // Vector3 distance per second
		this.mesh = new THREE.Sprite(material);
		this.mesh.position.set(position.x, position.y, position.z);
		this.mesh.scale.set(scale, scale, scale);
	}

}

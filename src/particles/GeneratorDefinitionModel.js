import * as THREE from "three";

export default class GeneratorDefinitionModel {

	constructor() {
		this.materialBase = null;
		this.materials = [];

		this.particleImage = 'image url or data';

		this.particlesPerSecond = 5;

		this.particleScale = 1;
		this.particleScaleSpread = 0.1; // new particles may be smaller or bigger
		this.particleScaleGrowth = 0.1; // particles will grow to 1.1 in one second, can be negative

		this.particlePositionSpread = new THREE.Vector3(0.1, 1, 0.1); // particles starting point offset

		this.particleMovement = new THREE.Vector3(1, 0.1, 0); // movement per second
		this.particleMovementSpread = new THREE.Vector3(0.1, 0.1, 0.1); // random movement change per second

		this.particleLifetime = 3; // in seconds
		this.particleLifetimeSpread = 1;

		this.particleFadeOutDuration = 1; // in seconds
	}

	getMaterial(opacity = 1) {
		if (!this.materialBase) {
			const texture = new THREE.Texture();
			texture.image = this.particleImage;
			texture.needsUpdate = true;
			texture.repeat.set(1, 1);
			texture.wrapS = THREE.RepeatWrapping;
			texture.wrapT = THREE.RepeatWrapping;
			this.materialBase = new THREE.SpriteMaterial({map: texture});
		}

		if (!this.materials[opacity]) {
			const mat = this.materialBase.clone();
			mat.opacity = opacity;
			this.materials[opacity] = mat;
		}

		return this.materials[opacity];
	}

}

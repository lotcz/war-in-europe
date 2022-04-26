import GeneratorDefinition from "./GeneratorDefinition";
import * as THREE from "three";

export default class GeneratorModel {

	constructor(definition, position = new THREE.Vector3()) {
		this.on = false;
		this.position = position; // particles starting point
		this.scale = 1;
		this.definition = definition || new GeneratorDefinition();

		this.particles = []; // array of ParticleModel
	}

}

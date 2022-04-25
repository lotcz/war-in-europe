import GeneratorDefinitionModel from "./GeneratorDefinitionModel";
import * as THREE from "three";

export default class GeneratorModel {

	constructor() {
		this.on = false;
		this.position = new THREE.Vector3(); // particles starting point
		this.scale = 1;
		this.definition = new GeneratorDefinitionModel();

		this.particles = []; // array of ParticleModel
	}

}

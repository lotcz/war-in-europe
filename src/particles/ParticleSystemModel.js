import * as THREE from "three";
import ParticleSystemDefinitionModel from "./ParticleSystemDefinition";

export default class ParticleSystemModel {

	constructor(definition, position = new THREE.Vector3()) {
		this.on = false;
		this.position = position; // particles starting point
		this.scale = 1;
		this.definition = definition || new ParticleSystemDefinitionModel();

		this.generators = []; // array of GeneratorModel

	}

}

import * as THREE from "three";
import { EffectComposer } from "three/examples/jsm/postprocessing/EffectComposer.js";
import { RenderPass } from "three/examples/jsm/postprocessing/RenderPass.js";
import { ShaderPass } from "three/examples/jsm/postprocessing/ShaderPass.js";
import { FXAAShader } from "three/examples/jsm/shaders/FXAAShader.js";

import ThreeScene from "../assets/scene.json";

export default class GameModel {


	constructor() {

		const loader = new THREE.ObjectLoader();
		const object = loader.parse( ThreeScene );
		this.scene = new THREE.Scene();
		this.scene.add( object );
		console.log(object);

		this.renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
		this.camera = new THREE.PerspectiveCamera(65,1.61, 1, 1000);

		this.composer = new EffectComposer(this.renderer);
		this.composer.addPass(new RenderPass(this.scene, this.camera));
		this.effectFXAA = new ShaderPass(FXAAShader);
		this.composer.addPass(this.effectFXAA);

	}

	onResize(width, height) {
		const aspect = width / height;
		if (aspect < 1.61) {
			height = width * 0.62;
		} else {
			width = height * 1.61;
		}

		const padding = 50;
		width = width - (2 * padding);
		height = height - (2 * padding * 0.62);

		this.renderer.setSize(width, height);
		this.composer.setSize(width, height);
		this.camera.aspect = width / height;
		this.camera.updateProjectionMatrix();

		const pixelRatio = this.renderer.getPixelRatio();
		this.effectFXAA.material.uniforms[ 'resolution' ].value.x = 1 / (  width * pixelRatio );
		this.effectFXAA.material.uniforms[ 'resolution' ].value.y = 1 / (  height * pixelRatio );
	}


}

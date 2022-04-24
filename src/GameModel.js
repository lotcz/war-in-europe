import * as THREE from "three";
import { EffectComposer } from "three/examples/jsm/postprocessing/EffectComposer.js";
import { RenderPass } from "three/examples/jsm/postprocessing/RenderPass.js";
import { ShaderPass } from "three/examples/jsm/postprocessing/ShaderPass.js";
import { FXAAShader } from "three/examples/jsm/shaders/FXAAShader.js";

import ThreeScene from "../assets/scene.json";
import EventManager from "./class/basic/EventManager";

export default class GameModel extends EventManager {

	constructor() {
		super();

		this.scene = new THREE.Scene();

		const loader = new THREE.ObjectLoader();
		const object = loader.parse( ThreeScene );

		this.scene.add( object );
		//console.log(object);
		this.ambient = this.scene.getObjectByName('AmbientLight');
		this.ambient.intensity = 0.25;
		this.center = this.scene.getObjectByName('Center');
		this.ukraine = this.scene.getObjectByName('Ukraine');
		this.kremlin = this.scene.getObjectByName('Kremlin');
		this.factory = this.scene.getObjectByName('Factory');
		this.money = this.scene.getObjectByName('Money');
		this.tank = this.scene.getObjectByName('Tank');
		this.refugees = this.scene.getObjectByName('Refugees');

		this.renderer = new THREE.WebGLRenderer({ antialias: false, alpha: true });
		this.renderer.setPixelRatio( window.devicePixelRatio );
		//this.renderer.physicallyCorrectLights = false;
		//this.renderer.toneMapping = THREE.NoToneMapping;
		//this.renderer.toneMappingExposure =THREE.no
		//this.renderer.outputEncoding = THREE.LinearEncoding;

		this.camera = new THREE.PerspectiveCamera(50,1.61, 1, 1000);
		this.camera.position.set(-32, 26, -9);
		//this.camera.rotation.set(-125, -46, -134);
		this.camera.lookAt(this.center.position);

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

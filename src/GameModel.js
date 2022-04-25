import * as THREE from "three";
import { EffectComposer } from "three/examples/jsm/postprocessing/EffectComposer.js";
import { RenderPass } from "three/examples/jsm/postprocessing/RenderPass.js";
import { ShaderPass } from "three/examples/jsm/postprocessing/ShaderPass.js";
import { FXAAShader } from "three/examples/jsm/shaders/FXAAShader.js";
import { OutlinePass } from 'three/examples/jsm/postprocessing/OutlinePass.js';

import ThreeScene from "../assets/scene.json";
import EventManager from "./class/basic/EventManager";
import GeneratorDefinitionModel from "./particles/GeneratorDefinitionModel";

import SmokeImage from "../assets/img/smoke.png";
import GeneratorModel from "./particles/GeneratorModel";

const ACTIVE_GROUPS = ['Factory', 'Money', 'Kremlin', 'Tank', 'Ukraine', 'Refugees'];

export default class GameModel extends EventManager {

	constructor() {
		super();

		this.width = 0;
		this.height = 0;

		this.mouseX = 0;
		this.mouseY = 0;
		this.selectedGroup = null;

		this.raycaster = new THREE.Raycaster();
		this.scene = new THREE.Scene();

		const loader = new THREE.ObjectLoader();
		const object = loader.parse(ThreeScene);
		this.scene.add(object);

		this.ambient = this.scene.getObjectByName('AmbientLight');
		this.ambient.intensity = 0.25;
		this.center = this.scene.getObjectByName('Center');
		this.factory = this.scene.getObjectByName('Factory');
		this.money = this.scene.getObjectByName('Money');
		this.moneyStart = this.scene.getObjectByName('MoneyStart');
		this.moneyEnd = this.scene.getObjectByName('MoneyEnd');
		this.kremlin = this.scene.getObjectByName('Kremlin');
		this.tank = this.scene.getObjectByName('Tank');
		this.tankStart = this.scene.getObjectByName('TankStart');
		this.tankEnd = this.scene.getObjectByName('TankEnd');
		this.ukraine = this.scene.getObjectByName('Ukraine');
		this.refugees = this.scene.getObjectByName('Refugees');
		this.refugeesStart = this.scene.getObjectByName('RefugeesStart');
		this.refugeesEnd = this.scene.getObjectByName('RefugeesEnd');

		this.camera = new THREE.PerspectiveCamera(50,1.61, 1, 1000);
		this.camera.position.set(-32, 26, -9);
		this.camera.lookAt(this.center.position);

		this.renderer = new THREE.WebGLRenderer({ antialias: false, alpha: true });
		this.renderer.setPixelRatio( window.devicePixelRatio );

		this.composer = new EffectComposer(this.renderer);
		this.composer.addPass(new RenderPass(this.scene, this.camera));

		this.outlinePass = new OutlinePass(new THREE.Vector2(window.innerWidth, window.innerHeight), this.scene, this.camera);
		this.outlinePass.edgeThickness = 1;
		this.outlinePass.edgeStrength = 5;
		this.outlinePass.visibleEdgeColor.set('#a0a0a0');
		this.composer.addPass(this.outlinePass);

		this.effectFXAA = new ShaderPass(FXAAShader);
		this.composer.addPass(this.effectFXAA);

		this.smokeDefinition = new GeneratorDefinitionModel();
		this.smokeDefinition.particleImage = new Image();
		this.smokeDefinition.particleImage.src = SmokeImage;
		this.smokeDefinition.particleMovement = new THREE.Vector3(1.5, 0, -1.5);
		this.smokeDefinition.particleMovementSpread = new THREE.Vector3(0.3, 0.3, 0);
		this.smokeDefinition.particlePositionSpread = new THREE.Vector3(0.1, 0.5, 0.1);
		this.smokeDefinition.particleScaleGrowth = 0.5;

		this.factorySmoke = new GeneratorModel();
		this.factorySmoke.definition = this.smokeDefinition;
		this.factorySmoke.scale = 0.5;
		this.factorySmoke.position.copy(this.factory.position);
		this.factorySmoke.position.y = 3;
		//this.factorySmoke.on = true;
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

		this.outlinePass.setSize(width, height);

		this.width = width;
		this.height = height;
	}

	checkIntersection(mouseX, mouseY) {
		this.raycaster.setFromCamera(new THREE.Vector2(mouseX, mouseY), this.camera);
		const intersects = this.raycaster.intersectObject(this.scene, true );

		this.selectedGroup = null;
		this.outlinePass.selectedObjects = [];

		for (let i = 0; i < intersects.length; i++) {
			const selectedObject = intersects[0].object;
			const group = this.findActiveGroup(selectedObject);
			if (group) {
				const selectedObjects = [];
				group.traverse((m) => {
					if (m.geometry && !selectedObjects.includes(m)) {
						selectedObjects.push(m);
					}
				});
				this.outlinePass.selectedObjects = selectedObjects;
				this.selectedGroup = group.name;
				return;
			}
		}
	}

	findActiveGroup(object) {
		if (ACTIVE_GROUPS.includes(object.name)) {
			return object;
		}
		if (object.parent) {
			return this.findActiveGroup(object.parent);
		}
		return null;
	}

}

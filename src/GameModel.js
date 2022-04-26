import * as THREE from "three";
import { GammaCorrectionShader } from 'three/examples/jsm/shaders/GammaCorrectionShader.js';
import { EffectComposer } from "three/examples/jsm/postprocessing/EffectComposer.js";
import { RenderPass } from "three/examples/jsm/postprocessing/RenderPass.js";
import { ShaderPass } from "three/examples/jsm/postprocessing/ShaderPass.js";

import ThreeScene from "../assets/scene.json";
import EventManager from "./class/basic/EventManager";
import GeneratorDefinition from "./particles/GeneratorDefinition";

import SmokeImage from "../assets/img/smoke.png";
import SmokeWhiteImage from "../assets/img/smoke-white.png";
import NoteImage1 from "../assets/img/note1.png";
import NoteImage2 from "../assets/img/note2.png";
import NoteImage3 from "../assets/img/note3.png";
import ScreamImage from "../assets/img/scream.png";
import BloodImage from "../assets/img/blood.png";

import Sound from "./class/Sound";
import WarExplosionsSound from "../assets/sound/war-explosions.ogg";
import FactorySound from "../assets/sound/factory.ogg";
import CannonSound from "../assets/sound/cannon.ogg";
import EngineSound from "../assets/sound/engine.ogg";
import EngineStartSound from "../assets/sound/engine-start.ogg";
import EngineStopSound from "../assets/sound/engine-stop.ogg";

import GeneratorModel from "./particles/GeneratorModel";
import ParticleSystemDefinition from "./particles/ParticleSystemDefinition";
import ParticleSystemModel from "./particles/ParticleSystemModel";


const ACTIVE_GROUPS = ['Factory', 'Money', 'Kremlin', 'Tank', 'Ukraine', 'Refugees'];

export default class GameModel extends EventManager {

	constructor() {
		super();

		this.width = 0;
		this.height = 0;

		this.mouseX = 0;
		this.mouseY = 0;
		this.selectedGroup = null;
		this.activeGroup = null;

		this.generators = [];
		this.systems = [];

		this.raycaster = new THREE.Raycaster();
		this.scene = new THREE.Scene();

		const loader = new THREE.ObjectLoader();
		const object = loader.parse(ThreeScene);
		this.scene.add(object);

		this.ground = this.scene.getObjectByName("Ground");
		this.ground.receiveShadow = true;

		this.ambient = this.scene.getObjectByName('AmbientLight');
		this.directional = this.scene.getObjectByName('DirectionalLight');
		this.directional.castShadow = true;
		this.directional.shadow.bias = 0;
		this.directional.shadow.camera.near = 0.5;
		this.directional.shadow.camera.far = 125;
		this.directional.shadow.camera.right = 50;
		this.directional.shadow.camera.left = -50;
		this.directional.shadow.camera.top	= 25;
		this.directional.shadow.camera.bottom = - 25;
		this.directional.shadow.mapSize.width = 1024;
		this.directional.shadow.mapSize.height = 1024;

		//this.ambient.intensity = 0.25;
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

		// GENERATORS

		this.smokeDefinition = new GeneratorDefinition();
		this.smokeDefinition.scale = 0.3;
		this.smokeDefinition.particleScaleGrowth = 0.5;
		this.smokeDefinition.particleLifetime = 7;
		this.smokeDefinition.particleLifetimeSpread = 0.2;
		this.smokeDefinition.particleImage = new Image();
		this.smokeDefinition.particleImage.src = SmokeImage;
		this.smokeDefinition.particleMovement = new THREE.Vector3(1, 1.5, 0);
		this.smokeDefinition.particleMovementSpread = new THREE.Vector3(0.3, 0.3, 0.3);
		this.smokeDefinition.particlePositionSpread = new THREE.Vector3(0.1, 0.5, 0.1);

		const chimney1 = this.scene.getObjectByName('Chimney1');
		this.factorySmoke1 = new GeneratorModel(this.smokeDefinition, new THREE.Vector3());
		chimney1.getWorldPosition(this.factorySmoke1.position);
		this.factorySmoke1.position.y += 0.7;
		this.generators.push(this.factorySmoke1);

		const chimney2 = this.scene.getObjectByName('Chimney2');
		this.factorySmoke2 = new GeneratorModel(this.smokeDefinition, new THREE.Vector3());
		chimney2.getWorldPosition(this.factorySmoke2.position);
		this.factorySmoke2.position.y += 0.7;
		this.generators.push(this.factorySmoke2);

		const chimney3 = this.scene.getObjectByName('Chimney3');
		this.factorySmoke3 = new GeneratorModel(this.smokeDefinition, new THREE.Vector3());
		chimney3.getWorldPosition(this.factorySmoke3.position);
		this.factorySmoke3.position.y += 0.7;
		this.generators.push(this.factorySmoke3);

		this.score = new ParticleSystemDefinition();

		this.noteDefinition1 = new GeneratorDefinition();
		this.noteDefinition1.scale = 1;
		this.noteDefinition1.particlesPerSecond = 0.4;
		this.noteDefinition1.particleScaleGrowth = 0;
		this.noteDefinition1.particleLifetime = 3;
		this.noteDefinition1.particleLifetimeSpread = 0.1;
		this.noteDefinition1.particleImage = new Image();
		this.noteDefinition1.particleImage.src = NoteImage1;
		this.noteDefinition1.particleMovement = new THREE.Vector3(0, 3.5, 2.5);
		this.noteDefinition1.particleMovementSpread = new THREE.Vector3(2, 0.1, 5);
		this.noteDefinition1.particlePositionSpread = new THREE.Vector3(0.1, 0.5, 0);
		this.score.generatorDefinitions.push(this.noteDefinition1);

		this.noteDefinition2 = new GeneratorDefinition();
		this.noteDefinition2.scale = 1;
		this.noteDefinition2.particlesPerSecond = 0.6;
		this.noteDefinition2.particleScaleGrowth = 0;
		this.noteDefinition2.particleLifetime = 3;
		this.noteDefinition2.particleLifetimeSpread = 0.1;
		this.noteDefinition2.particleImage = new Image();
		this.noteDefinition2.particleImage.src = NoteImage2;
		this.noteDefinition2.particleMovement = new THREE.Vector3(0, 3.5, 2.5);
		this.noteDefinition2.particleMovementSpread = new THREE.Vector3(2, 0.1, 5);
		this.noteDefinition2.particlePositionSpread = new THREE.Vector3(1, 0.5, 0);
		this.score.generatorDefinitions.push(this.noteDefinition2);

		this.noteDefinition3 = new GeneratorDefinition();
		this.noteDefinition3.scale = 1;
		this.noteDefinition3.particlesPerSecond = 0.5;
		this.noteDefinition3.particleScaleGrowth = 0;
		this.noteDefinition3.particleLifetime = 3;
		this.noteDefinition3.particleLifetimeSpread = 0.1;
		this.noteDefinition3.particleImage = new Image();
		this.noteDefinition3.particleImage.src = NoteImage3;
		this.noteDefinition3.particleMovement = new THREE.Vector3(0, 3.5, 2.5);
		this.noteDefinition3.particleMovementSpread = new THREE.Vector3(2, 0.1, 5);
		this.noteDefinition3.particlePositionSpread = new THREE.Vector3(1, 0.5, 0);
		this.score.generatorDefinitions.push(this.noteDefinition3);

		this.katusha1 = new ParticleSystemModel(this.score, new THREE.Vector3());
		const star = this.scene.getObjectByName('Star');
		star.getWorldPosition(this.katusha1.position);
		this.katusha1.position.y += 0.7;
		this.systems.push(this.katusha1);

		this.katusha2 = new ParticleSystemModel(this.score, new THREE.Vector3());
		const wheel = this.scene.getObjectByName('Wheel');
		wheel.getWorldPosition(this.katusha2.position);
		this.katusha2.position.z += 5;
		this.systems.push(this.katusha2);

		this.tankFume = new GeneratorModel(this.smokeDefinition, new THREE.Vector3());
		this.tankFume.scale = 0.8;
		this.generators.push(this.tankFume);

		this.whiteSmokeDefinition = new GeneratorDefinition();
		this.whiteSmokeDefinition.scale = 1.5;
		this.whiteSmokeDefinition.particlesPerSecond = 1.5;
		this.whiteSmokeDefinition.particleScaleGrowth = 0.5;
		this.whiteSmokeDefinition.particleScaleSpread = 0.1;
		this.whiteSmokeDefinition.particleLifetime = 3;
		this.whiteSmokeDefinition.particleLifetimeSpread = 0.5;
		this.whiteSmokeDefinition.particleImage = new Image();
		this.whiteSmokeDefinition.particleImage.src = SmokeWhiteImage;
		this.whiteSmokeDefinition.particleMovement = new THREE.Vector3(0.1, 0.1, 0.1);
		this.whiteSmokeDefinition.particleMovementSpread = new THREE.Vector3(0.3, 0.3, 0.3);
		this.whiteSmokeDefinition.particlePositionSpread = new THREE.Vector3(0.1, 0.1, 0.1);

		this.whiteSmoke1 = new GeneratorModel(this.whiteSmokeDefinition, new THREE.Vector3());
		this.whiteSmoke1.position.copy(this.ukraine.position);
		this.whiteSmoke1.position.y += 0.7;
		this.generators.push(this.whiteSmoke1);

		this.whiteSmoke2 = new GeneratorModel(this.whiteSmokeDefinition, new THREE.Vector3());
		this.whiteSmoke2.position.copy(this.ukraine.position);
		this.whiteSmoke2.position.y += 0.7;
		this.whiteSmoke2.position.x -= 4;
		this.whiteSmoke2.position.z -= 2;
		this.whiteSmoke2.scale = 0.1;
		this.generators.push(this.whiteSmoke2);

		this.whiteSmoke3 = new GeneratorModel(this.whiteSmokeDefinition, new THREE.Vector3());
		this.whiteSmoke3.position.copy(this.ukraine.position);
		this.whiteSmoke3.position.y += 0.7;
		this.whiteSmoke3.position.x -= 2.5;
		this.whiteSmoke3.position.z += 1;
		this.whiteSmoke3.scale = 0.4;
		this.generators.push(this.whiteSmoke3);

		this.screamsDefinition = new GeneratorDefinition();
		this.screamsDefinition.particlesPerSecond = 2;
		this.screamsDefinition.scale = 1;
		this.screamsDefinition.particleScaleGrowth = 0.5;
		this.screamsDefinition.particleScaleSpread = 0.5;
		this.screamsDefinition.particleLifetime = 2;
		this.screamsDefinition.particleLifetimeSpread = 0.1;
		this.screamsDefinition.particleImage = new Image();
		this.screamsDefinition.particleImage.src = ScreamImage;
		this.screamsDefinition.particlePositionSpread = new THREE.Vector3(4, 0, 0);
		this.screamsDefinition.particleMovement = new THREE.Vector3(0, 1.5, 0);
		this.screamsDefinition.particleMovementSpread = new THREE.Vector3(5, 0, 0);

		this.scream1 = new GeneratorModel(this.screamsDefinition, new THREE.Vector3());
		this.scream1.position.copy(this.ukraine.position);
		this.scream1.position.x -= 1.5;
		this.scream1.position.y += 1;
		this.scream1.position.z -= 1.5;
		this.generators.push(this.scream1);

		this.bloodDefinition = new GeneratorDefinition();
		this.bloodDefinition.particlesPerSecond = 5;
		this.bloodDefinition.scale = 0.2;
		this.bloodDefinition.particleScaleGrowth = 0.3;
		this.bloodDefinition.particleScaleSpread = 0;
		this.bloodDefinition.particleLifetime = 4;
		this.bloodDefinition.particleLifetimeSpread = 0.1;
		this.bloodDefinition.particleImage = new Image();
		this.bloodDefinition.particleImage.src = BloodImage;
		this.bloodDefinition.particlePositionSpread = new THREE.Vector3(2, 0, 0);
		this.bloodDefinition.particleMovement = new THREE.Vector3(0, 0, 0);
		this.bloodDefinition.particleMovementSpread = new THREE.Vector3(0, 0.1, 0);

		this.blood1 = new GeneratorModel(this.bloodDefinition, new THREE.Vector3());
		this.generators.push(this.blood1);

		// SOUND

		this.factorySound = new Sound(FactorySound, {loop: true});

		this.engineSound = new Sound(EngineSound, {loop: true});
		this.engineStartSound = new Sound(EngineStartSound, {loop: false});
		this.engineStopSound = new Sound(EngineStopSound, {loop: false});

		this.warExplosions = new Sound(WarExplosionsSound, {loop: false});
		this.cannonSound = new Sound(CannonSound, {loop: false});

		// CAMERA AND RENDERER

		this.camera = new THREE.PerspectiveCamera(50,1.61, 1, 1000);
		this.camera.position.set(-32, 26, -9);
		this.camera.lookAt(this.center.position);

		this.renderer = new THREE.WebGLRenderer({ antialias: false, alpha: true });
		this.renderer.setPixelRatio( window.devicePixelRatio );
		this.renderer.shadowMap.enabled = true;
		this.renderer.shadowMap.type = THREE.PCFShadowMap;
		this.composer = new EffectComposer(this.renderer);
		this.composer.addPass(new RenderPass(this.scene, this.camera));
/*
		this.outlinePass = new OutlinePass(new THREE.Vector2(window.innerWidth, window.innerHeight), this.scene, this.camera);
		this.outlinePass.edgeThickness = 1;
		this.outlinePass.edgeStrength = 5;
		this.outlinePass.visibleEdgeColor.set('#a0a0a0');
		this.composer.addPass(this.outlinePass);
*/
		//this.effectFXAA = new ShaderPass(FXAAShader);
		//this.effectFXAA.outputEncoding = THREE.sRGBEncoding;
		//this.composer.addPass(this.effectFXAA);

		const gammaCorrectionPass = new ShaderPass(GammaCorrectionShader);
		this.composer.addPass(gammaCorrectionPass);
		//renderer.gammaFactor = 2.2 i
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

		//const pixelRatio = this.renderer.getPixelRatio();
		//this.effectFXAA.material.uniforms[ 'resolution' ].value.x = 1 / (  width * pixelRatio );
		//this.effectFXAA.material.uniforms[ 'resolution' ].value.y = 1 / (  height * pixelRatio );

		this.width = width;
		this.height = height;
	}

	checkIntersection(mouseX, mouseY) {
		this.raycaster.setFromCamera(new THREE.Vector2(mouseX, mouseY), this.camera);
		const intersects = this.raycaster.intersectObject(this.scene, true );

		this.selectedGroup = null;

		for (let i = 0; i < intersects.length; i++) {
			const selectedObject = intersects[i].object;
			const group = this.findActiveGroup(selectedObject);
			if (group) {
				this.selectedGroup = group.name;
				break;
			}
		}

		this.triggerEvent('selected', this.selectedGroup);

		if (this.selectedGroup) {
			this.triggerEvent('selected-' + this.selectedGroup, this.selectedGroup);
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

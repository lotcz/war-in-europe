import GenericController from "./GenericController";
import AnimatedVector3 from "./class/animating/AnimatedVector3";
import AnimatedValue from "./class/animating/AnimatedValue";
import * as THREE from "three";
import GeneratorController from "./particles/GeneratorController";
import ParticleSystemController from "./particles/ParticleSystemController";

export default class GameController {

	/**
	 * @type GameModel
	 */
	model;

	constructor(model, dom) {
		this.model = model;
		this.dom = dom;

		this.controllers = [];

		this.mouseMoveHandler = (e) => this.onPointerMove(e);
		this.mouseClickHandler = (e) => this.onClick(e);
	}

	activate() {

		this.model.tank.scale.set(0, 0, 0);
		this.model.money.scale.set(0, 0, 0);
		this.model.refugees.scale.set(0, 0, 0);

		this.model.generators.forEach((generator) => {
			const controller = new GeneratorController(this.model, generator);
			controller.activate();
			this.controllers.push(controller);
		});

		this.model.systems.forEach((s) => {
			const controller = new ParticleSystemController(this.model, s);
			controller.activate();
			this.controllers.push(controller);
		});

		this.dom.addEventListener('mousemove', this.mouseMoveHandler);
		this.dom.addEventListener('click', this.mouseClickHandler);

		//this.activateStageFactory();
		this.activateStageTank();
	}

	deactivate() {
		this.controllers.forEach((c) => c.deactivate());
		this.controllers = [];
		this.dom.removeEventListener('mousemove', this.mouseMoveHandler);
		this.dom.removeEventListener('click', this.mouseClickHandler);
	}

	update(delta) {
		this.controllers.forEach((c) => c.update(delta));
	}

	activateStageFactory() {
		this.model.factorySmoke1.on = true;
		this.model.factorySmoke2.on = true;
		this.model.factorySmoke3.on = true;

		const handler = () => {
			this.model.activeGroup = null;
			const moneyScale = new AnimatedValue(0, 1,700);
			const moneyPosition = new AnimatedVector3(
				this.model.factory.position.clone(),
				this.model.moneyStart.position.clone(),
				700
			);
			this.addController(
				(delta) => {
					const scale = moneyScale.get(delta);
					this.model.money.scale.set(scale, scale, scale);
					const pos = moneyPosition.get(delta);
					this.model.money.position.set(pos.x, pos.y, pos.z);
				},
				() => moneyScale.isFinished() && moneyPosition.isFinished(),
				() => {
					this.model.factorySmoke1.on = false;
					this.model.factorySmoke2.on = false;
					this.model.factorySmoke3.on = false;
					this.activateStageMoney();
				}
			);
			this.model.removeEventListener('click-Factory', handler);
		}

		this.model.activeGroup = 'Factory';
		this.model.addEventListener('click-Factory', handler);
	}

	activateStageMoney() {
		const handler = () => {
			this.model.activeGroup = null;
			const moneyPosition = new AnimatedVector3(
				this.model.moneyStart.position.clone(),
				this.model.moneyEnd.position.clone(),
				2000
			);
			this.addController(
				(delta) => {
					const pos = moneyPosition.get(delta);
					this.model.money.position.set(pos.x, pos.y, pos.z);
				},
				() => moneyPosition.isFinished(),
				() => {
					const moneyPosition = new AnimatedVector3(
						this.model.moneyEnd.position.clone(),
						this.model.moneyEnd.position.clone().add(new THREE.Vector3(1, -1, 3)),
						1000
					);
					this.addController(
						(delta) => {
							const pos = moneyPosition.get(delta);
							this.model.money.position.set(pos.x, pos.y, pos.z);
						},
						() => moneyPosition.isFinished(),
						() => {
							const moneyScale = new AnimatedValue(1, 0,300);
							const moneyPosition = new AnimatedVector3(
								this.model.moneyEnd.position.clone(),
								this.model.kremlin.position.clone(),
								300
							);
							this.addController(
								(delta) => {
									const scale = moneyScale.get(delta);
									this.model.money.scale.set(scale, scale, scale);
									const pos = moneyPosition.get(delta);
									this.model.money.position.set(pos.x, pos.y, pos.z);
								},
								() => moneyScale.isFinished() && moneyPosition.isFinished(),
								() => {
									this.activateStageKremlin();
								}
							);
						}
					);
				}
			);
			this.model.removeEventListener('click-Money', handler);
		}

		this.model.activeGroup = 'Money';
		this.model.addEventListener('click-Money', handler);
	}

	activateStageKremlin() {
		this.model.katusha1.on = true;
		this.model.katusha2.on = true;
		this.model.activeGroup = 'Kremlin';

		const handler = () => {
			this.model.tank.position.copy(this.model.tankStart.position);
			this.model.tank.lookAt(this.model.tankEnd.position);
			this.model.removeEventListener('click-Kremlin', handler);
			this.model.katusha1.on = false;
			this.model.katusha2.on = false;
			this.model.activeGroup = null;
			const tankScale = new AnimatedValue(0, 1,500);
			this.addController(
				(delta) => {
					const scale = tankScale.get(delta);
					this.model.tank.scale.set(scale, scale, scale);
				},
				() => tankScale.isFinished(),
				() => {
					const dummy = new AnimatedValue(0,1,2000);
					this.model.tankFume.position.copy(this.model.tank.position);
					this.model.tankFume.position.y += 1;
					this.model.tankFume.position.z += 1;
					this.model.tankFume.on = true;
					this.addController(
						(delta) => {
							const pos = dummy.get(delta);
							//this.model.tank.position.set(pos.x, pos.y, pos.z);
						},
						() => dummy.isFinished(),
						() => {
							const tankPosition = new AnimatedVector3(
								this.model.tankStart.position.clone(),
								this.model.tankEnd.position.clone(),
								3000
							);
							this.addController(
								(delta) => {
									const pos = tankPosition.get(delta);
									this.model.tank.position.set(pos.x, pos.y, pos.z);
									this.model.tankFume.position.copy(this.model.tank.position);
									//this.model.tank.lookAt(this.model.ukraine.position);
								},
								() => tankPosition.isFinished(),
								() => {
									this.model.tankEnd.lookAt(this.model.ukraine.position);
									const tankRotation = new AnimatedVector3(
										this.model.tank.rotation.clone(),
										this.model.tankEnd.rotation.clone(),
										1000
									);
									this.addController(
										(delta) => {
											const r = tankRotation.get(delta);
											this.model.tank.rotation.y = r.y;
											//this.model.tankFume.position.copy(this.model.tank.position);
											//this.model.tank.lookAt(this.model.ukraine.position);
										},
										() => tankRotation.isFinished(),
										() => {
											this.model.tankFume.on = false;
											this.activateStageTank();
										}
									);
								}
							);
						}
					);
				}
			);
		}

		this.model.addEventListener('click-Kremlin', handler);
	}

	activateStageTank() {
		this.model.tank.position.copy(this.model.tankEnd.position);
		this.model.tank.scale.set(1, 1, 1);
		const handler = () => {
			this.model.tank.lookAt(this.model.ukraine.position);
			this.model.whiteSmoke1.on = true;
			this.model.whiteSmoke2.on = true;
			this.model.whiteSmoke3.on = true;
			this.model.activeGroup = null;
			const tankScale = new AnimatedValue(1, 0,1000);
			const tankPosition = new AnimatedVector3(
				this.model.tankEnd.position.clone(),
				this.model.ukraine.position.clone(),
				1000
			);
			this.addController(
				(delta) => {
					const scale = tankScale.get(delta);
					this.model.tank.scale.set(scale, scale, scale);
					const pos = tankPosition.get(delta);
					this.model.tank.position.set(pos.x, pos.y, pos.z);
					this.model.tank.lookAt(this.model.ukraine.position);
				},
				() => tankScale.isFinished() && tankPosition.isFinished(),
				() => {
					this.activateStageUkraine();
				}
			);
			this.model.removeEventListener('click-Tank', handler);
		}

		this.model.activeGroup = 'Tank';
		this.model.addEventListener('click-Tank', handler);
	}

	activateStageUkraine() {
		const handler = () => {
			this.model.whiteSmoke1.on = false;
			this.model.whiteSmoke2.on = false;
			this.model.whiteSmoke3.on = false;
			this.model.activeGroup = null;
			const refugeesScale = new AnimatedValue(0, 1,1000);
			const refugeesPosition = new AnimatedVector3(
				this.model.ukraine.position.clone(),
				this.model.refugeesStart.position.clone(),
				1000
			);
			this.addController(
				(delta) => {
					const scale = refugeesScale.get(delta);
					this.model.refugees.scale.set(scale, scale, scale);
					const pos = refugeesPosition.get(delta);
					this.model.refugees.position.set(pos.x, pos.y, pos.z);
					this.model.refugees.lookAt(this.model.factory.position);
				},
				() => refugeesScale.isFinished() && refugeesPosition.isFinished(),
				() => {
					const dummy = new AnimatedValue(0,1,1500);
					this.addController(
						(delta) => {
							const pos = dummy.get(delta);
						},
						() => dummy.isFinished(),
						() => {
							const refugeesPosition = new AnimatedVector3(
								this.model.refugeesStart.position.clone(),
								this.model.refugeesEnd.position.clone(),
								3000
							);
							this.addController(
								(delta) => {
									const pos = refugeesPosition.get(delta);
									this.model.refugees.position.set(pos.x, pos.y, pos.z);
									this.model.refugees.lookAt(this.model.factory.position);
								},
								() => refugeesPosition.isFinished(),
								() => {
									this.activateStageRefugees();
								}
							);
						}
					);
				}
			);
			this.model.removeEventListener('click-Ukraine', handler);
		}

		this.model.activeGroup = 'Ukraine';
		this.model.addEventListener('click-Ukraine', handler);
	}

	activateStageRefugees() {
		const handler = () => {
			this.model.activeGroup = null;
			const refugeesScale = new AnimatedValue(1, 0,1000);
			const refugeesPosition = new AnimatedVector3(
				this.model.refugeesEnd.position.clone(),
				this.model.factory.position.clone(),
				1000
			);
			this.addController(
				(delta) => {
					const scale = refugeesScale.get(delta);
					this.model.refugees.scale.set(scale, scale, scale);
					const pos = refugeesPosition.get(delta);
					this.model.refugees.position.set(pos.x, pos.y, pos.z);
					this.model.refugees.lookAt(this.model.factory.position);
				},
				() => refugeesScale.isFinished() && refugeesPosition.isFinished(),
				() => {
					this.activateStageFactory();
				}
			);
			this.model.removeEventListener('click-Refugees', handler);
		}

		this.model.activeGroup = 'Refugees';
		this.model.addEventListener('click-Refugees', handler);
	}

	addController(update, finishCondition, finish) {
		const controller = new GenericController(
			update,
			finishCondition,
			(controller) => {
				finish();
				this.controllers.splice(this.controllers.indexOf(controller), 1);
			}
		);
		this.controllers.push(controller);
	}

	onPointerMove( event ) {
		if ( event.isPrimary === false ) return;

		const clientX = event.clientX - ((window.innerWidth - this.model.width) / 2);
		const clientY = event.clientY - ((window.innerHeight - this.model.height) / 2);
		this.model.mouseX = (clientX / this.model.width) * 2 - 1;
		this.model.mouseY = - (clientY / this.model.height) * 2 + 1;

		//console.log(event.clientX);
		this.model.checkIntersection(this.model.mouseX, this.model.mouseY);
	}

	onClick(event) {
		this.model.triggerEvent('click', this.model.selectedGroup);
		this.model.triggerEvent('click-' + this.model.selectedGroup);
	}

}

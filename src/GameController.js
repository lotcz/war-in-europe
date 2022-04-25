import GenericController from "./GenericController";
import AnimatedVector3 from "./class/animating/AnimatedVector3";
import AnimatedValue from "./class/animating/AnimatedValue";
import * as THREE from "three";
import GeneratorController from "./particles/GeneratorController";

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

		this.dom.addEventListener('mousemove', this.mouseMoveHandler);
		this.dom.addEventListener('click', this.mouseClickHandler);

		this.factorySmokeController = new GeneratorController(this.model, this.model.factorySmoke);
		this.factorySmokeController.activate();
		this.controllers.push(this.factorySmokeController);

		this.activateStageFactory();
	}

	deactivate() {
		this.dom.removeEventListener('mousemove', this.mouseMoveHandler);
		this.dom.removeEventListener('click', this.mouseClickHandler);
	}

	update(delta) {
		this.controllers.forEach((c) => c.update(delta));
	}

	activateStageFactory() {
		this.model.factorySmoke.on = true;
		const handler = () => {
			const moneyScale = new AnimatedValue(0, 1,1000);
			const moneyPosition = new AnimatedVector3(
				this.model.factory.position.clone(),
				this.model.moneyStart.position.clone(),
				1000
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
					this.model.factorySmoke.on = false;
					this.activateStageMoney();
				}
			);
			this.model.removeEventListener('click-Factory', handler);
		}
		this.model.addEventListener('click-Factory', handler);
	}

	activateStageMoney() {
		const handler = () => {
			const moneyPosition = new AnimatedVector3(
				this.model.moneyStart.position.clone(),
				this.model.moneyEnd.position.clone(),
				3000
			);
			this.addController(
				(delta) => {
					const pos = moneyPosition.get(delta);
					this.model.money.position.set(pos.x, pos.y, pos.z);
				},
				() => moneyPosition.isFinished(),
				() => {
					const moneyScale = new AnimatedValue(1, 0,1000);
					const moneyPosition = new AnimatedVector3(
						this.model.moneyEnd.position.clone(),
						this.model.kremlin.position.clone(),
						1000
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
			this.model.removeEventListener('click-Money', handler);
		}
		this.model.addEventListener('click-Money', handler);
	}

	activateStageKremlin() {
		const handler = () => {
			const tankScale = new AnimatedValue(0, 1,1000);
			const tankPosition = new AnimatedVector3(
				this.model.kremlin.position.clone(),
				this.model.tankStart.position.clone(),
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
					this.activateStageTank();
				}
			);
			this.model.removeEventListener('click-Kremlin', handler);
		}
		this.model.addEventListener('click-Kremlin', handler);
	}

	activateStageTank() {
		const handler = () => {
			const tankPosition = new AnimatedVector3(
				this.model.tankStart.position.clone(),
				this.model.tankEnd.position.clone(),
				3000
			);
			this.addController(
				(delta) => {
					const pos = tankPosition.get(delta);
					this.model.tank.position.set(pos.x, pos.y, pos.z);
					this.model.tank.lookAt(this.model.ukraine.position);
				},
				() => tankPosition.isFinished(),
				() => {
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
				}
			);
			this.model.removeEventListener('click-Tank', handler);
		}
		this.model.addEventListener('click-Tank', handler);
	}

	activateStageUkraine() {
		const handler = () => {
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
					this.activateStageRefugees();
				}
			);
			this.model.removeEventListener('click-Ukraine', handler);
		}
		this.model.addEventListener('click-Ukraine', handler);
	}

	activateStageRefugees() {
		const handler = () => {
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
					this.activateStageCycleOfWar();
				}
			);
			this.model.removeEventListener('click-Refugees', handler);
		}
		this.model.addEventListener('click-Refugees', handler);
	}

	activateStageCycleOfWar() {
		const handler = () => {
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

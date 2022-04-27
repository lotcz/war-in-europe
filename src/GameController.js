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

		this.activateStageFactory();
		//this.activateStageUkraine();
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

		this.model.factorySound.volume(0);
		this.model.factorySound.play();

		const factoryVolume = new AnimatedValue(0, 1,2500);
		this.addController(
			(delta) => {
				this.model.factorySound.volume(factoryVolume.get(delta));
			},
			() => factoryVolume.isFinished(),
			() => {
			}
		);

		const handler = () => {
			this.model.activeGroup = null;
			this.model.moneySound.replay();
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

					const factoryVolume = new AnimatedValue(this.model.factorySound.volume(), 0,2500);
					this.addController(
						(delta) => {
							this.model.factorySound.volume(factoryVolume.get(delta));
						},
						() => factoryVolume.isFinished(),
						() => {
							this.model.factorySound.stop();
						}
					);

					this.activateStageMoneyTransition();
				}
			);
			this.model.removeEventListener('click-Factory', handler);
		}

		this.model.activeGroup = 'Factory';
		this.model.addEventListener('click-Factory', handler);
	}

	activateStageMoneyTransition() {
		this.model.money2Sound.replay();
		this.model.activeGroup = null;

		const moneyScale = new AnimatedValue(1, 0.8,150);
		this.addController(
			(delta) => {
				const scale = moneyScale.get(delta);
				this.model.money.scale.set(scale, scale, scale);
			},
			() => moneyScale.isFinished(),
			() => {
				const moneyScale = new AnimatedValue(0.8, 1, 150);
				this.addController(
					(delta) => {
						const scale = moneyScale.get(delta);
						this.model.money.scale.set(scale, scale, scale);
					},
					() => moneyScale.isFinished(),
					() => {
						this.model.coins1.position.copy(this.model.money.position);
						this.model.coins1.on = true;
						const moneyPosition = new AnimatedVector3(
							this.model.moneyStart.position.clone(),
							this.model.moneyEnd.position.clone(),
							5000
						);
						this.addController(
							(delta) => {
								const pos = moneyPosition.get(delta);
								this.model.money.position.set(pos.x, pos.y, pos.z);
								this.model.coins1.position.copy(this.model.money.position);
							},
							() => moneyPosition.isFinished(),
							() => this.activateStageMoney()
						);
					}
				);
			}
		);
	}

	activateStageMoney() {
		//this.model.coins1.on = false;

		const handler = () => {
			this.model.activeGroup = null;
			const moneyPosition = new AnimatedVector3(
				this.model.money.position.clone(),
				this.model.money.position.clone().add(new THREE.Vector3(0, 0, 4)),
				1000
			);
			this.addController(
				(delta) => {
					const pos = moneyPosition.get(delta);
					this.model.money.position.set(pos.x, pos.y, pos.z);
				},
				() => moneyPosition.isFinished(),
				() => {
					const dummy = new AnimatedValue(0, 1, 200);
					this.addController(
						(delta) => dummy.get(delta),
						() => dummy.isFinished(),
						() => {
							this.model.money2Sound.replay();
							const moneyScale = new AnimatedValue(1, 0, 300);
							const moneyPosition = new AnimatedVector3(
								this.model.money.position.clone(),
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
									this.model.coins1.on = false;
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
		this.model.katushaSound.volume(1);
		this.model.katushaSound.play();
		this.model.activeGroup = 'Kremlin';

		const handler = () => {
			this.model.engineStartSound.replay();
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
					this.model.engineSound.volume(0);
					this.model.engineSound.play();
					this.model.tankFume.position.copy(this.model.tank.position);
					this.model.tankFume.position.y += 1;
					this.model.tankFume.position.z += 1;
					this.model.tankFume.on = true;
					this.addController(
						(delta) => {
							const vol = dummy.get(delta);
							this.model.engineSound.volume(vol);
							this.model.katushaSound.volume(1 - vol);
						},
						() => dummy.isFinished(),
						() => {
							this.model.katushaSound.stop();
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
									this.model.tankFume.position.y += 2;
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
										},
										() => tankRotation.isFinished(),
										() => {
											const volume = new AnimatedValue(1, 0,2000);
											this.addController(
												(delta) => this.model.engineSound.volume(volume.get(delta)),
												() => volume.isFinished(),
												() => {
													this.model.engineStopSound.replay();
													this.model.engineSound.stop();
													this.model.tankFume.on = false;
												}
											);
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
			//this.model.warExplosions.play();
			this.model.cannonSound.replay();
			this.model.whiteSmoke1.on = true;
			this.model.whiteSmoke2.on = true;
			this.model.whiteSmoke3.on = true;
			this.model.scream1.on = true;
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

		this.model.activeGroup = 'Ukraine';
		let soundTimeout = 0;

		this.addController(
			(delta) => {
				soundTimeout += delta;
				if (soundTimeout > 700) {
					if (Math.random() < (0.02 * (soundTimeout / 2000))) {
						soundTimeout = 0;
						this.model.cannonSound.replay();
					}
				}
			},
			() => this.model.activeGroup !== 'Ukraine',
			() => {}
		);

		let soundTimeout2 = 0;

		this.addController(
			(delta) => {
				soundTimeout2 += delta;
				if (soundTimeout2 > 1700) {
					if (Math.random() < (0.02 * (soundTimeout2 / 3000))) {
						soundTimeout2 = 0;
						this.model.warExplosions.replay();
					}
				}
			},
			() => this.model.activeGroup !== 'Ukraine',
			() => {}
		);

		let soundTimeout3 = 0;
		this.model.screamFemaleSound.volume(1);

		this.addController(
			(delta) => {
				soundTimeout3 += delta;
				if (soundTimeout3 > 1700) {
					if (Math.random() < (0.02 * (soundTimeout2 / 6000))) {
						soundTimeout3 = 0;
						this.model.screamFemaleSound.replay();
					}
				}
			},
			() => this.model.activeGroup !== 'Ukraine',
			() => {}
		);

		let soundTimeout4 = 0;

		this.addController(
			(delta) => {
				soundTimeout4 += delta;
				if (soundTimeout4 > 1700) {
					if (Math.random() < (0.02 * (soundTimeout2 / 5000))) {
						soundTimeout4 = 0;
						this.model.screamMaleSound.replay();
					}
				}
			},
			() => this.model.activeGroup !== 'Ukraine',
			() => {}
		);

		const handler = () => {
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
					this.model.blood1.on = true;
					this.model.blood1.position.copy(this.model.refugees.position);
					this.model.blood1.position.z += 1;
					const dummy = new AnimatedValue(0,1,1500);
					this.addController(
						(delta) => {
							const pos = dummy.get(delta);
						},
						() => dummy.isFinished(),
						() => {
							this.model.screamFemaleSound.replay();
							//this.model.screamMaleSound.replay();
							this.model.whiteSmoke1.on = false;
							this.model.whiteSmoke2.on = false;
							this.model.whiteSmoke3.on = false;
							this.model.scream1.on = false;
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
									this.model.blood1.position.copy(this.model.refugees.position);
									this.model.blood1.position.z += 2;
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

		this.model.addEventListener('click-Ukraine', handler);
	}

	activateStageRefugees() {
		this.model.blood1.on = false;

		const handler = () => {
			this.model.screamFemaleSound.volume(0.5);
			this.model.screamFemaleSound.replay();
			//this.model.screamMaleSound.replay();
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

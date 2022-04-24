import GenericController from "./GenericController";
import AnimatedVector3 from "./class/animating/AnimatedVector3";
import Vector3 from "./class/Vector3";

export default class GameController {

	/**
	 * @type GameModel
	 */
	model;

	constructor(model, dom) {
		this.model = model;
		this.dom = dom;

		this.controllers = [];
	}

	activate() {
		this.model.tank.position.copy(this.model.kremlin.position);
		this.model.money.position.copy(this.model.factory.position);
		this.model.refugees.position.copy(this.model.ukraine.position);

		this.activateStageStart();
	}

	deactivate() {

	}

	update(delta) {
		this.controllers.forEach((c) => c.update(delta));
	}

	activateStageStart() {
		this.model.money.position.copy(this.model.factory.position);
		const moneyPosition = new AnimatedVector3(
			new Vector3(this.model.money.position),
			new Vector3(this.model.kremlin.position),
			3000
		);
		this.addController(
			(delta) => {
				const pos = moneyPosition.get(delta);
				console.log(pos);
				this.model.money.position.set(pos.x, pos.y, pos.z);
			},
			() => moneyPosition.isFinished(),
			() => {
				this.activateStageStart();
			}
		);
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

}

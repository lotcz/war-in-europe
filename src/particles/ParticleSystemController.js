import GeneratorController from "./GeneratorController";
import GeneratorModel from "./GeneratorModel";

export default class ParticleSystemController {

	/**
	 * @type ParticleSystemModel
	 */
	model;

	/**
	 * @type GameModel
	 */
	game;

	constructor(game, model) {
		this.game = game;
		this.model = model;

		this.model.generators = [];

		this.model.definition.generatorDefinitions.forEach((gdef) => {
			const g = new GeneratorModel(gdef, this.model.position);
			g.on = true;
			this.model.generators.push(g);
		});
	}

	activate() {
		this.controllers = [];

		this.model.generators.forEach((g) => {
			const c = new GeneratorController(this.game, g);
			c.activate();
			this.controllers.push(c);
		});

	}

	deactivate() {
		this.controllers.forEach((c) => {
			c.deactivate();
		});
		this.controllers = [];
	}

	update(delta) {
		this.controllers.forEach((c) => {
			c.model.on = this.model.on;
			c.update(delta);
		});
	}

}

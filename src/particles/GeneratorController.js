import ParticleModel from "./ParticleModel";

export default class GeneratorController {

	/**
	 * @type GeneratorModel
	 */
	model;

	/**
	 * @type GameModel
	 */
	game;

	constructor(game, model) {
		this.game = game;
		this.model = model;
	}

	activate() {
		this.particleMaxTimeout = (1 / this.model.definition.particlesPerSecond) * 1000;
		this.particleTimeout = 0;
	}

	deactivate() {

	}

	update(delta) {
		if (this.model.on) {
			this.particleTimeout -= delta;
			while (this.particleTimeout < 0) {
				this.addParticle();
				this.particleTimeout += this.particleMaxTimeout;
			}
		}
		this.updateParticles(delta);
	}

	addParticle() {
		const position = this.model.position.clone().add(this.model.definition.particlePositionSpread.clone().multiplyScalar(-0.5 + Math.random()));
		const scale = this.model.scale + (this.model.definition.particleScaleSpread * (-0.5 + Math.random()));
		const lifetime = this.model.definition.particleLifetime + (this.model.definition.particleLifetimeSpread * (-0.5 + Math.random()));
		const movement = this.model.definition.particleMovement.clone().add(this.model.definition.particleMovementSpread.clone().multiplyScalar(-0.5 + Math.random()));
		const material = this.model.definition.getMaterial();
		const particle = new ParticleModel(position, scale, movement, lifetime, material);
		this.model.particles.push(particle);
		this.game.scene.add(particle.mesh);
		return particle;
	}

	removeParticle(particle) {
		this.model.particles.splice(this.model.particles.indexOf(particle), 1);
		this.game.scene.remove(particle.mesh);
	}

	updateParticles(delta) {
		this.model.particles.forEach((p) => this.updateParticle(p, delta));
	}

	updateParticle(particle, delta) {
		particle.lifetime -= (delta / 1000);
		if (particle.lifetime < this.model.definition.particleFadeOutDuration) {
			const opacity = particle.lifetime / this.model.definition.particleFadeOutDuration;
			const rounded = Math.round(opacity * 10) / 10;
			if (particle.mesh.material.opacity !== rounded) {
				particle.mesh.material = this.model.definition.getMaterial(rounded);
			}
		}
		if (particle.lifetime < 0) {
			this.removeParticle(particle);
			return;
		}
		const position = particle.mesh.position.add(particle.movement.clone().multiplyScalar(delta * 0.001));
		particle.mesh.position.copy(position);
		const scale = particle.mesh.scale.x + (this.model.definition.particleScaleGrowth * 0.001 * delta);
		particle.mesh.scale.set(scale, scale, scale);
	}

}

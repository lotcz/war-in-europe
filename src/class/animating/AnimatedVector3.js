import Pixies from "../basic/Pixies";
import ProgressVector3 from "./ProgressVector3";

export default class AnimatedVector3 {
	progressVector;
	duration;
	elapsed;

	constructor(start, end, duration, elapsed = 0) {
		this.progressVector = new ProgressVector3(start, end);
		this.duration = duration;
		this.elapsed = elapsed;
		this.updateProgress();
	}

	addElapsed(delta) {
		this.elapsed += delta;
		this.updateProgress();
	}

	updateProgress() {
		this.progressVector.setProgress(Pixies.between(0, 1, this.elapsed / this.duration));
	}

	get(delta = null) {
		if (delta !== null) this.addElapsed(delta);
		return this.progressVector.get();
	}

	isFinished() {
		return (this.elapsed >= this.duration);
	}

}

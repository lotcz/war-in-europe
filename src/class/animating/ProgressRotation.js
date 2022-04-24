import Rotation from "../../model/basic/Rotation";

export default class ProgressRotation {

	/**
	 * @type Number
	 */
	start;

	/**
	 * @type Number
	 */
	distance;

	/**
	 * @type Number
	 */
	progress;

	/**
	 *
	 * @param {Number} start
	 * @param {Number} end
	 * @param {Number} progress
	 */
	constructor(start, end, progress = 0) {
		this.start = Rotation.normalizeValue(start);
		this.distance = Rotation.diff(end, start);
		this.progress = progress;
	}

	get(progress = null) {
		if (progress !== null) this.progress = progress;
		return Rotation.normalizeValue(this.start + (this.progress * this.distance));
	}

}

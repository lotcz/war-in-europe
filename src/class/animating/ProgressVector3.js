import ProgressValue from "./ProgressValue";
import Vector3 from "../../model/basic/Vector3";

export default class ProgressVector3 {
	progressX;
	progressY;
	progressZ;

	constructor(start, end, progress = 0) {
		this.progressX = new ProgressValue(start.x, end.x, progress);
		this.progressY = new ProgressValue(start.y, end.y, progress);
		this.progressZ = new ProgressValue(start.z, end.z, progress);
	}

	setProgress(progress) {
		this.progressX.progress = progress;
		this.progressY.progress = progress;
		this.progressZ.progress = progress;
	}

	get(progress = null) {
		if (progress !== null) this.setProgress(progress);
		return new Vector3(this.progressX.get(), this.progressY.get(), this.progressZ.get());
	}

}

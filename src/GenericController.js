export default class GenericController {

	constructor(update, finishCondition, finish) {
		this.onUpdate = update;
		this.finishCondition = finishCondition;
		this.onFinish = finish;
	}

	finish() {
		this.onFinish(this);
	}

	update(delta) {
		if (this.finishCondition()) {
			this.finish();
			return;
		}
		this.onUpdate(delta);
	}

}

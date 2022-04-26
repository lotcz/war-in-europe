const HAVE_ENOUGH_DATA = 4;

export default class Sound {
	static soundEnabled = true;
	audio;

	constructor(src, options) {
		this.audio = new Audio();
		this.audio.src = src;
		options = options || {};
		this.audio.loop = options.loop || false;
		this.audio.autoplay = options.autoplay || false;
		this.audio.controls = options.controls || false;
		this.audio.muted = options.muted || false;
	}

	volume(value) {
		if (value !== undefined) {
			this.audio.volume = value;
		}
		return this.audio.volume;
	}

	speed(speed) {
		if (speed !== undefined) {
			this.audio.playbackRate = speed;
		}
		return this.audio.playbackRate;
	}

	rewind(time = 0) {
		this.audio.currentTime = time;
	}

	stop() {
		this.pause();
		this.rewind();
	}

	replay() {
		this.stop();
		this.play();
	}

	play() {
		if (!Sound.soundEnabled) return;
		if (this.audio.readyState === HAVE_ENOUGH_DATA) {
			this.audio.play();
		} else {
			this.audio.addEventListener("canplaythrough", event => {
				this.audio.play();
			});
		}
	}

	pause() {
		this.audio.pause();
	}

}

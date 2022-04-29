// Fix up for prefixing
window.AudioContext = window.AudioContext||window.webkitAudioContext;

export default class MyAudio {
	static defaultContext;

	constructor(src, options = {}) {
		this.context = MyAudio.getContext();
		this.options = options;
		this.playing = false;
		this.vol = 1;
		this.source = null;
		this.gain = null;
		this.fetch(src);
	}

	fetch(url) {
		const request = new XMLHttpRequest();
		request.open('GET', url, true);
		request.responseType = 'arraybuffer';
		request.onload = () => this.onSuccess(request);
		request.send()
	}

	onSuccess(request) {
		const audioData = request.response;
		this.context.decodeAudioData(
			audioData,
			(buffer) => this.onBuffer(buffer),
			(e) => this.onDecodeBufferError(e)
		);
	}

	onBuffer(buffer) {
		console.info('Got the buffer', buffer);
		this.buffer = buffer;
		if (this.playing) {
			this.connect();
		}
	}

	onDecodeBufferError (e) {
		console.log('Error decoding buffer: ' + e.message);
		console.log(e);
	}

	connect() {
		if (this.buffer) {
			this.source = this.context.createBufferSource();
			this.source.buffer = this.buffer;
			this.source.loop = this.options.loop || false;
			this.gain = this.context.createGain();
			this.gain.connect(this.context.destination);
			this.source.connect(this.gain);
			this.volume(this.vol);
			this.source.start();
		}
	}

	disconnect() {
		if (this.source) {
			this.source.stop();
			this.source.disconnect(0);
			this.gain.disconnect(0);
			this.gain = null;
			this.source = null;
		}
	}

	volume(value) {
		if (value !== undefined) {
			this.vol = value;
			if (this.gain) {
				this.gain.gain.value = this.vol;
			}
		}
		return this.vol;
	}

	rewind(time = 0) {
		//this.audio.currentTime = time;
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
		if (this.buffer && !this.playing) {
			this.connect();
		}
		this.playing = true;
	}

	pause() {
		if (this.source && this.playing) {
			this.disconnect();
		}
		this.playing = false;
	}

	static apiEnabled() {
		return (window.AudioContext);
	}

	static getContext() {
		if (!this.defaultContext) {
			this.defaultContext = new AudioContext();
		}
		return this.defaultContext;
	}

}

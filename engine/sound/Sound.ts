export interface SoundOptions {
	defaultGain?: number;
}

declare namespace window {
	const webkitAudioContext: typeof AudioContext;
}

export class Sound {
	private _audioContext?: AudioContext;
	private _gainNode?: GainNode;

	private _backgroundMusicSource: AudioBufferSourceNode;
	private _soundEffects: Record<string, AudioBuffer> = {};

	/**
	 * The AudioContext must be created as a result of a user event in order to be created successfully.
	 */
	async initialize({ defaultGain = 1 }: SoundOptions = {}) {
		this._audioContext = new (window.webkitAudioContext || AudioContext)();
		this._gainNode = this._audioContext.createGain();
		this._gainNode.gain.value = defaultGain;
		this._gainNode.connect(this._audioContext.destination);
	}

	private _convertMp3(mp3: ArrayBuffer): Promise<AudioBufferSourceNode> {
		return new Promise<AudioBufferSourceNode>(resolve => {
			this._audioContext.decodeAudioData(mp3, buffer => {
				const source = this._audioContext.createBufferSource();
				source.buffer = buffer;
				source.loop = true;
				source.connect(this._gainNode);

				resolve(source);
			});
		});
	}

	private _loadBuffer(buffer: ArrayBuffer): Promise<AudioBuffer> {
		return new Promise<AudioBuffer>(resolve => {
			this._audioContext.decodeAudioData(buffer, buffer => {
				resolve(buffer);
			});
		});
	}

	async playBackgroundMusic(data: ArrayBuffer) {
		if (this._backgroundMusicSource) {
			this._backgroundMusicSource.stop();
		}

		this._backgroundMusicSource = await this._convertMp3(data);
		this._backgroundMusicSource.start(0);
	}

	stopBackgroundMusic() {
		this._backgroundMusicSource.stop(0);
	}

	async loadSoundEffect(name: string, data: ArrayBuffer) {
		this._soundEffects[name] = await this._loadBuffer(data);
	}

	playSoundEffect(name: string) {
		const source = this._audioContext.createBufferSource();
		source.buffer = this._soundEffects[name];
		source.connect(this._gainNode);
		source.start(0);
	}
}

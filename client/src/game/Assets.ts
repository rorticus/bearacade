declare function require(path: string): string;

const images: Record<string, string> = {
	sky: require("./assets/sky.png"),
	fir1: require('./assets/fir1.png'),
	mountainsBack: require('./assets/mountains-back.png'),
	mountainsFront: require('./assets/mountains-front.png'),
	rock: require('./assets/rock.png'),
	obstacle: require('./assets/obstacle.png'),
	oilDrum: require('./assets/oil-drum.png')
};

export class Assets {
	private _images = new Map<string, CanvasImageSource>();

	async load(progress: (percent: number) => void) {
		const imageKeys = Object.keys(images);

		const total = imageKeys.length;
		let finished = 0;

		return Promise.all(
			imageKeys.map(
				async key =>
					new Promise(resolve => {
						const img = new Image();
						img.onload = () => {
							this._images.set(key, img);
							progress(++finished / total);
							resolve();
						};
						img.src = images[key];
					})
			)
		);
	}

	getImage(name: keyof typeof images): CanvasImageSource {
		return this._images.get(name);
	}
}

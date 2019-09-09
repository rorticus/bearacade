declare function require(path: string): string;

const images: Record<string, string> = {
	sky: require("./assets/sky.png")
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

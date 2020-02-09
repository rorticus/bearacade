import { CharacterPlacement, FontDefinition } from "../../../engine/interfaces";

declare function require(path: string): string;

const images: Record<string, string> = {
	sky: require("./assets/sky.png"),
	fir1: require("./assets/fir1.png"),
	mountainsBack: require("./assets/mountains-back.png"),
	mountainsFront: require("./assets/mountains-front.png"),
	rock: require("./assets/rock.png"),
	obstacle: require("./assets/obstacle.png"),
	oilDrum: require("./assets/oil-drum.png"),
	truck: require("./assets/truck.png"),
	truckWreck: require("./assets/truck-wreck.gif"),
	bearUpright: require("./assets/bear-upright.png"),
	bearUprightCarnage: require("./assets/bear-upright-carnage.gif"),
	scoreFont: require("./assets/score-font.png"),
	mainMenu: require("./assets/main-menu.png"),
	pressToStart: require("./assets/press-to-start.png"),
	highScoreMenu: require("./assets/highscore-menu.png"),
	furore: require('./assets/furore.png')
};

const fonts: Record<string, FontDefinition> = {
	score: {
		imageName: "scoreFont",
		definition: require("./assets/score-font.fnt")
	},
	highScore: {
		imageName: "furore",
		definition: require("./assets/furore.fnt")
	}
};

export class Assets {
	private _images = new Map<string, CanvasImageSource>();

	async load(progress: (percent: number) => void) {
		const imageKeys = Object.keys(images);

		const total = imageKeys.length;
		let finished = 0;

		await Promise.all(
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

		// load the fonts
		Object.keys(fonts).forEach(fontName => {
			const f = fonts[fontName];

			f.image = this.getImage(f.imageName);
			const characterInfo: Record<string, CharacterPlacement> = {};

			f.definition.split("\n").forEach(line => {
				if (line.indexOf("char ") === 0) {
					const lineParts = line.split(" ").reduce(
						(res, part) => {
							const [name, ...rest] = part.split("=");

							return {
								...res,
								[name]: parseInt(rest.join("="), 10)
							};
						},
						{} as Record<string, number>
					);

					characterInfo[String.fromCharCode(lineParts["id"])] = {
						x: lineParts["x"] || 0,
						y: lineParts["y"] || 0,
						width: lineParts["width"] || 0,
						height: lineParts["height"] || 0,
						xAdvance: lineParts["xadvance"] || 0,
						xOffset: lineParts["xoffset"] || 0,
						yOffset: lineParts["yoffset"] || 0
					};
				}
			});

			f.characterInfo = characterInfo;
		});
	}

	getImage(name: keyof typeof images): CanvasImageSource {
		return this._images.get(name);
	}

	getFont(name: keyof typeof fonts): FontDefinition {
		return fonts[name];
	}
}

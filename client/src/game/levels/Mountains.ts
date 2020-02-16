import { Curve, Hill, Track } from "../../../../engine/Track";
import { streetRoad } from "./Roads";
import { Level } from "./Level";
import { Assets } from "../Assets";
import { arrayChoice, chance, choice } from "../helpers";
import { SpriteFlag } from "../interfaces";

export class Mountains implements Level {
	private _initialized = false;
	private _lane = 1;

	constructor(private assets: Assets) {}

	generateTrack(track: Track) {
		const size = 300;

		if (!this._initialized) {
			this._initialized = true;

			track.addStraight(25, streetRoad);
		}

		let curves = [
			Curve.None,
			Curve.None,
			Curve.None,
			Curve.Easy,
			Curve.Easy,
			Curve.Medium,
			Curve.Hard,
			Curve.Medium,
			Curve.Hard,
			-Curve.Easy,
			-Curve.Easy,
			-Curve.Medium,
			-Curve.Hard,
			-Curve.Medium,
			-Curve.Hard
		];

		let hills = [
			Hill.None,
			Hill.None,
			Hill.Low,
			Hill.Low,
			Hill.Medium,
			Hill.Medium,
			Hill.High
		];

		const split1 = Math.round((size / 2) * Math.random());
		const split2 = Math.round(((size - split1) / 2) * Math.random());
		const split3 = size - split1 - split2;

		const startZ = track.lastZ();
		track.addRoad(
			split1,
			split2,
			split3,
			curves[Math.floor(Math.random() * curves.length)],
			hills[Math.floor(Math.random() * hills.length)],
			streetRoad
		);
		const endZ = track.lastZ();

		const spriteCount = 300;

		for (let i = 0; i < spriteCount; i++) {
			const side = chance(0.5) ? -1 : 1;

			const sprite = arrayChoice(["fir1", 50], ["rock", 50]);

			track.addStaticSprite(
				startZ + (endZ - startZ) * Math.random(),
				side * (1.5 + Math.random() * 6),
				-1,
				this.assets.getImage(sprite)
			);
		}

		// divide the new track into segments
		const granularity = 1500;
		const segments = Math.floor((endZ - startZ) / granularity);

		const left = -0.66;
		const middle = 0;
		const right = 0.66;

		for (let i = 0, z = startZ; i < segments; i++, z += granularity) {
			const action = arrayChoice(
				["straight", 50],
				["left", 25],
				["right", 25]
			);

			if (action === "left") {
				this._lane = Math.max(0, this._lane - 1);
			} else if (action === "right") {
				this._lane = Math.min(2, this._lane + 1);
			}

			const available = [];

			if (this._lane === 0) {
				available.push(middle);
				available.push(right);
			} else if (this._lane === 1) {
				available.push(left);
				available.push(right);
			} else if (this._lane === 2) {
				available.push(left);
				available.push(middle);
			}

			available.forEach(x => {
				const spr = arrayChoice(
					["bear", 25],
					["fuel", 5],
					["oil", 25],
					["", 100]
				);

				if (spr === "oil") {
					const sprite = track.addStaticSprite(
						z,
						x,
						-1,
						this.assets.getImage("oilDrum")
					);
					sprite.flags = SpriteFlag.Solid;
				} else if (spr === "fuel") {
					const sprite = track.addStaticSprite(
						z,
						x,
						-1,
						this.assets.getImage("fuelcan")
					);

					sprite.flags = SpriteFlag.Fuel;
				} else if (spr === "bear") {
					const sprite = track.addStaticSprite(
						z,
						x,
						-1,
						this.assets.getImage("bearUpright")
					);

					sprite.flags = SpriteFlag.Bear;
				}
			});
		}
	}

	getBackgrounds() {
		return [
			{
				asset: this.assets.getImage("sky"),
				parallaxMultiplier: 0
			},
			{
				asset: this.assets.getImage("mountainsBack"),
				parallaxMultiplier: 0.01
			},
			{
				asset: this.assets.getImage("mountainsFront"),
				parallaxMultiplier: 0.05
			}
		];
	}
}

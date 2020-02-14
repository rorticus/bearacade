import { Curve, Hill, Track } from "../../../../engine/Track";
import { streetRoad } from "./Roads";
import { Level } from "./Level";
import { Assets } from "../Assets";
import { arrayChoice, chance, choice } from "../helpers";
import { SpriteFlag } from "../interfaces";

export class Mountains implements Level {
	private _initialized = false;

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
		const granularity = 400;
		const segments = Math.floor((endZ - startZ) / granularity);

		let lastBear = [startZ, startZ, startZ];
		const bearBuffer = 1000;

		for (let i = 0, z = startZ; i < segments; i++, z += granularity) {
			if (chance(0.08)) {
				const side = arrayChoice([-0.66, 33], [0, 33], [0.66, 33]);

				if (z - lastBear[side] < bearBuffer) {
					continue;
				}

				const sprite = track.addStaticSprite(
					z,
					side,
					-1,
					this.assets.getImage("oilDrum")
				);
				sprite.flags = SpriteFlag.Solid;
				continue;
			}

			if (chance(0.15)) {
				const side = arrayChoice([-0.66, 33], [0, 33], [0.66, 33]);

				lastBear[side] = z;

				if (chance(0.25)) {
					const sprite = track.addStaticSprite(
						z,
						side,
						-1,
						this.assets.getImage("fuelcan")
					);

					sprite.flags = SpriteFlag.Fuel;
				} else {
					const sprite = track.addStaticSprite(
						z,
						side,
						-1,
						this.assets.getImage("bearUpright")
					);

					sprite.flags = SpriteFlag.Bear;
				}
			}
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

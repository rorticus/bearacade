import { Assets } from "../Assets";
import {
	FontDefinition,
	Graphics2D,
	Layer
} from "../../../../engine/interfaces";

const spriteLife = 2;

export class ComboLayer implements Layer {
	private _font: FontDefinition;
	private _sprites: { x: number; y: number; combo: number; life: number; vx: number; vy: number; }[];

	constructor(assets: Assets) {
		this._font = assets.getFont("highScore");
		this._sprites = [];
	}

	addSprite(x: number, y: number, combo: number) {
		console.log("add sprite", x, y, combo);
		this._sprites.push({
			x,
			y,
			combo,
			life: 0,
			vx: (Math.random() * 2 - 1) * 25,
			vy: (0 - Math.random() - 1) * 25
		});
	}

	render(graphics: Graphics2D): void {
		// this is a bit slow...
		// this._sprites.forEach(sprite => {
		// 	graphics.text(this._font, `${sprite.combo}x`, sprite.x, sprite.y);
		// });
	}

	update(deltaInSeconds: number) {
		this._sprites = this._sprites.filter(sprite => {
			sprite.life += deltaInSeconds;
			sprite.x += sprite.vx * deltaInSeconds;
			sprite.y += sprite.vy * deltaInSeconds;
			return sprite.life < spriteLife;
		});
	}
}

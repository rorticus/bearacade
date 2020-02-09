import { Assets } from "../Assets";
import { Mouse } from "../../../../engine/input/Mouse";
import { FontDefinition, Graphics2D } from "../../../../engine/interfaces";
import { HighScore } from "../interfaces";

export class HighScoreMenu {
	private _background: CanvasImageSource;
	private _font: FontDefinition;

	constructor(private _assets: Assets, private _scores: HighScore[]) {
		this._background = _assets.getImage("highScoreMenu");
		this._font = _assets.getFont("highScore");
	}

	render(graphics: Graphics2D) {
		graphics.image(this._background, 0, 0);

		let y = 60;
		const left = 15;
		const right = 305;

		for (let i = 0; i < this._scores.length && i < 9; i++) {
			const score = this._scores[i];

			const leftText = score.name || '';
			const rightText = String(score.score);

			const dim = graphics.textDimensions(this._font, rightText);

			graphics.text(this._font, leftText, left, y);
			graphics.text(
				this._font,
				rightText,
				right - dim.width,
				y
			);

			y += dim.height + 5;
		}
	}
}

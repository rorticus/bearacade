import { Assets } from "../Assets";
import {
	FontDefinition,
	Graphics2D,
	Layer
} from "../../../../engine/interfaces";

export class ScoreLayer implements Layer {
	private _font: FontDefinition;
	score: number = 0;

	constructor(assets: Assets) {
		this._font = assets.getFont("score");
	}

	render(graphics: Graphics2D): void {
	    const scoreText = `${this.score}`;

	    const dimensions = graphics.textDimensions(this._font, scoreText);

	    graphics.text(this._font, scoreText, 320 - 16 - dimensions.width, 0);
    }
}

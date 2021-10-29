import { Graphics2D } from "../../../../engine/interfaces";
import { Assets } from "../Assets";
import { Engine } from "../../../../engine/Engine";

export class PauseMenu {
	private _background: CanvasImageSource;

	constructor(
		private _assets: Assets,
		private _engine: Engine,
		private _ready: () => void
	) {
		this._background = _assets.getImage("paused");
	}

	render(graphics: Graphics2D) {
		graphics.image(this._background, 0, 0);
	}

	update() {
		if (
			this._engine.mouse.mouseClick ||
			this._engine.keyboard.enterClick ||
			this._engine.keyboard.escapeClick ||
			this._engine.keyboard.spaceClick
		) {
			this._ready();
			return;
		}
	}
}

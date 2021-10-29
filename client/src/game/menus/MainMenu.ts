import { Graphics2D } from "../../../../engine/interfaces";
import { Assets } from "../Assets";
import { Engine } from "../../../../engine/Engine";

export class MainMenu {
	private _background: CanvasImageSource;
	private _pressToStart: CanvasImageSource;
	private _timer = 0;

	constructor(
		private _assets: Assets,
		private _engine: Engine,
		private _ready: () => void
	) {
		this._background = _assets.getImage("mainMenu");
		this._pressToStart = _assets.getImage("pressToStart");
	}

	render(graphics: Graphics2D) {
		graphics.image(this._background, 0, 0);

		if (Math.floor(this._timer * 2) % 2) {
			graphics.image(this._pressToStart, 0, 0);
		}
	}

	update(deltaInSeconds: number) {
		this._timer += deltaInSeconds;

		if (this._engine.mouse.mouseClick) {
			this._ready();
		}
	}
}

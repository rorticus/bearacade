import { Assets } from "../Assets";
import {
	FontDefinition,
	Graphics2D,
	Layer
} from "../../../../engine/interfaces";

export class FuelLayer implements Layer {
	private _fuelBar: CanvasImageSource;
	fuel: number = 0;

	constructor(assets: Assets) {
		this._fuelBar = assets.getImage("fuelbar");
	}

	render(graphics: Graphics2D): void {
		const top = 5;
		const left = 10;
		const width = Math.floor(300 * (this.fuel / 100));
		const height = 16;

		graphics.clippedImage(this._fuelBar, left, top, width, height);
	}
}

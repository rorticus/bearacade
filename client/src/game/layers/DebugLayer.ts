import { Assets } from "../Assets";
import {
    FontDefinition,
    Graphics2D,
    Layer
} from "../../../../engine/interfaces";
import {Engine} from "../../../../engine/Engine";

export class DebugLayer implements Layer {
    private _font: FontDefinition;

    constructor(assets: Assets, private _engine: Engine) {
        this._font = assets.getFont("highScore");
    }

    render(graphics: Graphics2D): void {
        const zText = `${this._engine.position.z}`;

        const dimensions = graphics.textDimensions(this._font, zText);

        graphics.text(this._font, zText, 320 - 16 - dimensions.width, 240 - dimensions.height - 5);
    }
}

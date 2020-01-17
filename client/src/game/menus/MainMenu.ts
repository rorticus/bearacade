import {MenuGraphics} from "../../../../engine/interfaces";
import {Assets} from "../Assets";

export class MainMenu {
    constructor(private _assets: Assets) {
    }

    render(graphics: MenuGraphics) {
        graphics.rect(0, 0, 160, 160, '#000000');

        graphics.text(this._assets.getFont('score'), '123456', 0, 0);
    }
}
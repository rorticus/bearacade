import {MenuGraphics} from "../../../../engine/interfaces";

export class MainMenu {
    render(graphics: MenuGraphics) {
        graphics.rect(0, 0, 160, 160, '#000000');
    }
}
import {CanvasGraphics} from "./renderer/CanvasGraphics";
import {Sound} from "./sound/Sound";
import {Renderer} from "./renderer/Renderer";

export class Engine {
    sound: Sound;
    renderer: Renderer;

    constructor(mountPoint: HTMLCanvasElement) {
        const context = mountPoint.getContext('2d');

        this.renderer = new Renderer(new CanvasGraphics(context));
        this.sound = new Sound();
    }
}
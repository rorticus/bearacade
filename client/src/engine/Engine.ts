import {Renderer} from "./renderer/Renderer";
import {Sound} from "./sound/Sound";

export class Engine {
    renderer: Renderer;
    sound: Sound;

    constructor(mountPoint: HTMLCanvasElement) {
        const context = mountPoint.getContext('2d');

        this.renderer = new Renderer(context);
        this.sound = new Sound();
    }
}
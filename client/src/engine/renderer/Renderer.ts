import {CanvasGraphics} from "./CanvasGraphics";

export class Renderer {
    private _graphics: CanvasGraphics;

    segmentLength = 200;
    roadWidth = 2000;
    rumbleLength = 3;
    lanes = 2;
    drawDistance = 300;
    centrifugal = 0.3;


    constructor(graphics: CanvasGraphics) {
        this._graphics = graphics;
    }
}
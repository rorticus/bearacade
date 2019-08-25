import {CanvasGraphics} from "./renderer/CanvasGraphics";
import {Sound} from "./sound/Sound";
import {Background, Renderer} from "./renderer/Renderer";
import {Camera, Coordinate} from "./interfaces";
import {Track} from "./Track";
import {Keyboard} from "./input/Keyboard";

export class Engine {
    sound: Sound;
    renderer: Renderer;
    keyboard: Keyboard;

    track: Track = new Track();

    private _gameTime = 0;
    private _camera: Camera = {
        height: 1000,
        fieldOfView: 100,
        depth: 1 / Math.tan((100 / 2) * Math.PI / 180)
    };
    private _playerZ: number;
    private _paused = true;
    private _position: Coordinate = {
        x: 0,
        y: 0,
        z: 0
    };
    private _backgroundOffset = 1;
    private _speed = 0;
    private _segmentCurve = 0;

    constructor(mountPoint: HTMLCanvasElement) {
        const context = mountPoint.getContext('2d');

        this._playerZ = this._camera.height * this._camera.depth;

        this.renderer = new Renderer(new CanvasGraphics({
            context,
            width: mountPoint.width,
            height: mountPoint.height
        }));
        this.keyboard = new Keyboard();
        this.sound = new Sound();
    }

    start() {
    }

    applyBackgrounds(backgrounds: Background[]) {
        this.renderer.backgrounds = backgrounds;
    }

    update(deltaInSeconds: number) {
        if (this._paused) {
            return;
        }

        const offRoad = (this._position.x < -1 || this._position.x > 1);

        const segment = this.track.findSegment(this._position.z + this._playerZ);
        const speedPercent = this._speed / (offRoad ? segment.offRoadMaxSpeed : segment.roadMaxSpeed);
        const dx = deltaInSeconds * 2 / speedPercent;

        this._gameTime += deltaInSeconds;
        this._segmentCurve = segment.curve;
        this._backgroundOffset = this._segmentCurve * speedPercent;

        this._position.z = this._position.z + deltaInSeconds * this._speed;

        if (this.keyboard.leftKey) {
            this._position.x -= dx;
        } else if (this.keyboard.rightKey) {
            this._position.x += dx;
        }

        this._position.x -= dx * speedPercent * this._segmentCurve * this._speed;

        if(this.keyboard.upKey) {
            this._speed += segment.accel * deltaInSeconds;
        } else if(this.keyboard.downKey) {
            this._speed += segment.breaking * deltaInSeconds;
        } else {
            this._speed += segment.roadDecel * deltaInSeconds;
        }

        if (offRoad && this._speed > segment.offRoadMaxSpeed) {
            this._speed += segment.offRoadDecel * deltaInSeconds;
        }
    }

    render() {
        // background
        this.renderer.renderBackground(this._backgroundOffset);

        // road
        this.renderer.renderRoad(this._camera, this.track, this._position, this._playerZ);
    }
}
import {Engine} from "../engine/Engine";
import {Server} from "./Server";
import {Assets} from "./Assets";

export interface GameOptions {
    mountPoint: HTMLCanvasElement;
    clientId: string;
}

export class Game {
    private _engine: Engine;
    private _server: Server;
    private _assets: Assets;

    private _fps = 60;
    private _step = 1 / this._fps;

    constructor({mountPoint, clientId}: GameOptions) {
        this._engine = new Engine(mountPoint);
        this._server = new Server(clientId);
        this._assets = new Assets();

        this._engine.renderer.lanes = 3;
    }

    async preload() {
        await this._assets.load((percent) => {
            console.log(`Downloaded assets ${Math.round(percent * 100)}`);
        });
    }

    async start() {
        try {
            await this._server.connect();
        } catch (e) {
            console.error(e);
        }

        await this.preload();

        this._engine.applyBackgrounds([{
            asset: this._assets.getImage('sky'),
            parallaxMultiplier: 0
        }]);

        this._engine.track.addStraight(100, '#ACACAC');
        this._engine.start();

        let last = Date.now();
        let gdt = 0;

        const frame = () => {
            const now = Date.now();
            const dt = Math.min(1, (now - last) / 1000);
            gdt = gdt + dt;

            while (gdt > this._step) {
                gdt = gdt - this._step;
                this._update(this._step);
            }

            this._engine.render();

            last = now;

            requestAnimationFrame(frame);
        };

        frame();
    }

    private _update(deltaInSeconds: number) {
        this._engine.update(deltaInSeconds);
    }
}
import {Engine} from "../engine/Engine";
import {Server} from "./Server";

export interface GameOptions {
    mountPoint: HTMLCanvasElement;
    clientId: string;
}

export class Game {
    private _engine: Engine;
    private _server: Server;

    constructor({mountPoint, clientId}: GameOptions) {
        this._engine = new Engine(mountPoint);
        this._server = new Server(clientId);
    }

    async start() {
        try {
            await this._server.connect();
        } catch (e) {
            console.error(e);
        }
    }
}
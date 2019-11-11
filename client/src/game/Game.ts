import { Engine } from "../../../engine/Engine";
import { Server } from "./Server";
import { Assets } from "./Assets";
import { RoadType } from "../../../engine/Track";
import { Level } from "./levels/Level";
import { Mountains } from "./levels/Mountains";

export interface GameOptions {
	mountPoint: HTMLCanvasElement;
	clientId: string;
}

const lanes = [-0.75, 0, 0.75];

export class Game {
	private _engine: Engine;
	private _server: Server;
	private _assets: Assets;
	private _level: Level;

	private _fps = 60;
	private _step = 1 / this._fps;
	private _lane = 0;
	private _leftKey = false;
	private _rightKey = false;

	constructor({ mountPoint, clientId }: GameOptions) {
		this._engine = new Engine(mountPoint);
		this._server = new Server(clientId);
		this._assets = new Assets();

		this._level = new Mountains(this._assets);

		this._engine.renderer.lanes = 3;
	}

	async preload() {
		await this._assets.load(percent => {
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

		this._engine.applyBackgrounds(this._level.getBackgrounds());

		this._level.generateTrack(this._engine.track);
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

		if (this._engine.keyboard.leftKey && !this._leftKey) {
			this._leftKey = true;
			this._lane = Math.max(-1, this._lane - 1);
		} else if (!this._engine.keyboard.leftKey && this._leftKey) {
			this._leftKey = false;
		}

		if (this._engine.keyboard.rightKey && !this._rightKey) {
			this._rightKey = true;
			this._lane = Math.min(1, this._lane + 1);
		} else if (!this._engine.keyboard.rightKey && this._rightKey) {
			this._rightKey = false;
		}

		const targetX = lanes[this._lane + 1];

		if (this._engine.position.x < targetX) {
			this._engine.position.x = Math.min(
				this._engine.position.x + 0.1,
				targetX
			);
		} else if (this._engine.position.x > targetX) {
			this._engine.position.x = Math.max(
				this._engine.position.x - 0.1,
				targetX
			);
		}

		this._engine.speed = this._engine.renderer.segmentLength * 15;

		const playerSegment = this._engine.track.findSegment(
			this._engine.position.z
		);
		while (
			playerSegment.index + this._engine.renderer.drawDistance >
			this._engine.track.segments.length
		) {
			this._level.generateTrack(this._engine.track);
		}
	}
}
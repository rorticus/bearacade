import { Engine } from "../../../engine/Engine";
import { Server } from "./Server";
import { Assets } from "./Assets";
import { Sprite } from "../../../engine/Track";
import { Level } from "./levels/Level";
import { Mountains } from "./levels/Mountains";
import { HighScore, SpriteFlag } from "./interfaces";
import { MainMenu } from "./menus/MainMenu";
import { ScoreLayer } from "./layers/ScoreLayer";
import { HighScoreMenu } from "./menus/HighScoreMenu";
import {FuelLayer} from "./layers/FuelLayer";

export interface GameOptions {
	mountPoint: HTMLCanvasElement;
	clientId: string;
}

const lanes = [-0.75, 0, 0.75];

function wait(time: number) {
	return new Promise(resolve => {
		setTimeout(resolve, time);
	});
}

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
	private _isDriving = false;

	private _scoreLayer: ScoreLayer;
	private _fuelLayer: FuelLayer;

	private _score = 0;
	private _fuel = 100;

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

		this._scoreLayer = new ScoreLayer(this._assets);
		this._fuelLayer = new FuelLayer(this._assets);

		this._engine.addLayer(this._scoreLayer);
		this._engine.addLayer(this._fuelLayer);

		this._engine.addMenu(
			new MainMenu(this._assets, this._engine.mouse, async () => {
				await this._engine.sound.playBackgroundMusic(
					this._assets.getSound("background")
				);
				await this._engine.sound.loadSoundEffect(
					"bearHit",
					this._assets.getSound("bearHit")
				);
				await this._engine.sound.loadSoundEffect(
					"crash",
					this._assets.getSound("crash")
				);
				this._engine.removeMenu();
			})
		);

		this._isDriving = true;

		this._engine.applyBackgrounds(this._level.getBackgrounds());
		this._engine.playerSprite = this._assets.getImage("truck");
		this._engine.onCollision = (sprite: Sprite) => {
			if (this._isDriving) {
				if ((sprite.flags & SpriteFlag.Solid) === SpriteFlag.Solid) {
					// trigger the explosion animation
					// pause the game
					this._isDriving = false;
					this._engine.playerSprite = this._assets.getImage(
						"truckWreck"
					);
					this._engine.sound.playSoundEffect('crash');

					// end game
					Promise.all([
						new Promise<HighScore[]>(async resolve => {
							const scores = await this._server.postHighScore(
								this._score
							);
							resolve(scores);
						}),
						wait(3000)
					]).then(([scores]: any) => {
						this._engine.sound.stopBackgroundMusic();
						this._engine.addMenu(
							new HighScoreMenu(this._assets, scores)
						);
					});
				} else if (
					(sprite.flags & SpriteFlag.Bear) ===
					SpriteFlag.Bear
				) {
					if (!sprite.data) {
						sprite.image = this._assets.getImage(
							"bearUprightCarnage"
						);
						sprite.data = true;
						this._score += 350;
						this._scoreLayer.score = this._score;
						this._engine.sound.playSoundEffect('bearHit');
					}
				}
			}
		};

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
		this._fuel = Math.max(0, this._fuel - 0.05);
		this._fuelLayer.fuel = this._fuel;

		this._engine.update(deltaInSeconds);

		if (this._engine.isPaused() || !this._server.authorized) {
			return;
		}

		if (this._isDriving) {
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
					this._engine.position.x + 0.025,
					targetX
				);
			} else if (this._engine.position.x > targetX) {
				this._engine.position.x = Math.max(
					this._engine.position.x - 0.025,
					targetX
				);
			}

			this._engine.speed = this._engine.renderer.segmentLength * 15;
		} else {
			this._engine.speed *= 0.98;
		}

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

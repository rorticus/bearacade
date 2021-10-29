import { CanvasGraphics } from "./renderer/CanvasGraphics";
import { Sound } from "./sound/Sound";
import { Background, Renderer, spriteScale } from "./renderer/Renderer";
import { Camera, Coordinate, Menu, Graphics2D, Layer } from "./interfaces";
import { Sprite, Track } from "./Track";
import { Keyboard } from "./input/Keyboard";
import { CanvasGraphics2D } from "./renderer/CanvasGraphics2D";
import { Mouse } from "./input/Mouse";

function overlap(
	x1: number,
	w1: number,
	x2: number,
	w2: number,
	percent: number = 1
) {
	const half = percent / 2;
	const min1 = x1 - w1 * half;
	const max1 = x1 + w1 * half;
	const min2 = x2 - w2 * half;
	const max2 = x2 + w2 * half;
	return !(max1 < min2 || min1 > max2);
}

export class Engine {
	sound: Sound;
	renderer: Renderer;
	keyboard: Keyboard;
	mouse: Mouse;
	graphics2d: Graphics2D;
	menus: Menu[] = [];
	layers: Layer[] = [];

	track: Track = new Track();

	private _gameTime = 0;
	private _camera: Camera = {
		height: 2000,
		fieldOfView: 100,
		depth: 1 / Math.tan(((80 / 2) * Math.PI) / 180)
	};
	private _playerZ: number;
	private _paused = true;
	position: Coordinate = {
		x: 0,
		y: 0,
		z: 0
	};
	private _backgroundOffset = 1;
	private _segmentCurve = 0;
	speed = 0;
	centrifugal = 0.3;
	playerSprite: any;
	onCollision: (sprite: Sprite) => void | undefined;

	constructor(mountPoint: HTMLCanvasElement) {
		const context = mountPoint.getContext("2d");

		this._playerZ = this._camera.height * this._camera.depth;

		this.renderer = new Renderer(
			new CanvasGraphics({
				context,
				width: mountPoint.width,
				height: mountPoint.height
			})
		);

		this.keyboard = new Keyboard();
		this.sound = new Sound();
		this.mouse = new Mouse(this.sound);
		this.graphics2d = new CanvasGraphics2D(context);
	}

	start() {
		this._paused = false;
	}

	isPaused() {
		return this._paused;
	}

	pause() {
		this._paused = true;
	}

	applyBackgrounds(backgrounds: Background[]) {
		this.renderer.backgrounds = backgrounds;
	}

	update(deltaInSeconds: number) {
		this.keyboard.update();
		this.mouse.update();

		this.menus.forEach(menu => menu.update && menu.update(deltaInSeconds));

		if (this._paused || this.menus.length) {
			return;
		}

		const offRoad = this.position.x < -1 || this.position.x > 1;

		const segment = this.track.findSegment(this.position.z + this._playerZ);
		const type = segment.type;
		const speedPercent =
			this.speed / (offRoad ? type.offRoadMaxSpeed : type.onRoadMaxSpeed);
		const playerW =
			(this.playerSprite ? this.playerSprite.width : 0) * spriteScale;

		this._gameTime += deltaInSeconds;
		this._segmentCurve = segment.curve;
		this._backgroundOffset = this._segmentCurve * speedPercent;

		this.position.z = this.position.z + deltaInSeconds * this.speed;

		if (offRoad && this.speed > type.offRoadMaxSpeed) {
			this.speed += type.offRoadDecel * deltaInSeconds;
		} else if (this.speed > type.onRoadMaxSpeed) {
			this.speed = type.onRoadMaxSpeed;
		}

		if (this.speed < 0) {
			this.speed = 0;
		}

		if (this.position.x < -2) {
			this.position.x = -2;
		}
		if (this.position.x > 2) {
			this.position.x = 2;
		}

		segment.sprites.forEach(sprite => {
			if (sprite.hidden) {
				return;
			}
			// get the player sprite bounds
			const spriteWidth = sprite.image.width * spriteScale;

			if (overlap(this.position.x, playerW, sprite.offset, spriteWidth)) {
				this.onCollision && this.onCollision(sprite);
			}
		});
	}

	render() {
		if (this.menus.length) {
			this.menus.forEach(menu => menu.render(this.graphics2d));
			return;
		}

		// background
		this.renderer.renderBackground(this._backgroundOffset);

		// road
		this.renderer.renderRoad(
			this._camera,
			this.track,
			this.position,
			this._playerZ
		);

		// player
		if (this.playerSprite) {
			this.renderer.renderPlayer(
				this._camera,
				this._playerZ,
				this.playerSprite
			);
		}

		this.layers.forEach(layer => layer.render(this.graphics2d));
	}

	addMenu(menu: Menu) {
		this.menus.push(menu);

		menu.initialize && menu.initialize(this);
	}

	removeMenu(menu?: Menu) {
		if (menu) {
			this.menus = this.menus.filter(m => m === menu);
		} else {
			this.menus.pop();
		}
	}

	addLayer(layer: Layer) {
		this.layers.push(layer);

		layer.initialize && layer.initialize(this);
	}

	removeLayer(layer?: Layer) {
		if (layer) {
			this.layers = this.layers.filter(m => m === layer);
		} else {
			this.layers.pop();
		}
	}
}

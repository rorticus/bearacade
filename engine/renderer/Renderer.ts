import { CanvasGraphics } from "./CanvasGraphics";
import { Camera, Coordinate } from "../interfaces";
import { Track } from "../Track";

export interface Background {
	asset: CanvasImageSource;
	parallaxMultiplier: number;
}

export class Renderer {
	private _graphics: CanvasGraphics;

	segmentLength = 200;
	roadWidth = 2000;
	lanes = 2;
	drawDistance = 300;

	get height() {
		return this._graphics.height;
	}

	private _backgrounds: Background[] = [];

	set backgrounds(backgrounds: Background[]) {
		this._backgrounds = backgrounds;
	}

	constructor(graphics: CanvasGraphics) {
		this._graphics = graphics;
	}

	project(
		p: Coordinate,
		cameraX: number,
		cameraY: number,
		cameraZ: number,
		cameraDepth: number,
		width: number,
		height: number,
		roadWidth: number
	) {
		// translate from world coordinates to camera coordinates
		const cx = p.x - cameraX;
		const cy = p.y - cameraY;
		const cz = p.z - cameraZ;

		// d / z of projection formula
		const scale = cameraDepth / cz;

		// project into screen space
		const screenX = Math.round(width / 2 + (scale * cx * width) / 2);
		const screenY = Math.round(height / 2 - (scale * cy * height) / 2);
		const screenWidth = Math.round((scale * roadWidth * width) / 2);

		return {
			screen: {
				x: screenX,
				y: screenY,
				w: screenWidth,
				scale
			},
			camera: {
				x: cx,
				y: cy,
				z: cz
			}
		};
	}

	overlap(
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

	renderBackground(offset: number) {
		this._graphics.fill('#000000');

		this._backgrounds.forEach(background => {
			this._graphics.background(
				background.asset,
				this._graphics.width,
				this._graphics.height,
				background.parallaxMultiplier
			);
		});
	}

	renderRoad(
		camera: Camera,
		track: Track,
		position: Coordinate,
		playerZ: number
	) {
		const baseSegment = track.findSegment(position.z);
		const basePercent =
			(position.z % this.segmentLength) / this.segmentLength;
		const playerSegment = track.findSegment(position.z + playerZ);
		const playerPercent =
			((position.z + playerZ) % this.segmentLength) / this.segmentLength;
		const playerY =
			playerSegment.p1.y +
			(playerSegment.p2.y - playerSegment.p1.y) * playerPercent;

		let dx = -(baseSegment.curve * basePercent);
		let x = 0;
		let maxY = this.height;

		for (let n = 0; n < this.drawDistance; n++) {
			const segment =
				track.segments[(baseSegment.index + n) % track.segments.length];

			const p1 = this.project(
				segment.p1,
				position.x * this.roadWidth - x,
				playerY + camera.height,
				position.z,
				camera.depth,
				this._graphics.width,
				this.height,
				this.roadWidth
			);
			const p2 = this.project(
				segment.p2,
				position.x * this.roadWidth - x - dx,
				playerY + camera.height,
				position.z,
				camera.depth,
				this._graphics.width,
				this.height,
				this.roadWidth
			);

			x += dx;
			dx += segment.curve;

			if (
				p1.camera.z <= camera.depth ||
				p2.screen.y >= maxY ||
				p2.screen.y >= p1.screen.y
			) {
				continue;
			}

			this._graphics.segment(
				this._graphics.width,
				this.lanes,
				p1.screen.x,
				p1.screen.y,
				p1.screen.w,
				p2.screen.x,
				p2.screen.y,
				p2.screen.w,
				1,
				!!(segment.index % 2),
				segment.type
			);

			maxY = p1.screen.y;
		}
	}
}

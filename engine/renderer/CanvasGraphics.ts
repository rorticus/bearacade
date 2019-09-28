import { ColorPalette } from "../interfaces";
import { RoadType } from "../Track";

export const spriteScale = 0.3 * (1 / 150);

export interface CanvasGraphicsOptions {
	context: CanvasRenderingContext2D;
	width: number;
	height: number;
}

export class CanvasGraphics {
	private _context: CanvasRenderingContext2D;
	private _width: number;
	private _height: number;

	constructor(options: CanvasGraphicsOptions) {
		this._context = options.context;
		this._width = options.width;
		this._height = options.height;
	}

	get width() {
		return this._width;
	}

	get height() {
		return this._height;
	}

	rumbleWidth(projectedRoadWidth: number, lanes: number) {
		return projectedRoadWidth / Math.max(6, 2 * lanes);
	}

	laneMarkerWidth(projectedRoadWidth: number, lanes: number) {
		return projectedRoadWidth / Math.max(32, 8 * lanes);
	}

	polygon(
		x1: number,
		y1: number,
		x2: number,
		y2: number,
		x3: number,
		y3: number,
		x4: number,
		y4: number,
		color: string
	) {
		const context = this._context;

		context.fillStyle = color;
		context.beginPath();
		context.moveTo(x1, y1);
		context.lineTo(x2, y2);
		context.lineTo(x3, y3);
		context.lineTo(x4, y4);
		context.closePath();
		context.fill();
	}

	segment(
		width: number,
		lanes: number,
		x1: number,
		y1: number,
		w1: number,
		x2: number,
		y2: number,
		w2: number,
		fog: number,
		even: boolean,
		roadType: RoadType
	) {
		const context = this._context;

		const r1 = this.rumbleWidth(w1, lanes);
		const r2 = this.rumbleWidth(w2, lanes);
		const l1 = this.laneMarkerWidth(w1, lanes);
		const l2 = this.laneMarkerWidth(w2, lanes);

		// draw the background
		context.fillStyle = even
			? roadType.evenGrassColor
			: roadType.oddGrassColor;
		context.fillRect(0, y2, width, y1 - y2);

		// draw the rumble strips
		this.polygon(
			x1 - w1 - r1,
			y1,
			x1 - w1,
			y1,
			x2 - w2,
			y2,
			x2 - w2 - r2,
			y2,
			roadType.rumbleColor
		);
		this.polygon(
			x1 + w1 + r1,
			y1,
			x1 + w1,
			y1,
			x2 + w2,
			y2,
			x2 + w2 + r2,
			y2,
			roadType.rumbleColor
		);

		// draw the road
		this.polygon(
			x1 - w1,
			y1,
			x1 + w1,
			y1,
			x2 + w2,
			y2,
			x2 - w2,
			y2,
			even ? roadType.evenRoadColor : roadType.oddRoadColor
		);

		// draw the road divider
		const laneColor = even ? roadType.evenLaneColor : roadType.oddRoadColor;
		if (laneColor) {
			const lanew1 = (w1 * 2) / lanes;
			const lanew2 = (w2 * 2) / lanes;
			let lanex1 = x1 - w1 + lanew1;
			let lanex2 = x2 - w2 + lanew2;

			for (
				let lane = 1;
				lane < lanes;
				lanex1 += lanew1, lanex2 += lanew2, lane++
			) {
				this.polygon(
					lanex1 - l1 / 2,
					y1,
					lanex1 + l1 / 2,
					y1,
					lanex2 + l2 / 2,
					y2,
					lanex2 - l2 / 2,
					y2,
					laneColor
				);
			}
		}
	}

	sprite(
		width: number,
		height: number,
		roadWidth: number,
		image: any,
		scale: number,
		destX: number,
		destY: number,
		offsetX?: number,
		offsetY?: number,
		clipY?: number
	) {
		const context = this._context;

		const destW =
			((image.width * scale * width) / 2) * (spriteScale * roadWidth);
		const destH =
			((image.height * scale * width) / 2) * (spriteScale * roadWidth);

		const x = destX + destW * (offsetX || 0);
		const y = destY + destH * (offsetY || 0);

		const clipH = clipY ? Math.max(0, y + destH - clipY) : 0;
		if (clipH < destH) {
			context.drawImage(
				image,
				0,
				0,
				image.width,
				image.height - (image.height * clipH) / destH,
				x,
				y,
				destW,
				destH - clipH
			);
		}

		return {
			x,
			y,
			w: destW,
			h: destH
		};
	}

	background(background: any, width: number, height: number, offset: number) {
		const context = this._context;

		const imageW = background.width / 2;
		const imageH = background.height;

		const sourceX = 0;
		const sourceY = 0;
		const sourceW = background.width;
		const sourceH = imageH;

		const destX = background.width * offset;
		const destY = 0;
		const destW = background.width;
		const destH = height;

		context.drawImage(
			background,
			sourceX,
			sourceY,
			sourceW,
			sourceH,
			destX,
			destY,
			destW,
			destH
		);

		if (destX > 0) {
			context.drawImage(
				background,
				sourceX,
				sourceY,
				sourceW,
				sourceH,
				destX - destW,
				destY,
				destW,
				destH
			);
		}

		if (destX + destW < width) {
			context.drawImage(
				background,
				sourceX,
				sourceY,
				sourceW,
				sourceH,
				destX + destW,
				destY,
				destW,
				destH
			);
		}
	}

	score(width: number, height: number, score: number) {
		const str = String(score);
		const context = this._context;

		context.fillStyle = "#ffffff";
		context.font = "72px Arial Black";
		context.strokeStyle = "#000000";
		context.lineWidth = 2;
		context.fillText(str, 15, 75);
		context.strokeText(str, 15, 75);
	}

	timer(width: number, height: number, timeLeft: number) {
		const str = String(timeLeft);
		const context = this._context;

		const x = width - 100;
		const y = 75;

		context.fillStyle = "#ffff00";
		context.font = "72px Arial Black";
		context.strokeStyle = "#000000";
		context.lineWidth = 2;
		context.fillText(str, x, y);
		context.strokeText(str, x, y);
	}

	fill(color: string) {
		this._context.fillStyle = color;
		this._context.fillRect(0, 0, this._width, this._height);
	}
}

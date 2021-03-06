import { FontDefinition, Graphics2D } from "../interfaces";

export class CanvasGraphics2D implements Graphics2D {
	constructor(private _context: CanvasRenderingContext2D) {
		_context.imageSmoothingEnabled = false;
	}

	rect(
		x: number,
		y: number,
		width: number,
		height: number,
		color: string
	): void {
		this._context.fillStyle = color;
		this._context.fillRect(x, y, width, height);
	}

	text(font: FontDefinition, text: string, x: number, y: number): void {
		const image = font.image;

		for (let i = 0, cx = x; i < text.length; i++) {
			const char = font.characterInfo[text[i]];

			if (!char) {
				continue;
			}

			this._context.drawImage(
				image,
				char.x,
				char.y,
				char.width,
				char.height,
				cx + char.xOffset,
				y + char.yOffset,
				char.width,
				char.height
			);
			cx += char.xAdvance;
		}
	}

	textDimensions(
		font: FontDefinition,
		text: string
	): { width: number; height: number } {
		let width = 0;
		let height = 0;

		for (let i = 0; i < text.length; i++) {
			const char = font.characterInfo[text[i]];

			if (!char) {
				continue;
			}

			width += char.xAdvance;
			height = Math.max(height, char.height);
		}

		return { height, width };
	}

	image(image: CanvasImageSource, x: number, y: number) {
		this._context.drawImage(image, x, y);
	}

	clippedImage(
		image:
			| HTMLImageElement
			| SVGImageElement
			| HTMLVideoElement
			| HTMLCanvasElement
			| ImageBitmap
			| OffscreenCanvas,
		x: number,
		y: number,
		width: number,
		height: number
	): void {
		this._context.drawImage(
			image,
			0,
			0,
			width,
			height,
			x,
			y,
			width,
			height
		);
	}
}

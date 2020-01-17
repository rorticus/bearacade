import { FontDefinition, MenuGraphics } from "../interfaces";

export class CanvasMenuGraphics implements MenuGraphics {
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
}

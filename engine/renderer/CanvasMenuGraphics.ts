import { MenuGraphics } from "../interfaces";

export class CanvasMenuGraphics implements MenuGraphics {
	constructor(private _context: CanvasRenderingContext2D) {}

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
}

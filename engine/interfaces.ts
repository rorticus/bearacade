import { Engine } from "./Engine";

export interface Asset {
	name: string;
}

export interface ColorPalette {
	road: string;
	grass: string;
	rumble: string;
	lane: string;
}

export interface Camera {
	height: number;
	fieldOfView: number;
	depth: number;
}

export interface Coordinate {
	x: number;
	y: number;
	z: number;
}

export interface CharacterPlacement {
	x: number;
	y: number;
	width: number;
	height: number;
	xAdvance: number;
	xOffset: number;
	yOffset: number;
}

export interface FontDefinition {
	imageName: string;
	image?: CanvasImageSource;
	definition: string;
	characterInfo?: Record<string, CharacterPlacement>;
}

export interface MenuGraphics {
	rect(
		x: number,
		y: number,
		width: number,
		height: number,
		color: string
	): void;
	text(font: FontDefinition, text: string, x: number, y: number): void;
	textDimensions(font: FontDefinition, text: string): { width: number; height: number };
}

export interface Menu {
	initialize?(engine: Engine): void;
	update?(deltaInSeconds: number): void;
	render(graphics: MenuGraphics): void;
	isFullScreen?: boolean;
}

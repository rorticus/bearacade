import { Sound } from "../sound/Sound";

export class Mouse {
	mouseDown: boolean;
	mouseClick = false;
	wasMouseDown = false;
	private _initializedSound = false;

	constructor(sound: Sound) {
		window.addEventListener("mousedown", event => {
			this.mouseDown = true;
		});

		window.addEventListener("mouseup", event => {
			this.mouseDown = false;

			if (!this._initializedSound) {
				sound.initialize();
			}
		});
	}

	update() {
		this.mouseClick = !this.mouseDown && this.wasMouseDown;
		this.wasMouseDown = this.mouseDown;
	}
}

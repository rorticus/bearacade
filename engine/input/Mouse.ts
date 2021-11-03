import { Sound } from "../sound/Sound";

export class Mouse {
	mouseDown: boolean;
	mouseClick = false;

	mouseLeftDown = false;
	mouseRightDown = false;

	mouseLeftClick = false;
	mouseRightClick = false;

	wasMouseDown = false;
	wasMouseLeftDown = false;
	wasMouseRightDown = false;

	private _initializedSound = false;

	constructor(sound: Sound) {
		document.addEventListener('pointerdown', () => {}); // in iframe

		window.addEventListener("pointerdown", event => {
			this.mouseDown = true;
			const third = window.innerWidth / 3;

			this.mouseLeftDown = event.clientX < third;
			this.mouseRightDown = event.clientX > window.innerWidth - third;
		});

		window.addEventListener("pointerup", event => {
			this.mouseDown = false;
			this.mouseLeftDown = false;
			this.mouseRightDown = false;

			if (!this._initializedSound) {
				sound.initialize();
			}
		});
	}

	update() {
		this.mouseClick = !this.mouseDown && this.wasMouseDown;
		this.wasMouseDown = this.mouseDown;

		this.mouseLeftClick = !this.mouseLeftDown && this.wasMouseLeftDown;
		this.mouseRightClick = !this.mouseRightDown && this.wasMouseRightDown;

		this.wasMouseLeftDown = this.mouseLeftDown;
		this.wasMouseRightDown = this.mouseRightDown;
	}
}

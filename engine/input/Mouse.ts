export class Mouse {
	mouseDown: boolean;

	constructor() {
		window.addEventListener("mousedown", event => {
			this.mouseDown = true;
		});

		window.addEventListener("mouseup", event => {
			this.mouseDown = false;
		});
	}
}

export class Keyboard {
	leftKey = false;
	rightKey = false;
	upKey = false;
	downKey = false;
	enter = false;
	escape = false;
	anyKey = false;

	constructor() {
		window.addEventListener("keydown", event => {
			this.anyKey = true;

			if (event.keyCode === 37) {
				this.leftKey = true;
			} else if (event.keyCode === 39) {
				this.rightKey = true;
			} else if (event.keyCode === 38) {
				this.upKey = true;
			} else if (event.keyCode === 40) {
				this.downKey = true;
			} else if (event.keyCode === 13) {
				this.enter = true;
			} else if (event.keyCode === 27) {
				this.escape = true;
			}
		});

		window.addEventListener("keyup", event => {
			this.anyKey = false;

			if (event.keyCode === 37) {
				this.leftKey = false;
			} else if (event.keyCode === 39) {
				this.rightKey = false;
			} else if (event.keyCode === 38) {
				this.upKey = false;
			} else if (event.keyCode === 40) {
				this.downKey = false;
			} else if (event.keyCode === 13) {
				this.enter = false;
			} else if (event.keyCode === 27) {
				this.escape = true;
			}
		});
	}
}

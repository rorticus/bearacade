export class Keyboard {
	leftKey = false;
	rightKey = false;
	upKey = false;
	downKey = false;
	enter = false;
	escape = false;
	anyKey = false;
	space = false;

	lastEnter = false;
	lastEscape = false;
	lastSpace = false;

	spaceClick = false;
	enterClick = false;
	escapeClick = false;

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
			} else if (event.keyCode === 32) {
				this.space = true;
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
				this.escape = false;
			} else if (event.keyCode === 32) {
				this.space = false;
			}
		});
	}

	update() {
		this.spaceClick = this.space && !this.lastSpace;
		this.enterClick = this.enter && !this.lastEnter;
		this.escapeClick = this.escape && !this.lastEscape;

		this.lastSpace = this.space;
		this.lastEnter = this.enter;
		this.lastEscape = this.escape;
	}
}

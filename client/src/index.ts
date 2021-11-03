import { Game } from "./game/Game";

const mountPoint = document.getElementById("app");
const canvas = document.createElement("canvas");
canvas.width = 320;
canvas.height = 240;

canvas.style.imageRendering = "optimizeSpeed";
canvas.id = "game";
canvas.classList.add("main");

function resizeAndPositionCanvas() {
	const maxWidth = 640;
	const maxHeight = 480;

	const windowWidth = window.innerWidth;
	const windowHeight = window.innerHeight;

	let width = 0;
	let height = 0;

	if (windowWidth > windowHeight) {
		height = Math.min(maxHeight, windowHeight);
		width = (320 / 240) * height;
	} else {
		width = Math.min(maxWidth, windowWidth);
		height = (240 / 320) * width;
	}

	canvas.style.width = `${Math.floor(width)}px`;
	canvas.style.height = `${Math.floor(height)}px`;
}

resizeAndPositionCanvas();

window.addEventListener("resize", () => {
	resizeAndPositionCanvas();
});

mountPoint.innerHTML = "";
mountPoint.appendChild(canvas);

// if(document.fullscreenEnabled || document.webkitFullscreenEnabled) {
// 	const fullScreenButton = document.createElement("button");
// 	fullScreenButton.style.width = "32px";
// 	fullScreenButton.style.height = "32px";
// 	fullScreenButton.style.position = "absolute";
// 	fullScreenButton.style.top = "0";
// 	fullScreenButton.style.left = "0";
//
// 	fullScreenButton.addEventListener("click", (ev) => {
// 		ev.stopPropagation();
// 		ev.preventDefault();
// 		ev.cancelBubble = true;
//
// 		if (document.fullscreenElement) {
// 			document.exitFullscreen ? document.exitFullscreen() : document.webkitExitFullscreen();
// 		} else {
// 			mountPoint.requestFullscreen ? mountPoint.requestFullscreen() : mountPoint.webkitRequestFullscreen();
// 		}
// 	});
//
// 	mountPoint.appendChild(fullScreenButton);
// }

const fpsDisplay = document.createElement("div");
mountPoint.appendChild(fpsDisplay);

const game = new Game({
	mountPoint: canvas,
	clientId: location.hash.substr(1),
	fpsUpdated: fps => (fpsDisplay.innerText = String(fps))
});

(async function() {
	await game.start();
})();

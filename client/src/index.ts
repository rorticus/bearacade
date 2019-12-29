import { Game } from "./game/Game";

const mountPoint = document.getElementById("app");
const canvas = document.createElement("canvas");
canvas.width = 320;
canvas.height = 240;

canvas.style.width = "1024px";
canvas.style.height = "768px";
canvas.style.imageRendering = "optimizeSpeed";
canvas.classList.add("main");

mountPoint.innerHTML = "";
mountPoint.appendChild(canvas);

const game = new Game({
	mountPoint: canvas,
	clientId: location.hash.substr(1)
});

(async function() {
	await game.start();
})();

import {Engine} from "./engine/Engine";
import {Game} from "./game/Game";

const mountPoint = document.getElementById('app');
const canvas = document.createElement('canvas');
canvas.width = 640;
canvas.height = 480;

canvas.classList.add('main');

mountPoint.innerHTML = '';
mountPoint.appendChild(canvas);

const game = new Game({
    mountPoint: canvas,
    clientId: location.hash.substr(1)
});

(async function () {
    await game.start();
})();

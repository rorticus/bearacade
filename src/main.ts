import {Game} from './Game';

const canvas = document.createElement('canvas');
canvas.width = 640;
canvas.height = 480;

document.body.appendChild(canvas);

const game = new Game();

game.context = canvas.getContext("2d") as CanvasRenderingContext2D;

game.start();
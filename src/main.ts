import {Game} from './Game';
import './assets/main.css';

const canvas = document.getElementById('game') as HTMLCanvasElement;

const game = new Game();

game.context = canvas.getContext("2d") as CanvasRenderingContext2D;

game.start();
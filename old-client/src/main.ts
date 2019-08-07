import {Game} from './Game';
import './assets/main.css';
import {Api} from "./Api";

const canvas = document.getElementById('game') as HTMLCanvasElement;

const game = new Game();
game.context = canvas.getContext("2d") as CanvasRenderingContext2D;

const api = new Api(document.location.origin.replace(document.location.protocol, 'ws:'));

const matches = document.location.hash.match('#session=(.*)');
if (matches) {
    const sessionId = matches[1];

    api.connect(sessionId).then(() => {
        game.onEnd = () => {
            api.postScore(game.points);
        };
        game.start();
    });
} else {
}



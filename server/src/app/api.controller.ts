import {Controller, Get, Post} from "@nestjs/common";
import {DatabaseService} from "./database.service";

@Controller('api')
export class ApiController {
    constructor(private _databaseService: DatabaseService) {
    }

    @Get('highscores')
    getHighScores() {
        return this._databaseService.getHighScores();
    }

    @Post('highscores')
    addHighscore() {
        this._databaseService.addHighScore({
            name: 'me',
            score: 125
        });
    }
}
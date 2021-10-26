import { Body, Controller, Get, Post } from "@nestjs/common";
import { DatabaseService } from "./database.service";
import { SessionService } from "./session.service";

@Controller("api")
export class ApiController {
	constructor(
		private _databaseService: DatabaseService,
		private _sessionService: SessionService
	) {}

	// @Get("highscores")
	// getHighScores() {
	// 	return this._databaseService.getHighScores();
	// }

	// @Post("highscores")
	// addHighscore() {
	// 	this._databaseService.addHighScore({
	// 		name: "me",
	// 		score: 125
	// 	});
	// }
	//
	// @Post("session")
	// async createSession(@Body() data: any) {
	// 	return this._sessionService.createSession({
	// 		userId: data.userId,
	// 		userName: data.userName,
	// 		responseUrl: data.responseUrl
	// 	});
	// }
}

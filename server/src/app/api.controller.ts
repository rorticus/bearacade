import { Body, Controller, Get, Param, Post, Query } from "@nestjs/common";
import { DatabaseService } from "./database.service";
import { SessionService } from "./session.service";

@Controller("api")
export class ApiController {
	constructor(
		private _databaseService: DatabaseService,
		private _sessionService: SessionService
	) {}

	@Get("highscores")
	getHighScores(@Query("teamId") teamId: string) {
		return this._databaseService.getHighScores(teamId);
	}

	@Get("highscores-add")
	addHighScore(@Query("teamId") teamId: string) {
		this._databaseService.addHighScore(teamId, {
			name: "me",
			score: 125
		});
	}

	@Get("highscores-remove")
	removeHighScore(
		@Query("teamId") teamId: string,
		@Query("name") name: string,
		@Query("score") score: string
	) {
		const scores = this._databaseService.removeHighScore(teamId, {
			name,
			score: parseInt(score)
		});

		return scores;
	}
}

import { Controller, Get, Param } from "@nestjs/common";
import { SessionService } from "./session.service";
import { DatabaseService } from "./database.service";

@Controller("app")
export class AppController {
	constructor(
		private _sessionService: SessionService,
		private _databaseService: DatabaseService
	) {}

	@Get("health")
	health() {
		return {
			ok: true
		};
	}

	@Get("remove-highscore")
	removeHighScore(
		@Param() teamId: string,
		@Param() name: string,
		@Param() score: string
	) {
		const scores = this._databaseService.removeHighScore(teamId, {
			name,
			score: parseInt(score)
		});

		return scores;
	}
}

import { Injectable } from "@nestjs/common";
import { JsonDB } from "node-json-db";
import { Config } from "node-json-db/dist/lib/JsonDBConfig";
import { HighScore } from "../interfaces";

@Injectable()
export class DatabaseService {
	private _db: JsonDB;

	constructor() {
		this._db = new JsonDB(
			new Config(process.env.DB || "/tmp/bearacade", true, true)
		);
	}

	getHighScores(): HighScore[] {
		try {
			return this._db.getData("/highscores") || [];
		} catch (e) {
			return [];
		}
	}

	addHighScore(score: HighScore) {
		const scores = [...this.getHighScores(), score].sort((s1, s2) =>
			s1.score < s2.score ? 1 : -1
		);

		this._db.push("/highscores", scores.slice(0, 10), true);
	}
}

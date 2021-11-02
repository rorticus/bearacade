import { Injectable } from "@nestjs/common";
import { JsonDB } from "node-json-db";
import { Config } from "node-json-db/dist/lib/JsonDBConfig";
import { HighScore } from "../interfaces";

@Injectable()
export class DatabaseService {
	private _getDb(): JsonDB {
		const db = new JsonDB(
			new Config(process.env.DB || "/tmp/bearacade", true, true)
		);

		return db;
	}

	getHighScores(teamId: string): HighScore[] {
		try {
			return this._getDb().getData(`/highscores/${teamId}`) || [];
		} catch (e) {
			return [];
		}
	}

	addHighScore(teamId: string, score: HighScore) {
		const scores = [...this.getHighScores(teamId), score].sort((s1, s2) =>
			s1.score < s2.score ? 1 : -1
		);

		const db = this._getDb();

		db.push(`/highscores/${teamId}`, scores.slice(0, 250), true);
		db.save();
	}

	removeHighScore(teamId: string, score: HighScore) {
		const scores = this.getHighScores(teamId).filter(
			s => !(s.score === score.score && s.name === score.name)
		);

		const db = this._getDb();

		db.push(`/highscores/${teamId}`, scores, true);
		db.save();

		return scores;
	}
}

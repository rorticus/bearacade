import { Injectable } from "@nestjs/common";
import { JsonDB } from "node-json-db";
import { Config } from "node-json-db/dist/lib/JsonDBConfig";
import { HighScore } from "../interfaces";

@Injectable()
export class DatabaseService {
	private _dbs: Map<string, JsonDB>;

	private _getDb(teamId: string): JsonDB {
		if (this._dbs.has(teamId)) {
			return this._dbs.get(teamId) as JsonDB;
		}

		const db = new JsonDB(
			new Config(process.env.DB || "/tmp/bearacade" + teamId, true, true)
		);

		this._dbs.set(teamId, db);

		return db;
	}

	constructor() {
		this._dbs = new Map();
	}

	getHighScores(teamId: string): HighScore[] {
		try {
			return this._getDb(teamId).getData("/highscores") || [];
		} catch (e) {
			return [];
		}
	}

	addHighScore(teamId: string, score: HighScore) {
		const scores = [...this.getHighScores(teamId), score].sort((s1, s2) =>
			s1.score < s2.score ? 1 : -1
		);

		this._getDb(teamId).push("/highscores", scores.slice(0, 10), true);
	}
}

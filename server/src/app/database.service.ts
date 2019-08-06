import {Injectable} from "@nestjs/common";
import { JsonDB } from 'node-json-db';
import { Config } from 'node-json-db/dist/lib/JsonDBConfig';
import {HighScore} from "../interfaces";

@Injectable()
export class DatabaseService {
    private _db: JsonDB;

    constructor() {
        this._db = new JsonDB(new Config(process.env.DB || '/tmp/bearacade', true, true));
    }

    getHighScores(): HighScore[] {
        try {
            return this._db.getData('/highscores') || [];
        } catch (e) {
            return [];
        }
    }

    addHighScore(score: HighScore) {
        this._db.push('/highscores[]', score, true);
    }
}
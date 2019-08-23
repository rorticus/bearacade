import {Injectable} from "@nestjs/common";
import uuid = require("uuid");

export interface Session {
    id: string;
    createdDate: Date;
    userId: string;
    userName: string;
    responseUrl: string;
    connectionId?: string;
}

export interface CreateSessionOptions {
    userId: string;
    userName: string;
    responseUrl: string;
}

@Injectable()
export class SessionService {
    private _sessions = new Map<string, Session>();

    createSession({userId, userName, responseUrl}: CreateSessionOptions) {
        const sessionId = uuid();

        const session: Session = {
            id: sessionId,
            createdDate: new Date(),
            userId,
            userName,
            responseUrl
        };

        this._sessions.set(sessionId, session);

        return session;
    }

    findSessionById(sessionId: string): Session | undefined {
        return this._sessions.get(sessionId);
    }

    findSessionByConnectionId(connectionId: string): Session | undefined {
        return Array.from(this._sessions.values()).find(session => session.connectionId === connectionId);
    }

    deleteById(sessionId: string) {
        this._sessions.delete(sessionId);
    }
}
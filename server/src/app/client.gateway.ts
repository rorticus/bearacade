import {
	OnGatewayConnection,
	OnGatewayDisconnect,
	SubscribeMessage,
	WebSocketGateway,
	WebSocketServer,
	WsResponse
} from "@nestjs/websockets";
import uuid from "uuid";
import { SessionService } from "./session.service";
import { SlackService } from "./slack.service";
import { Logger } from "@nestjs/common";
import { Client, Server } from "socket.io";
import { DatabaseService } from "./database.service";

type ClientWithConnection = Client & { connectionId: string };

@WebSocketGateway({
	path: "/ws",
	origins: "*"
})
export class ClientGateway implements OnGatewayConnection, OnGatewayDisconnect {
	private readonly _logger = new Logger(ClientGateway.name);

	constructor(
		private _sessionService: SessionService,
		private _slackService: SlackService,
		private _databaseService: DatabaseService
	) {
		this._logger.log("Initialized client gateway");
	}

	@SubscribeMessage("connect")
	protected onConnect(
		client: ClientWithConnection,
		{ sessionId }: { sessionId: string }
	) {
		this._logger.log(`Received connection request for ${sessionId}`);
		const session = this._sessionService.findSessionById(sessionId);
		if (session) {
			session.connectionId = client.connectionId;
			return { event: "play" };
		}
	}

	@SubscribeMessage("high-score")
	protected onHighScore(
		client: ClientWithConnection,
		{
			sessionId,
			score,
			packet
		}: { sessionId: string; score: number; packet: number }
	) {
		this._logger.log(`Received high score request for ${sessionId}`);
		const session = this._sessionService.findSessionByConnectionId(
			client.connectionId
		);

		if (session) {
			this._databaseService.addHighScore({
				score,
				name: session.userName
			});

			return {
				event: "high-scores",
				data: this._databaseService.getHighScores(),
				packet
			};
		}

		return {
			event: "high-scores",
			data: [
				{
					name: "rory",
					score: 60000
				},
				{
					name: "shawn mulligan",
					score: 908545
				}
			],
			packet
		};
	}

	handleConnection(client: ClientWithConnection): any {
		client.connectionId = uuid();
		this._logger.log(`Established connection with ${client.connectionId}`);
	}

	async handleDisconnect(client: any): Promise<void> {
		const session = this._sessionService.findSessionByConnectionId(
			client.connectionId
		);

		if (session) {
			await this._slackService.sendMessage(session.responseUrl, {
				text: `${session.userName} decided to _really_ help his teammates out by *quitting*. Thanks ${session.userName}!`
			});

			await this._sessionService.deleteById(session.id);
		}

		this._logger.log(`Lost connection with ${client.connectionId}`);
	}
}
